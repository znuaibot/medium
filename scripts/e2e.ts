#!/usr/bin/env node
// e2e.mjs — the full CLI séance loop, no browser:
// boot cartridge -> coroner autopsy -> ask -> verified -> forged claim intercepted.
import { GlassVm } from "../src/vm/glass-vm.ts";
import { inspectBytes } from "../src/coroner/static-inspector.ts";
import { MediumEngine } from "../src/ui/medium-engine.ts";
import { validateClaimAgainstSnapshot } from "../src/core/validator.ts";
import { cryptKeeper } from "../src/cartridges/crypt-keeper.ts";
import { telemetry } from "../src/cartridges/telemetry.ts";
import { writeFileSync, mkdirSync } from "node:fs";

const lines: string[] = [];
const say = (s: string) => { lines.push(s); console.log(s); };
let failures = 0;
const check = (cond: boolean, label: string) => { if (!cond) failures++; say(`${cond ? "PASS" : "FAIL"}: ${label}`); };

// -- séance 1: crypt-keeper ------------------------------------------------
const vm1 = new GlassVm(cryptKeeper.program, 0x0200, cryptKeeper.input);
for (const p of cryptKeeper.data) vm1.mem.set(p.bytes, p.addr);
vm1.run(5000);
const engine1 = new MediumEngine(cryptKeeper, vm1);
const cheat = engine1.séance("cheat-code");
say(`séance[cheat-code]: ${cheat.status} — ${cheat.text.slice(0, 70)}…`);
check(cheat.status === "verified", "crypt-keeper cheat-code answers verified");
check(cheat.evidence.length > 0 && cheat.evidence[0]!.addr === 0x0140, "evidence cites 0x0140");
const trap1 = engine1.hallucinationTrap();
say(`trap: ${trap1.receipt?.code} — ${trap1.receipt?.reason.slice(0, 60)}…`);
check(trap1.receipt?.code === "EVIDENCE_NOT_FOUND", "forged claim intercepted with receipt");

// -- séance 2: telemetry unknown ------------------------------------------
const vm2 = new GlassVm(telemetry.program, 0x0200, telemetry.input);
for (const p of telemetry.data) vm2.mem.set(p.bytes, p.addr);
vm2.run(5000);
const engine2 = new MediumEngine(telemetry, vm2);
const dead = engine2.séance("corrupted-region");
say(`séance[corrupted-region]: ${dead.status} — ${dead.text.slice(0, 70)}…`);
check(dead.status === "unknown", "telemetry dead sector answers unknown (honesty)");

// -- coroner on real bytes --------------------------------------------------
const artifact = new Uint8Array([...cryptKeeper.program, ...cryptKeeper.data.flatMap((d) => [...d.bytes])]);
const autopsy = inspectBytes(artifact);
check(autopsy.strings.length > 0, `coroner finds strings in the artifact (${autopsy.strings.length})`);
const forgedEvidence = { addr: 0x0140, len: 1, interpretation: "forged: this byte says the author's name" };
const vmForgery = new MediumEngine(telemetry, vm2);
void vmForgery;
const badClaim = { id: "C-FORGED", text: "the passcode byte spells a name", status: "verified" as const,
  evidenceIds: ["E-404"], createdAt: "e2e" };
const gate = validateClaimAgainstSnapshot(badClaim, engine1.ledger, { hash: vm1.snapshotHash(), artifactHash: engine1.artifactHash(), bytes: vm1.mem });
check(!gate.ok, "exorcism gate rejects a claim citing absent evidence");
void forgedEvidence;

mkdirSync("docs/kiro/evidence", { recursive: true });
writeFileSync("docs/kiro/evidence/e2e-log.txt", lines.join("\n") + "\n");
console.log(failures === 0 ? "e2e: ALL GREEN" : `e2e: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
