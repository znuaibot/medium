# PROGRESS — ratchet gate tracker

> Rule: never advance a gate until every acceptance box is checked and the
> verification command is green. Never open a new gate while the previous one
> is red. On two consecutive failed attempts at one problem: stop, record the
> cause in BUILD_LOG.md, downgrade to the simplest working implementation.

Status date: 2026-11-12. Deadline: 2026-12-04 14:00 PT. Feature freeze: 2026-12-02.

## Gate 0 — Compliance foundation and .kiro armament  [x] DONE 2026-11-12
- [x] Repo scaffold (LICENSE MIT, .gitignore, package.json, tsconfig strict)
- [x] /.kiro/ steering: product-truthfulness, aesthetic-1bit, scope
- [x] /.kiro/specs/glass-seance: requirements (EARS), design, tasks
- [x] /.kiro/agents: coroner.md, medium.md, archivist.md (data-boundary contracts)
- [x] /.kiro/hooks: evidence verify-on-save + submission preflight
- [x] COMPLIANCE.md (origin + dependency licenses + demo-asset permissions)
- [x] Verification: scripts/check-kiro.mjs green (kiro dir present, not ignored, JSON valid)

## Gate 1 — Evidence ledger and exorcism validator core (pure TS, zero UI)  [ ] open
- [ ] src/core/ledger.ts: EvidenceRecord, Claim, hash identity, append-only ledger
- [ ] src/core/validator.ts: validateClaimAgainstSnapshot -> ExorcismReceipt
- [ ] test/pbt.evidence.test.ts: >=5 properties x 1000 runs (bounds safety, hash
      tamper detection, missing-evidence rejection, round-trip stability,
      unknown preservation)
- [ ] Verification: `npm test` green; output saved to docs/kiro/evidence/pbt-report.txt

## Gate 2 — GlassVM + 3 cartridges + Coroner static inspector  [ ] open
- [ ] src/vm/glass-vm.ts (<=200 lines): deterministic step, 4KB memory view,
      registers, snapshot freeze + hash, replay
- [ ] src/cartridges/: 1987-hypernote, 1992-crypt-keeper, corrupted-telemetry
- [x] src/coroner/static-inspector.ts: magic bytes, strings table, entropy, hex slices
- [ ] Verification: scripts/e2e.mjs — inspect -> run -> read memory -> ask ->
      verified claim -> forged claim intercepted (exit 0, log archived)

## Gate 3 — MCP server  [ ] open
- [ ] mcp/seance-mcp-server.mjs (<=180 lines): inspect_artifact, read_vm_memory,
      search_memory_strings, verify_ghost_claim
- [ ] Verification: scripts/test-mcp.mjs real request/response, log to
      docs/kiro/evidence/mcp-session.log

## Gate 4 — Three-panel instrument UI (retro skin, modern use)  [ ] open
- [ ] Left: The Vessel (1-bit canvas, cartridge switcher, file drop, keys, Web Audio mute)
- [ ] Center: Live Memory grid (hover any evidence chip -> bytes flash)
- [ ] Right: The Seance Chamber (preset questions incl. hallucination trap,
      verified/inferred/unknown badges, evidence chips, Exorcist Gate log panel)
- [ ] Responsive (mobile stack), keyboard usable, offline (no network calls)
- [ ] Verification: `npm run build` zero warnings, static bundle served, console clean

## Gate 5 — Certificate of Seance export (replayable single-file archive)  [ ] open
- [ ] Archivist: export self-contained HTML (styles, 1-bit screenshot, evidence
      table, snapshot hashes, replay packet)
- [ ] Re-import: drag certificate back -> exact memory state restored
- [ ] Verification: round-trip e2e in scripts/e2e.mjs

## Gate 6 — Bonus package, writeup, video script, preflight  [ ] open
- [ ] crew-app/: distributable Kiro Crew app package (Software Coroner)
- [ ] README.md 60-second judge quickstart + architecture diagram
- [ ] KIRO_WRITEUP.md answering all official Kiro questions with artifacts
- [ ] VIDEO_SCRIPT.md (<=2:40, per-second storyboard, human voiceover)
- [ ] Verification: `npm run preflight` all green

## Post-gates (do not start before Gate 6 is green)
- [ ] Recording + editing + voiceover (target 2:20-2:40)
- [ ] Devpost submission draft saved; final submit before 2026-12-04 14:00 PT
- [ ] Blog post (blog bonus) + social post starting with #KiroweenHackathon26
