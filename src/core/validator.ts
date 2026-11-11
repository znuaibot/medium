// validator.ts — the Exorcist Gate.
// A claim survives only if every citation is real: exists, in bounds, and the
// bytes it swears by are the bytes actually present in the referenced snapshot.
// This is where hallucination is mechanically impossible to pass.
import { toHex } from "./hash.ts";
import type { Claim, EvidenceRecord, ExorcismReceipt, Ledger } from "./ledger.ts";

export interface Snapshot {
  hash: string; // sha256 hex of (memory + registers + screen + pc)
  artifactHash: string; // sha256 hex of the loaded artifact
  bytes: Uint8Array; // full machine memory at snapshot time
}

export type ValidationResult =
  | { ok: true; claim: Claim }
  | { ok: false; receipt: ExorcismReceipt };

function receipt(claimId: string, code: ExorcismReceipt["code"], reason: string, evidenceId?: string): ValidationResult {
  const r: ExorcismReceipt = { claimId, code, reason, at: new Date().toISOString() };
  if (evidenceId !== undefined) r.evidenceId = evidenceId;
  return { ok: false, receipt: r };
}

function checkEvidence(ev: EvidenceRecord, snap: Snapshot): string | null {
  if (ev.artifactHash !== snap.artifactHash) {
    return `evidence ${ev.id} belongs to artifact ${ev.artifactHash.slice(0, 12)}…, not ${snap.artifactHash.slice(0, 12)}…`;
  }
  const needsSnapshot = ev.sourceType === "memory" || ev.sourceType === "runtime";
  if (needsSnapshot) {
    if (!ev.snapshotHash) return `evidence ${ev.id} is ${ev.sourceType} but has no snapshot hash`;
    if (ev.snapshotHash !== snap.hash) {
      return `evidence ${ev.id} cites snapshot ${ev.snapshotHash.slice(0, 12)}…, current is ${snap.hash.slice(0, 12)}…`;
    }
  }
  if (ev.byteStart !== undefined && ev.rawBytes) {
    const start = ev.byteStart;
    const end = ev.byteEnd ?? start + ev.rawBytes.length / 2;
    if (!Number.isInteger(start) || start < 0 || end > snap.bytes.length || start >= end) {
      return `evidence ${ev.id} range [${start},${end}) is out of bounds (memory size ${snap.bytes.length})`;
    }
    const actual = toHex(snap.bytes.slice(start, end));
    if (actual !== ev.rawBytes.toLowerCase()) {
      return `evidence ${ev.id} bytes do not match memory at ${ev.location.value}: cited ${ev.rawBytes.slice(0, 16)}…, found ${actual.slice(0, 16)}…`;
    }
  }
  return null;
}

export function validateClaimAgainstSnapshot(
  claim: Claim,
  ledger: Ledger,
  snap: Snapshot,
): ValidationResult {
  if (claim.status === "unknown") return { ok: true, claim };

  if (claim.status === "inferred" && !claim.inferenceStep) {
    return receipt(claim.id, "INFERENCE_STEP_MISSING", "inferred claims must show their inference step");
  }
  if (claim.evidenceIds.length === 0) {
    return receipt(claim.id, "EVIDENCE_NOT_FOUND", `${claim.status} claim cites no evidence`);
  }
  for (const id of claim.evidenceIds) {
    const ev = ledger.getEvidence(id);
    if (!ev) {
      return receipt(claim.id, "EVIDENCE_NOT_FOUND", `cited evidence ${id} does not exist in the ledger`, id);
    }
    const problem = checkEvidence(ev, snap);
    if (problem) {
      const code = problem.includes("out of bounds") ? "OUT_OF_BOUNDS"
        : problem.includes("snapshot") ? "SNAPSHOT_MISMATCH"
        : problem.includes("artifact") ? "ARTIFACT_MISMATCH"
        : "BYTE_MISMATCH";
      return receipt(claim.id, code as ExorcismReceipt["code"], problem, id);
    }
  }
  return { ok: true, claim };
}

/** Convenience for the UI: which memory cells should flash for this claim? */
export function citedCells(claim: Claim, ledger: Ledger): Array<{ id: string; start: number; end: number }> {
  const cells: Array<{ id: string; start: number; end: number }> = [];
  for (const id of claim.evidenceIds) {
    const ev = ledger.getEvidence(id);
    if (ev?.byteStart !== undefined && ev.rawBytes) {
      cells.push({ id, start: ev.byteStart, end: ev.byteEnd ?? ev.byteStart + ev.rawBytes.length / 2 });
    }
  }
  return cells;
}
