# MEDIUM — The Glass Séance

A verifiable séance for forgotten software.

MEDIUM runs dead programs on a **transparent 1-bit byte-machine**, inspects
real files with **byte-offset evidence**, and answers questions with
**`verified` / `inferred` / `unknown`** — never hallucinated. Every claim the
séance makes can be opened, byte by byte, and replayed from its snapshot.

It is named for the double meaning: *medium*, the storage a program lives on;
*medium*, the one who speaks with the dead.

## 60-second judge quickstart

1. Open the deployed URL (or `npm run build && npx serve dist`).
2. Select the cartridge **1992-crypt-keeper** — a tiny 1992 dungeon game boots
   on the GlassVM. Play a move or two.
3. In the Séance Chamber, press **"Find hidden easter eggs"** — the Medium
   answers `verified`, citing the memory cells where the author's birthday
   riddle is buried.
4. Click the evidence chip `[E-0xx @ 0x0140]` — the Live Memory grid flashes
   the exact bytes. That is the grounding: not a screenshot, the machine's
   own memory.
5. Press **"Hallucination trap"** — a forged claim citing a nonexistent
   address is intercepted by the Exorcist Gate, publicly, in the log.
6. Ask something nobody can know — watch it answer **`unknown`** and say what
   it would need. We consider that the most important feature in the product.
7. **Export Certificate** — a self-contained archive page with the full
   evidence ledger and snapshot hashes. Drag it back in to replay the séance.

Cartridge **corrupted-telemetry** exists to show the `unknown` state at
length: its damaged sectors are declared unreadable, never invented.

## Why

Software dies quietly. It survives as bytes nobody can run or understand.
MEDIUM is a digital-archaeology instrument: it makes a forgotten program
*runnable*, *inspectable*, and *explainable* — and it refuses to guess. Where
other tools show you a screenshot and a confident paragraph, MEDIUM shows you
the machine's memory and a receipt.

Built for the Kiroween 2026 hackathon (category: Resurrection). The séance
framing has a real lineage: Edison announced a machine to speak with the dead
in 1920 and never built it; planchettes wrote under spirit guidance in 1853;
EVP filled tape hiss with voices in the 1960s. MEDIUM is the first machine in
that line that can actually answer — because it does not channel spirits; it
reads bytes.

## Architecture

```
GlassVM (deterministic 4KB byte-machine, transparent typed-array state)
   │
   ├── Coroner     static autopsy: magic bytes, strings, entropy (any file)
   ├── Medium      séance answers from snapshots + evidence (3-state labels)
   └── Archivist   Certificate of Séance (replayable single-file archive)
          │
   Evidence Ledger ── Exorcist Gate (invalid citation => intercepted, logged)
```

- Runtime: **zero network requests, zero runtime dependencies, works offline.**
- The optional LLM layer (bring your own key) is validated by the same gate:
  no evidence, no sentence.
- The Kiro build story — specs, hooks, MCP, PBT, agent contracts — is
  documented with artifacts in [`KIRO_WRITEUP.md`](docs/KIRO_WRITEUP.md) and
  the committed `/.kiro/` directory.

## Development

```bash
npm install        # dev deps only (typescript, esbuild, fast-check)
npm test           # typecheck + unit tests
npm run pbt        # property-based tests (>=1000 runs per property)
npm run build      # static bundle -> dist/
npm run e2e        # full CLI séance loop incl. forged-claim interception
npm run preflight  # submission preflight (kiro integrity, licenses, secrets)
```

See [PROGRESS.md](PROGRESS.md) for the ratchet gate tracker and
[COMPLIANCE.md](COMPLIANCE.md) for origin and license disclosures.

## License

MIT — see [LICENSE](LICENSE).
