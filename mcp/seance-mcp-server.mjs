#!/usr/bin/env node
// seance-mcp-server.mjs — Gate 3: a zero-dependency stdio MCP server that
// exposes the séance to ANY agent (bidirectional MCP: the machine is haunted
// by whatever agent is invited). Tools operate on one loaded cartridge.
//   inspect_artifact      -> Coroner autopsy of the loaded artifact bytes
//   read_vm_memory        -> bytes at [address, address+length)
//   search_memory_strings -> printable runs matching a query
//   verify_ghost_claim    -> run a claim through the Exorcist Gate
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { inspectBytes } from "../src/coroner/static-inspector.ts";
import { GlassVm } from "../src/vm/glass-vm.ts";
import { Ledger } from "../src/core/ledger.ts";
import { validateClaimAgainstSnapshot } from "../src/core/validator.ts";
import { telemetry } from "../src/cartridges/telemetry.ts";

const CART = process.argv[2] === "crypt-keeper" ? (await import("../src/cartridges/crypt-keeper.ts")).cryptKeeper
  : process.argv[2] === "hypernote" ? (await import("../src/cartridges/hypernote.ts")).hypernote
  : telemetry;

const vm = new GlassVm(CART.program, 0x0200, CART.input);
for (const p of CART.data) vm.mem.set(p.bytes, p.addr);
vm.run(5000);
const artifactBytes = new Uint8Array([...CART.program, ...CART.data.flatMap((d) => [...d.bytes])]);
const autopsy = inspectBytes(artifactBytes);
const snapshotHash = vm.snapshotHash();

const TOOLS = [
  { name: "inspect_artifact", description: `Static autopsy of the loaded artifact (${CART.id}). Returns format, entropy, strings, findings.`,
    inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "read_vm_memory", description: "Read bytes from the machine's memory snapshot.",
    inputSchema: { type: "object", properties: { address: { type: "integer", minimum: 0, maximum: 4095 }, length: { type: "integer", minimum: 1, maximum: 256 } }, required: ["address", "length"] } },
  { name: "search_memory_strings", description: "Search printable strings in memory for a query (case-insensitive).",
    inputSchema: { type: "object", properties: { query: { type: "string", minLength: 1 } }, required: ["query"] } },
  { name: "verify_ghost_claim", description: "Run a claim through the Exorcist Gate against the current snapshot. Claims citing nonexistent evidence are intercepted.",
    inputSchema: { type: "object", properties: { claimId: { type: "string" }, text: { type: "string" }, status: { type: "string", enum: ["verified", "inferred", "unknown"] }, evidenceIds: { type: "array", items: { type: "string" } } }, required: ["claimId", "text", "status", "evidenceIds"] } },
];

// The gate's ledger is built from the cartridge's own build-time séance:
// every evidence address is read from the LIVE snapshot, so receipts are real.
const ledger = new Ledger();
for (const entry of CART.ledger) {
  for (const ev of entry.evidence) {
    const bytes = vm.mem.slice(ev.addr, ev.addr + ev.len);
    ledger.addEvidence({
      sourceType: "memory", artifactHash: autopsy.artifactHash, snapshotHash,
      location: { kind: "memoryAddress", value: `0x${ev.addr.toString(16)}` },
      rawBytes: [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(""),
      asciiPreview: [...bytes].map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ".")).join(""),
      interpretation: ev.interpretation, confidence: "direct",
      createdAt: "build-time", tool: "build-time-seance",
      byteStart: ev.addr, byteEnd: ev.addr + ev.len,
    });
  }
}

function toolCall(name, args) {
  if (name === "inspect_artifact") {
    return { format: autopsy.format, entropy: autopsy.entropy, size: autopsy.size,
      strings: autopsy.strings.slice(0, 16), findings: autopsy.findings, artifactHash: autopsy.artifactHash };
  }
  if (name === "read_vm_memory") {
    const { address, length } = args;
    if (address < 0 || address + length > 4096) {
      return { error: `OUT_OF_BOUNDS: [${address},${address + length}) beyond 4096` };
    }
    const bytes = vm.mem.slice(address, address + length);
    return { address, snapshotHash, hex: [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(" "),
      ascii: [...bytes].map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ".")).join("") };
  }
  if (name === "search_memory_strings") {
    const q = String(args.query).toLowerCase();
    const hits = [];
    let start = -1;
    for (let i = 0; i <= 4096 && hits.length < 20; i++) {
      const b = i < 4096 ? vm.mem[i] : 0;
      const p = b >= 32 && b < 127;
      if (p && start < 0) start = i;
      if (!p && start >= 0) {
        if (i - start >= 4) {
          const s = [...vm.mem.slice(start, i)].map((c) => String.fromCharCode(c)).join("");
          if (s.toLowerCase().includes(q)) hits.push({ offset: start, text: s });
        }
        start = -1;
      }
    }
    return { query: args.query, hits };
  }
  if (name === "verify_ghost_claim") {
    const claim = { id: String(args.claimId), text: String(args.text), status: args.status,
      evidenceIds: args.evidenceIds, createdAt: "mcp-session" };
    if (args.status === "inferred" && !claim.inferenceStep) claim.inferenceStep = "unspecified";
    const r = validateClaimAgainstSnapshot(claim, ledger, { hash: snapshotHash, artifactHash: autopsy.artifactHash, bytes: vm.mem });
    return r.ok ? { verdict: "PASSED", status: args.status, evidenceIds: args.evidenceIds }
      : { verdict: "INTERCEPTED", receipt: r.receipt };
  }
  return { error: `unknown tool: ${name}` };
}

let buf = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buf += chunk;
  let idx;
  while ((idx = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.method === "initialize") {
      reply(msg.id, { protocolVersion: msg.params?.protocolVersion ?? "2025-03-26",
        capabilities: { tools: {} }, serverInfo: { name: "seance-mcp-server", version: "0.1.0" } });
    } else if (msg.method === "tools/list") {
      reply(msg.id, { tools: TOOLS });
    } else if (msg.method === "tools/call") {
      const { name, arguments: args } = msg.params ?? {};
      reply(msg.id, { content: [{ type: "text", text: JSON.stringify(toolCall(name, args ?? {}), null, 2) }] });
    } else if (msg.method === "ping") {
      reply(msg.id, {});
    } else if (msg.id !== undefined && msg.id !== null) {
      reply(msg.id, { error: { code: -32601, message: `method not found: ${msg.method}` } });
    }
  }
});

function reply(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}
void readFileSync; void spawnSync; // reserved: artifact-from-path loading
