// coroner.test.ts — the Coroner must find what is really in the bytes,
// never invent, and never crash on broken files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectBytes } from "../src/coroner/static-inspector.ts";
import { sha256Hex } from "../src/core/hash.ts";
import { Ledger } from "../src/core/ledger.ts";
import { validateClaimAgainstSnapshot, type Snapshot } from "../src/core/validator.ts";

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  new DataView(out.buffer).setUint32(0, data.length, false);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  return out;
}

function asciiBytes(s: string): Uint8Array {
  return new Uint8Array([...s].map((c) => c.charCodeAt(0)));
}

function makePngWithText(): Uint8Array {
  const sig = new Uint8Array(PNG_SIG);
  const ihdr = pngChunk("IHDR", new Uint8Array(13));
  const textData = new Uint8Array([...asciiBytes("Author\0Ophelia Vane, 1991"), 0x1a]);
  const textChunk = pngChunk("tEXt", textData);
  const iend = pngChunk("IEND", new Uint8Array(0));
  const out = new Uint8Array(sig.length + ihdr.length + textChunk.length + iend.length);
  out.set(sig, 0);
  out.set(ihdr, sig.length);
  out.set(textChunk, sig.length + ihdr.length);
  out.set(iend, sig.length + ihdr.length + textChunk.length);
  return out;
}

test("PNG tEXt findings carry real file offsets (the séance voice)", () => {
  const png = makePngWithText();
  const a = inspectBytes(png);
  assert.equal(a.format, "PNG");
  const texts = a.findings.filter((f) => f.kind === "png-text");
  assert.equal(texts.length, 1);
  assert.ok(texts[0]!.detail.includes("Ophelia Vane, 1991"));
  // The cited offset must actually point at the text bytes in the file:
  const off = texts[0]!.offset!;
  const cited = String.fromCharCode(...png.slice(off, off + 6));
  assert.equal(cited, "Author");
});

test("corrupted PNG (truncated chunk) is reported honestly, never crashes", () => {
  const png = makePngWithText().slice(0, 30); // cut inside tEXt
  const a = inspectBytes(png);
  assert.equal(a.format, "PNG");
  assert.ok(a.findings.some((f) => f.kind === "hot-region" && f.label.includes("truncated")));
});

test("ZIP comment is recovered from the end-of-central-directory", () => {
  const body = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4]);
  const comment = asciiBytes("SIGNED: W. Halloway, October 1993");
  const eocd = new Uint8Array(22 + comment.length);
  eocd.set([0x50, 0x4b, 0x05, 0x06], 0);
  new DataView(eocd.buffer).setUint16(20, comment.length, true);
  eocd.set(comment, 22);
  const zip = new Uint8Array(body.length + eocd.length);
  zip.set(body, 0);
  zip.set(eocd, body.length);
  const a = inspectBytes(zip);
  assert.equal(a.format, "ZIP");
  const c = a.findings.find((f) => f.kind === "zip-comment");
  assert.ok(c && c.detail.includes("W. Halloway"));
});

test("raw binaries yield strings with offsets; text files are detected", () => {
  const raw = new Uint8Array(64).fill(0xab);
  raw.set(asciiBytes("GHOST ROOM 2F"), 20);
  const a = inspectBytes(raw);
  assert.equal(a.format, "raw");
  assert.ok(a.strings.some((s) => s.text.includes("GHOST ROOM 2F") && s.offset === 20));
  assert.ok(a.entropy > 0 && a.entropy < 8);
  const txt = inspectBytes(asciiBytes("dear diary, the tape still smells like 1994\n"));
  assert.equal(txt.format, "text");
});

test("autopsy evidence survives the exorcism gate (offsets are checkable)", () => {
  const png = makePngWithText();
  const a = inspectBytes(png);
  const f = a.findings.find((x) => x.kind === "png-text")!;
  const start = f.offset!;
  const end = start + (f.byteLen ?? 1);
  const l = new Ledger();
  const ev = l.addEvidence({
    sourceType: "file", artifactHash: a.artifactHash,
    location: { kind: "fileOffset", value: `offset:${start}` },
    rawBytes: [...png.slice(start, end)].map((b) => b.toString(16).padStart(2, "0")).join(""),
    asciiPreview: f.detail.slice(0, 20), interpretation: f.label,
    confidence: "direct", createdAt: "2026-11-12T00:00:00Z", tool: "coroner",
    byteStart: start, byteEnd: end,
  });
  const snap: Snapshot = { hash: "file-snap", artifactHash: a.artifactHash, bytes: png };
  const claim = { id: "C-001", text: f.detail, status: "verified" as const, evidenceIds: [ev.id], createdAt: "" };
  assert.equal(validateClaimAgainstSnapshot(claim, l, snap).ok, true);
  // And a lie about the bytes is caught:
  const lie = { id: "C-002", text: "forged", status: "verified" as const, evidenceIds: [ev.id], createdAt: "" };
  const tampered = Uint8Array.from(png);
  tampered[start] = 0x00;
  assert.equal(validateClaimAgainstSnapshot(lie, l, { ...snap, bytes: tampered }).ok, false);
  assert.equal(a.artifactHash, sha256Hex(png));
});
