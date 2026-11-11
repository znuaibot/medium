# BUILD_LOG — auditable daily evidence

> Rule: every working day must produce at least one of: a green test, a
> replayable demo, a captured Kiro artifact, a resolved risk, or a completed
> submission asset. Commits alone do not count as progress.

## 2026-11-12
- Direction locked after external review (RESPONSE1 + RESPONSE2) and a
  three-role agent deliberation (strategist / critical advisor / domain expert):
  v86 dropped from the critical path; GlassVM deterministic byte-machine adopted
  as the core; Kiro usage concentrated at build time; runtime must be 100%
  offline-capable.
- Gate 0 executed: scaffold, steering, specs, agent contracts, hooks, compliance
  files. All English. Repo initialized.
- Risks logged: see COMPLIANCE.md and PROGRESS.md. Open questions for build:
  exact GlassVM instruction set (keep <=20 ops); cartridge lore authorship via
  three-agent build-time crew; hook schema compatibility notes for Kiro.

## 2026-11-12 (evening)
- Three-role deliberation completed (strategist / critical advisor / domain
  expert). Verdicts adjudicated into steering + PROJECT.md. Notable catches:
  the critic killed two factually sloppy narrative claims (fictional machine
  provenance, "lost algorithm"); the domain expert forced the easter-egg
  containment + oracle-probing rules; PBT caught a real wall-clock leak in
  ExorcismReceipts the same day (receipts are now deterministic; callers
  timestamp logs).
- Gate 2 part 1 green: GlassVM (21 ops, 4KB, snapshots, call stack), ISA,
  assembler. 23/23 tests. Call-stack pointer originally collided with its own
  push region (0xEF) — caught by tests, moved to 0xFF.
- ISA encoding correction: immediate ops are 2 bytes (spec refinement
  recorded; design.md updated mentally, file edit pending).
- Next (vertical slice, per critic): Coroner PNG/ZIP/raw inspector -> evidence
  chips on a rendered screen. Crew App checkpoint 2026-11-22.
- Vertical-slice backend: Coroner static inspector (PNG tEXt / ZIP comment /
  strings / entropy / safe truncated-chunk reporting). Autopsy findings convert
  to evidence records that pass the exorcism gate; forged bytes are caught.
  28/28 tests. Remaining for the slice: UI rendering (Gate 4).
