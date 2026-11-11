# Spec: glass-seance — Design

## Architecture (three data-boundary layers, enforced in code)

```
src/core/    ledger.ts, validator.ts, hash.ts      (pure TS, no DOM, no I/O)
src/vm/      glass-vm.ts                            (pure TS, deterministic)
src/coroner/ static-inspector.ts                    (pure TS, takes bytes)
src/ui/      main.ts, vessel.ts, memory-grid.ts,
             seance-chamber.ts, exorcist-log.ts     (DOM only, imports core)
mcp/         seance-mcp-server.mjs                  (stdio MCP over core)
```

Boundary enforcement: `src/core` may not import from `src/ui` (lint by test);
Cartridges are pure data + bytecode programs (JSON manifest + byte arrays) —
no executable code from us inside the artifact.

## The GlassVM

- 4096-byte linear RAM (`Uint8Array(4096)`), memory-mapped regions:
  `0x0000-0x00FF` zero page (system state), `0x0100-0x03FF` program data,
  `0x0400-0x07FF` screen framebuffer (128x64 1-bit = 1024 bytes), rest general.
- 16-bit PC, 8-bit A/X/Y registers, 8 flags packed in one byte.
- <=20 instructions (load/store/arith/branch/call/syscall for screen & input).
- `snapshot()` -> hash over state; `step(n)`, `freeze()`, `restore(snapshot)`.
- The full state lives in typed arrays reachable from JS: every byte the
  machine "thinks" is inspectable — this transparency IS the séance.

## Evidence model

```ts
interface EvidenceRecord {
  id: string;                    // E-001...
  sourceType: 'file'|'memory'|'runtime'|'string'|'resource';
  artifactHash: string;          // sha256:...
  snapshotHash?: string;         // sha256:... (required for memory/runtime)
  location: { kind: 'fileOffset'|'memoryAddress'|'range'|'event'; value: string };
  rawBytes: string;              // hex
  asciiPreview: string;
  interpretation: string;
  confidence: 'direct'|'derived';
  createdAt: string; tool: string;
}
interface Claim { id: string; text: string;
  status: 'verified'|'inferred'|'unknown';
  evidenceIds: string[]; inferenceStep?: string; }
interface ExorcismReceipt { claimId: string; reason: string; at: string; }
```

Validator: `validateClaimAgainstSnapshot(claim, ledger, bytes)` — existence,
bounds, hash match, byte match. Failure -> receipt, claim downgraded/blocked.

## Deterministic Medium Engine (offline-first)

Answers = template synthesis over ledger lookups + live memory reads. The
optional LLM layer (BYO key) receives ONLY: question, approved evidence
records, snapshot digest — and its output MUST pass the same validator.
No evidence, no sentence.

## Cartridges (authored content, our own bytecode)

1. `1987-hypernote` — Atkinson tribute: a 1-bit note-taker; hidden at 0x02A0,
   an "unreleased vision of cards in a browser" ciphertext, unlocked by a
   key sequence.
2. `1992-crypt-keeper` — tiny dungeon; hidden passcode + the author's
   birthday easter egg at 0x0140.
3. `corrupted-telemetry` — 1990 weather probe firmware with unreadable
   sectors (0x00 fill) — the canonical `unknown` demo.

## UI (three-panel instrument)

Left `The Vessel` (canvas + cartridge switch + drop zone + keys + mute) |
Center `Live Memory` (hex grid, hover-highlight by evidence) | Right
`The Séance Chamber` (preset questions, badges, evidence chips, Exorcist
Gate log). Stack to tabs <900px. Colors per aesthetic steering.

## Testing

- Unit: ledger/validator/VM (node:test)
- PBT (fast-check): bounds safety, tamper detection, referential integrity,
  round-trip, unknown preservation, determinism (>=1000 runs each)
- E2E: scripts/e2e.mjs full CLI loop incl. forged-claim interception
