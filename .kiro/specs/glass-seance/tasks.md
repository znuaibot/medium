# Spec: glass-seance — Tasks

Order is the ratchet: no task starts before all before it are green.

- [x] 1. Scaffold + steering + compliance (Gate 0) — 2026-11-12
- [ ] 2. src/core/hash.ts + ledger.ts: EvidenceRecord/Claim/ledger, sha256
      identity (Web Crypto + Node crypto dual path), append-only
      Verification: unit tests green
- [ ] 3. src/core/validator.ts: validateClaimAgainstSnapshot + ExorcismReceipt
      Verification: unit tests incl. tamper + missing-evidence cases
- [ ] 4. test/pbt.evidence.test.ts: 5 properties x 1000 runs
      Verification: `npm run pbt` green; report archived to docs/kiro/evidence/
- [ ] 5. src/vm/glass-vm.ts: core interpreter + snapshot/freeze/restore
      Verification: determinism unit test (same steps -> same hash)
- [ ] 6. Cartridge assembler + 3 cartridges (bytecode + lore + planted evidence)
      Verification: each boots and reaches its scripted states
- [ ] 7. src/coroner/static-inspector.ts
      Verification: unit tests on fixture files (incl. safe rejection)
- [ ] 8. Build-time séance authoring: response ledgers for the 3 cartridges
      (three-agent crew session; outputs archived under docs/kiro/evidence/)
      Verification: every ledger claim passes validator against snapshots
- [ ] 9. scripts/e2e.mjs full loop + forged-claim interception
      Verification: exit 0; log archived
- [ ] 10. mcp/seance-mcp-server.mjs (4 tools) + scripts/test-mcp.mjs
      Verification: real stdio session logged to docs/kiro/evidence/mcp-session.log
- [ ] 11. src/ui/*: three-panel instrument, memory grid hover-highlight,
      badges, chips, Exorcist Gate log panel
      Verification: `npm run build` clean; manual keyboard + 900px checks logged
- [ ] 12. Certificate export + re-import replay
      Verification: round-trip in e2e
- [ ] 13. crew-app/ package + README quickstart + KIRO_WRITEUP.md
- [ ] 14. VIDEO_SCRIPT.md + preflight script green
- [ ] 15. Feature freeze audit (2026-12-02): scope vs PROGRESS, secrets scan,
      license check, clean-browser judge path
