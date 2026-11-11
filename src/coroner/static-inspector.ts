// static-inspector.ts — the Coroner's autopsy table.
// Deterministic, offline, format-lenient: real files are often broken, and
// broken bytes are exactly what a séance is for. Findings cite file offsets.
import { sha256Hex } from "../core/hash.ts";

export interface Finding {
  kind: string; // "png-text" | "zip-comment" | "zip-entry" | "magic" | "hot-region"
  label: string;
  detail: string;
  offset?: number;
  byteLen?: number;
}

export interface Autopsy {
  artifactHash: string;
  size: number;
  format: string; // "PNG" | "ZIP" | "text" | "raw"
  magic: string | null;
  entropy: number; // bits/byte, 0..8
  strings: Array<{ offset: number; text: string }>; // printable runs >= 4
  findings: Finding[];
}

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const TEXT_CHUNKS = new Set(["tEXt", "zTXt", "iTXt"]);

export function inspectBytes(bytes: Uint8Array): Autopsy {
  const artifactHash = sha256Hex(bytes);
  const format = detectFormat(bytes);
  const strings = extractStrings(bytes);
  const findings: Finding[] = [];

  if (format === "PNG") findings.push(...pngTextChunks(bytes));
  if (format === "ZIP") findings.push(...zipComments(bytes));
  if (strings.length > 0 && format === "raw") {
    findings.push({
      kind: "hot-region", label: "readable traces",
      detail: `${strings.length} readable string(s) survive in this file`,
      offset: strings[0]!.offset,
    });
  }

  return {
    artifactHash, size: bytes.length, format,
    magic: bytes.length >= 4 ? [...bytes.slice(0, 4)].map((b) => b.toString(16).padStart(2, "0")).join(" ") : null,
    entropy: shannon(bytes),
    strings, findings,
  };
}

function detectFormat(b: Uint8Array): string {
  if (b.length >= 8 && PNG_SIG.every((v, i) => b[i] === v)) return "PNG";
  if (b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b) return "ZIP";
  const printable = [...b].filter((c) => c >= 32 && c < 127 || c === 9 || c === 10 || c === 13).length;
  return printable > b.length * 0.85 ? "text" : "raw";
}

function extractStrings(b: Uint8Array, minRun = 4, cap = 64): Array<{ offset: number; text: string }> {
  const out: Array<{ offset: number; text: string }> = [];
  let start = -1;
  for (let i = 0; i <= b.length; i++) {
    const printable = i < b.length && b[i]! >= 32 && b[i]! < 127;
    if (printable && start < 0) start = i;
    if (!printable && start >= 0) {
      if (i - start >= minRun) {
        out.push({ offset: start, text: String.fromCharCode(...b.slice(start, i)) });
        if (out.length >= cap) break;
      }
      start = -1;
    }
  }
  return out;
}

function shannon(b: Uint8Array): number {
  if (b.length === 0) return 0;
  const hist = new Uint32Array(256);
  for (const c of b) hist[c]!++;
  let h = 0;
  for (const n of hist) {
    if (n === 0) continue;
    const p = n / b.length;
    h -= p * Math.log2(p);
  }
  return Math.round(h * 100) / 100;
}

/** Walk PNG chunks leniently; extract human-readable text chunks. Broken CRCs
 *  and truncated files are tolerated — we report what survives. */
function pngTextChunks(b: Uint8Array): Finding[] {
  const out: Finding[] = [];
  let pos = 8;
  while (pos + 8 <= b.length && out.length < 32) {
    const dv = new DataView(b.buffer, b.byteOffset + pos, 8);
    const len = dv.getUint32(0, false);
    const type = String.fromCharCode(b[pos + 4]!, b[pos + 5]!, b[pos + 6]!, b[pos + 7]!);
    if (len > b.length - pos - 12) {
      out.push({ kind: "hot-region", label: `truncated ${type} chunk`, detail: `declares ${len} bytes but the file ends early`, offset: pos });
      break;
    }
    if (TEXT_CHUNKS.has(type)) {
      const data = b.slice(pos + 8, pos + 8 + len);
      const text = String.fromCharCode(...data).replace(/\0/g, " · ");
      out.push({ kind: "png-text", label: `${type} text survives`, detail: text.trim() || "(empty)", offset: pos + 8, byteLen: len });
    }
    pos += 12 + len;
    if (type === "IEND") break;
  }
  return out;
}

/** Find the end-of-central-directory record; extract its comment and entries. */
function zipComments(b: Uint8Array): Finding[] {
  const out: Finding[] = [];
  for (let i = b.length - 22; i >= 0 && i > b.length - 65558; i--) {
    if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 0x05 && b[i + 3] === 0x06) {
      const dv = new DataView(b.buffer, b.byteOffset + i, 22);
      const entries = dv.getUint16(10, true);
      const commentLen = dv.getUint16(20, true);
      if (commentLen > 0 && i + 22 + commentLen <= b.length) {
        const comment = String.fromCharCode(...b.slice(i + 22, i + 22 + commentLen));
        out.push({ kind: "zip-comment", label: "archive comment survives", detail: comment, offset: i + 22, byteLen: commentLen });
      }
      out.push({ kind: "zip-entry", label: `${entries} archived item(s)`, detail: `central directory at 0x${i.toString(16)}`, offset: i });
      break;
    }
  }
  return out;
}
