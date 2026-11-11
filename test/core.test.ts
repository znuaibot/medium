// core.test.ts — unit tests for hash, ledger, validator (node:test, no deps)
import { test } from "node:test";
import assert from "node:assert/strict";
import { sha256Hex } from "../src/core/hash.ts";
import { Ledger } from "../src/core/ledger.ts";
import { validateClaimAgainstSnapshot, type Snapshot } from "../src/core/validator.ts";

test("sha256 known vectors", () => {
  assert.equal(
    sha256Hex(""),
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
  assert.equal(
    sha256Hex("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
  const long = "x".repeat(1_000_000);
  assert.equal(sha256Hex(long).length, 64);
  assert.equal(sha256Hex(long), sha256Hex(long));
});

test("ledger ids are sequential and collision-safe", () => {
  const l = new Ledger();
  const e1 = l.addEvidence({
    sourceType: "memory", artifactHash: "aa", snapshotHash: "ss",
    location: { kind: "memoryAddress", value: "0x0140" },
    rawBytes: "4845", asciiPreview: "HE", interpretation: "t", confidence: "direct",
    createdAt: "2026-11-12T00:00:00Z", tool: "test",
  });
  const e2 = l.addEvidence({
    sourceType: "file", artifactHash: "aa",
    location: { kind: "fileOffset", value: "offset:8" },
    rawBytes: "4c50", asciiPreview: "LP", interpretation: "t", confidence: "direct",
    createdAt: "2026-11-12T00:00:00Z", tool: "test",
  });
  assert.equal(e1.id, "E-001");
  assert.equal(e2.id, "E-002");
  assert.throws(() => l.addClaim({ id: "C-001", text: "a", status: "unknown", evidenceIds: [], createdAt: "" }) && l.addClaim({ id: "C-001", text: "b", status: "unknown", evidenceIds: [], createdAt: "" }));
});

test("ledger export/import round-trip preserves everything", () => {
  const l = new Ledger();
  l.addEvidence({
    sourceType: "memory", artifactHash: "aa", snapshotHash: "ss",
    location: { kind: "memoryAddress", value: "0x0140" },
    rawBytes: "4845", asciiPreview: "HE", interpretation: "hidden help",
    confidence: "direct", createdAt: "2026-11-12T00:00:00Z", tool: "glassvm",
  });
  l.addClaim({ id: "C-001", text: "the game hides the word HE", status: "verified", evidenceIds: ["E-001"], createdAt: "2026-11-12T00:00:00Z" });
  const restored = Ledger.import(JSON.parse(JSON.stringify(l.export())));
  assert.deepEqual(restored.export(), l.export());
  assert.equal(restored.digest(), l.digest());
});

function makeSnapshot(bytes: number[], artifactHash = "art123"): Snapshot {
  const mem = new Uint8Array(4096);
  mem.set(bytes, 0x0140);
  return { hash: "snap1", artifactHash, bytes: mem };
}

const okEvidence = {
  sourceType: "memory" as const, artifactHash: "art123", snapshotHash: "snap1",
  location: { kind: "memoryAddress" as const, value: "0x0140" },
  rawBytes: "48454c50", asciiPreview: "HELP", interpretation: "HELP at 0x0140",
  confidence: "direct" as const, createdAt: "2026-11-12T00:00:00Z", tool: "glassvm",
  byteStart: 0x0140, byteEnd: 0x0144,
};

test("validator: verified claim with matching bytes passes", () => {
  const l = new Ledger();
  const ev = l.addEvidence(okEvidence);
  const claim = { id: "C-001", text: "HELP hides at 0x0140", status: "verified" as const, evidenceIds: [ev.id], createdAt: "" };
  const r = validateClaimAgainstSnapshot(claim, l, makeSnapshot([0x48, 0x45, 0x4c, 0x50]));
  assert.equal(r.ok, true);
});

test("validator: byte mismatch is intercepted (the exorcism works)", () => {
  const l = new Ledger();
  const ev = l.addEvidence(okEvidence);
  const claim = { id: "C-002", text: "HELP hides at 0x0140", status: "verified" as const, evidenceIds: [ev.id], createdAt: "" };
  const r = validateClaimAgainstSnapshot(claim, l, makeSnapshot([0x00, 0x00, 0x00, 0x00]));
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.receipt.code, "BYTE_MISMATCH");
});

test("validator: nonexistent evidence id is rejected", () => {
  const l = new Ledger();
  const claim = { id: "C-003", text: "ghost citation", status: "verified" as const, evidenceIds: ["E-999"], createdAt: "" };
  const r = validateClaimAgainstSnapshot(claim, l, makeSnapshot([]));
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.receipt.code, "EVIDENCE_NOT_FOUND");
});

test("validator: out-of-bounds range is rejected, never crashes", () => {
  const l = new Ledger();
  const ev = l.addEvidence({ ...okEvidence, byteStart: 0xffff, byteEnd: 0x10003 });
  const claim = { id: "C-004", text: "beyond the machine", status: "verified" as const, evidenceIds: [ev.id], createdAt: "" };
  const r = validateClaimAgainstSnapshot(claim, l, makeSnapshot([1, 2, 3, 4]));
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.receipt.code, "OUT_OF_BOUNDS");
});

test("validator: snapshot mismatch (evidence from another séance) rejected", () => {
  const l = new Ledger();
  const ev = l.addEvidence(okEvidence);
  const claim = { id: "C-005", text: "time-traveling evidence", status: "verified" as const, evidenceIds: [ev.id], createdAt: "" };
  const snap = makeSnapshot([0x48, 0x45, 0x4c, 0x50]);
  const r = validateClaimAgainstSnapshot(claim, l, { ...snap, hash: "snap999" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.receipt.code, "SNAPSHOT_MISMATCH");
});

test("validator: unknown claims pass without evidence (honesty is free)", () => {
  const l = new Ledger();
  const claim = { id: "C-006", text: "cannot verify from this snapshot", status: "unknown" as const, evidenceIds: [], createdAt: "" };
  const r = validateClaimAgainstSnapshot(claim, l, makeSnapshot([]));
  assert.equal(r.ok, true);
});

test("validator: inferred without inference step is rejected", () => {
  const l = new Ledger();
  const ev = l.addEvidence(okEvidence);
  const claim = { id: "C-007", text: "probably", status: "inferred" as const, evidenceIds: [ev.id], createdAt: "" };
  const r = validateClaimAgainstSnapshot(claim, l, makeSnapshot([0x48, 0x45, 0x4c, 0x50]));
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.receipt.code, "INFERENCE_STEP_MISSING");
});
