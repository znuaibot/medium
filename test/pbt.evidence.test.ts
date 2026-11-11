// pbt.evidence.test.ts — property-based tests for the evidence kernel.
// These run 1000 randomized cases per property. PBT is evidence of
// correctness, not a proof; counterexamples found here are archived.
import { test } from "node:test";
import fc from "fast-check";
import assert from "node:assert/strict";
import { sha256Hex } from "../src/core/hash.ts";
import { Ledger } from "../src/core/ledger.ts";
import { validateClaimAgainstSnapshot, type Snapshot } from "../src/core/validator.ts";

const MEM = 4096;
const artHash = sha256Hex("artifact");
const snapHash = sha256Hex("snapshot");

function buildSnapshot(bytes: Uint8Array): Snapshot {
  return { hash: snapHash, artifactHash: artHash, bytes };
}

const memBytesArb = fc.uint8Array({ minLength: MEM, maxLength: MEM });
const addrArb = fc.integer({ min: 0, max: MEM - 1 });
const lenArb = fc.integer({ min: 1, max: 64 });
const hexStrArb = fc.stringMatching(/^[0-9a-f]{0,32}$/);

function evidenceFor(bytes: Uint8Array, start: number, len: number) {
  const slice = bytes.slice(start, start + len);
  const hex = [...slice].map((b) => b.toString(16).padStart(2, "0")).join("");
  let ascii = "";
  for (const b of slice) ascii += b >= 32 && b < 127 ? String.fromCharCode(b) : ".";
  return {
    sourceType: "memory" as const, artifactHash: artHash, snapshotHash: snapHash,
    location: { kind: "memoryAddress" as const, value: `0x${start.toString(16)}` },
    rawBytes: hex, asciiPreview: ascii, interpretation: "pbt observation",
    confidence: "direct" as const, createdAt: "2026-11-12T00:00:00Z", tool: "pbt",
    byteStart: start, byteEnd: start + len,
  };
}

test("P1: validator never throws, whatever the claim says (bounds safety)", () => {
  fc.assert(
    fc.property(memBytesArb, addrArb, lenArb, hexStrArb, (bytes, start, len, cited) => {
      const l = new Ledger();
      const ev = l.addEvidence({ ...evidenceFor(bytes, start, len), rawBytes: cited });
      const claim = { id: "C-P1", text: "pbt", status: "verified" as const, evidenceIds: [ev.id], createdAt: "" };
      const r = validateClaimAgainstSnapshot(claim, l, buildSnapshot(bytes));
      assert.ok(r.ok === true || r.ok === false);
    }),
    { numRuns: 1000 },
  );
});

test("P2: flipping any single observed byte breaks the evidence (tamper detection)", () => {
  fc.assert(
    fc.property(memBytesArb, addrArb, lenArb, fc.nat(7), (bytes, start, len, flipIdx) => {
      const l = new Ledger();
      const ev = l.addEvidence(evidenceFor(bytes, start, len));
      const tampered = Uint8Array.from(bytes);
      const pos = Math.min(start + (flipIdx % len), MEM - 1);
      tampered[pos] = (tampered[pos]! + 1) % 256;
      const claim = { id: "C-P2", text: "pbt", status: "verified" as const, evidenceIds: [ev.id], createdAt: "" };
      const r = validateClaimAgainstSnapshot(claim, l, buildSnapshot(tampered));
      assert.equal(r.ok, false, `tampered byte at ${pos} must invalidate evidence`);
    }),
    { numRuns: 1000 },
  );
});

test("P3: citing a nonexistent evidence id is always rejected", () => {
  fc.assert(
    fc.property(memBytesArb, fc.constant("E-404"), (bytes, ghost) => {
      const l = new Ledger();
      const claim = { id: "C-P3", text: "pbt", status: "verified" as const, evidenceIds: [ghost], createdAt: "" };
      const r = validateClaimAgainstSnapshot(claim, l, buildSnapshot(bytes));
      assert.equal(r.ok, false);
    }),
    { numRuns: 1000 },
  );
});

test("P4: ledger export/import round-trip is stable (hash preserved)", () => {
  fc.assert(
    fc.property(memBytesArb, addrArb, lenArb, (bytes, start, len) => {
      const l = new Ledger();
      l.addEvidence(evidenceFor(bytes, start, len));
      l.addClaim({ id: "C-P4", text: "pbt", status: "verified", evidenceIds: ["E-001"], createdAt: "" });
      const restored = Ledger.import(JSON.parse(JSON.stringify(l.export())));
      assert.equal(restored.digest(), l.digest());
    }),
    { numRuns: 1000 },
  );
});

test("P5: unknown status survives any evidence chaos (honesty is stable)", () => {
  fc.assert(
    fc.property(memBytesArb, fc.array(hexStrArb, { maxLength: 5 }), (bytes, ghostIds) => {
      const l = new Ledger();
      const claim = { id: "C-P5", text: "pbt", status: "unknown" as const, evidenceIds: ghostIds, createdAt: "" };
      const r = validateClaimAgainstSnapshot(claim, l, buildSnapshot(bytes));
      assert.equal(r.ok, true);
    }),
    { numRuns: 1000 },
  );
});

test("P6: same input yields the same verdict (deterministic gate)", () => {
  fc.assert(
    fc.property(memBytesArb, addrArb, lenArb, (bytes, start, len) => {
      const build = () => {
        const l = new Ledger();
        const ev = l.addEvidence(evidenceFor(bytes, start, len));
        const claim = { id: "C-P6", text: "pbt", status: "verified" as const, evidenceIds: [ev.id], createdAt: "" };
        return validateClaimAgainstSnapshot(claim, l, buildSnapshot(bytes));
      };
      assert.deepEqual(build(), build());
    }),
    { numRuns: 1000 },
  );
});
