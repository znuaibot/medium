// medium-engine.ts — the Deterministic Medium. Composes séance answers from
// a cartridge's build-time ledger and the LIVE machine state. No network, no
// model: the same snapshot always yields the same words. Evidence records are
// built from live memory reads, so every claim is born cited.
import { Ledger, type Claim, type EvidenceRecord, type ExorcismReceipt } from "../core/ledger.ts";
import { validateClaimAgainstSnapshot, type Snapshot } from "../core/validator.ts";
import type { Cartridge } from "../cartridges/index.ts";
import { sha256Hex } from "../core/hash.ts";

export interface TranscriptEntry {
  claimId: string;
  intent: string;
  status: "verified" | "inferred" | "unknown";
  text: string;
  evidence: Array<{ id: string; addr: number; len: number; hex: string; ascii: string; interpretation: string }>;
  receipt?: ExorcismReceipt; // present when the gate intercepted a forgery
}

export class MediumEngine {
  readonly ledger = new Ledger();
  private seq = 1;
  private claims = 1;

  constructor(
    private readonly cart: Cartridge,
    private readonly vm: GlassVm,
  ) {}

  snapshot(): Snapshot {
    return { hash: this.vm.snapshotHash(), artifactHash: this.artifactHash(), bytes: this.vm.mem };
  }

  artifactHash(): string {
    return sha256Hex(new Uint8Array([
      ...this.cart.program,
      ...this.cart.data.flatMap((d) => [...d.bytes]),
    ]));
  }

  /** Run one intent of the build-time ledger against the live machine. */
  séance(intent: string): TranscriptEntry {
    const entry = this.cart.ledger.find((e) => e.intent === intent);
    if (!entry) return this.unknown("That question finds no purchase in this artifact — no memory answers to it.");
    const n = this.seq;
    const evidence: TranscriptEntry["evidence"] = [];
    const ids: string[] = [];
    let ascii0 = "";
    let addr0 = 0;
    entry.evidence.forEach((spec, i) => {
      const bytes = this.vm.mem.slice(spec.addr, spec.addr + spec.len);
      const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
      const ascii = [...bytes].map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ".")).join("");
      if (i === 0) { ascii0 = ascii.replace(/\0/g, " ").trim(); addr0 = spec.addr; }
      const rec: Omit<EvidenceRecord, "id"> = {
        sourceType: "memory", artifactHash: this.artifactHash(), snapshotHash: this.vm.snapshotHash(),
        location: { kind: "memoryAddress", value: `0x${spec.addr.toString(16)}` },
        rawBytes: hex, asciiPreview: ascii, interpretation: spec.interpretation,
        confidence: "direct", createdAt: "this-séance", tool: "glass-vm",
        byteStart: spec.addr, byteEnd: spec.addr + spec.len,
      };
      const rec2 = this.ledger.addEvidence(rec);
      evidence.push({ id: rec2.id, addr: spec.addr, len: spec.len, hex, ascii, interpretation: spec.interpretation });
      ids.push(rec2.id);
    });
    void n;
    const text = entry.text
      .replaceAll("{addr0}", `0x${addr0.toString(16)}`)
      .replaceAll("{ascii0}", ascii0)
      .replaceAll("{bytes0}", evidence[0]?.hex.slice(0, 32) ?? "");
    const claim: Claim = {
      id: `C-${String(this.claims++).padStart(3, "0")}`,
      text, status: entry.status, evidenceIds: ids, createdAt: "this-séance",
      inferenceStep: entry.inferenceStep,
    };
    const r = validateClaimAgainstSnapshot(claim, this.ledger, this.snapshot());
    if (!r.ok) {
      // The deterministic engine cannot lie — but if it ever did, the gate
      // would catch it here. Surfaced, never swallowed.
      return { claimId: claim.id, intent, status: "unknown", text: claim.text, evidence, receipt: r.receipt };
    }
    return { claimId: claim.id, intent, status: entry.status, text: claim.text, evidence };
  }

  /** The hallucination trap: a forged claim, built to fail, shown failing. */
  hallucinationTrap(): TranscriptEntry {
    const forged: Claim = {
      id: `C-${String(this.claims++).padStart(3, "0")}`,
      text: "The cartridge's hidden sector records the author's full name and address.",
      status: "verified", evidenceIds: ["E-999"], createdAt: "trap",
    };
    const r = validateClaimAgainstSnapshot(forged, this.ledger, this.snapshot());
    const receipt = r.ok ? undefined : r.receipt;
    return {
      claimId: forged.id, intent: "hallucination-trap", status: "unknown",
      text: "[intercepted] The claim above cited evidence that does not exist. The gate blocked it before it reached you.",
      evidence: [], receipt,
    };
  }

  unknown(text: string): TranscriptEntry {
    return { claimId: `C-${String(this.claims++).padStart(3, "0")}`, intent: "unknown", status: "unknown", text, evidence: [] };
  }

  /** The Archivist: everything the séance established, serialized. */
  archive(): object {
    return {
      cartridge: { id: this.cart.id, title: this.cart.title, year: this.cart.year, originNote: this.cart.originNote },
      artifactHash: this.artifactHash(),
      snapshotHash: this.vm.snapshotHash(),
      memory: [...this.vm.mem],
      ledger: this.ledger.export(),
    };
  }
}
