// ledger.ts — the evidence ledger: append-only, content-addressed, exportable.
// The ledger is the source of truth. Claims may only cite what lives here.
import { sha256Hex } from "./hash.ts";

export type SourceType = "file" | "memory" | "runtime" | "string" | "resource";
export type LocationKind = "fileOffset" | "memoryAddress" | "range" | "event";
export type Confidence = "direct" | "derived";
export type ClaimStatus = "verified" | "inferred" | "unknown";

export interface EvidenceRecord {
  id: string; // "E-001"
  sourceType: SourceType;
  artifactHash: string; // sha256 hex of the artifact bytes
  snapshotHash?: string; // required when sourceType is memory/runtime
  location: { kind: LocationKind; value: string }; // "0x0140" or "offset:128" or "event:name"
  byteStart?: number; // for address/range checks against a snapshot
  byteEnd?: number; // exclusive
  rawBytes: string; // hex of the observed bytes
  asciiPreview: string;
  interpretation: string;
  confidence: Confidence;
  createdAt: string; // ISO timestamp
  tool: string; // which instrument produced this observation
}

export interface Claim {
  id: string; // "C-001"
  text: string;
  status: ClaimStatus;
  evidenceIds: string[];
  inferenceStep?: string; // required when status is "inferred"
  createdAt: string;
}

export interface ExorcismReceipt {
  claimId: string;
  evidenceId?: string;
  code:
    | "EVIDENCE_NOT_FOUND"
    | "OUT_OF_BOUNDS"
    | "SNAPSHOT_MISMATCH"
    | "BYTE_MISMATCH"
    | "ARTIFACT_MISMATCH"
    | "INFERENCE_STEP_MISSING";
  reason: string;
  // NOTE: no wall-clock timestamp here — the validator is part of the
  // deterministic core; callers timestamp when they render the log.
}

export class Ledger {
  private evidence = new Map<string, EvidenceRecord>();
  private claims = new Map<string, Claim>();

  addEvidence(rec: Omit<EvidenceRecord, "id"> & { id?: string }): EvidenceRecord {
    const seq = String(this.evidence.size + 1).padStart(3, "0");
    const withId: EvidenceRecord = { ...rec, id: rec.id ?? `E-${seq}` };
    if (this.evidence.has(withId.id)) {
      throw new Error(`evidence id collision: ${withId.id}`);
    }
    this.evidence.set(withId.id, withId);
    return withId;
  }

  addClaim(claim: Claim): Claim {
    if (this.claims.has(claim.id)) {
      throw new Error(`claim id collision: ${claim.id}`);
    }
    this.claims.set(claim.id, claim);
    return claim;
  }

  getEvidence(id: string): EvidenceRecord | undefined {
    return this.evidence.get(id);
  }

  getClaim(id: string): Claim | undefined {
    return this.claims.get(id);
  }

  allEvidence(): EvidenceRecord[] {
    return [...this.evidence.values()];
  }

  allClaims(): Claim[] {
    return [...this.claims.values()];
  }

  /** Content-addressed identity of the whole ledger. */
  digest(): string {
    return sha256Hex(JSON.stringify(this.export()));
  }

  export(): { evidence: EvidenceRecord[]; claims: Claim[] } {
    return { evidence: this.allEvidence(), claims: this.allClaims() };
  }

  static import(data: { evidence: EvidenceRecord[]; claims: Claim[] }): Ledger {
    const l = new Ledger();
    for (const e of data.evidence) {
      if (l.evidence.has(e.id)) throw new Error(`duplicate evidence id: ${e.id}`);
      l.evidence.set(e.id, e);
    }
    for (const c of data.claims) {
      if (l.claims.has(c.id)) throw new Error(`duplicate claim id: ${c.id}`);
      l.claims.set(c.id, c);
    }
    return l;
  }

  /** Human-readable markdown rendering (the Archivist's raw material). */
  toMarkdown(): string {
    const lines = ["# Evidence Ledger", ""];
    for (const e of this.evidence.values()) {
      lines.push(
        `## ${e.id} — ${e.sourceType} @ ${e.location.value}`,
        `- interpretation: ${e.interpretation}`,
        `- bytes: ${e.rawBytes} (${e.asciiPreview})`,
        `- artifact: ${e.artifactHash.slice(0, 16)}…` +
          (e.snapshotHash ? ` snapshot: ${e.snapshotHash.slice(0, 16)}…` : ""),
        `- confidence: ${e.confidence} | tool: ${e.tool} | at: ${e.createdAt}`,
        "",
      );
    }
    for (const c of this.claims.values()) {
      lines.push(`- [${c.status.toUpperCase()}] ${c.id}: ${c.text} (${c.evidenceIds.join(", ") || "no evidence"})`);
    }
    return lines.join("\n");
  }
}
