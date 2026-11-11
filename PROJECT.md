# MEDIUM: The Glass Séance — project charter (internal)

> Status: BUILDING ｜ Category: Resurrection ｜ Deadline 2026-12-04 14:00 PT ｜ Freeze 2026-12-02
> Supersedes the "Stack o' Lantern" charter (direction absorbed; see git history).

## One line

A verifiable séance for forgotten software: run dead programs on a transparent
1-bit byte-machine, inspect real files with byte-offset evidence, and answer
with verified / inferred / unknown — never hallucinated.

## Architecture decision record (2026-11-12, post-review)

- **v86 dropped from critical path** (RESPONSE2: deep-water risk for the build
  model; Kiro Crew Bots are build-time local tooling, not a cloud runtime).
  Retained as a stretch exhibit only if all gates are green by 2026-11-24.
- **GlassVM adopted**: original deterministic byte-machine, 4KB RAM, <=20
  instructions, full state in typed arrays. Every address is ours; every
  claim is checkable. 3 self-authored cartridges carry the lore.
- **Coroner static inspector** covers "any real dead file" honestly: magic
  bytes, strings, entropy, hex slices — deterministic, offline, safe-reject.
- **Runtime is 100% offline**: Deterministic Medium Engine + Fixture Replay.
  LLM = optional BYO-key layer behind the same Exorcist Gate validator.
- **Kiro depth concentrated at build time**: 3 specs, hooks (evidence
  validation), MCP server (4 tools), PBT, 3 agent contracts, independent Crew
  App package for the bonus prize.

## External review log

- RESPONSE1: narrow the promise; click-verifiable 4-layer evidence; unknown as
  first-class; replay; compliance evidence chain; video shows result first.
  → adopted into .kiro/steering + specs.
- RESPONSE2: kill v86; deterministic core; 7 anti-fail iron rules (<=220
  lines/file, <=3 files/iteration, tests sacred, 2-strike downgrade, English
  delivery); ratchet Gate 0-6. → adopted; gates tracked in PROGRESS.md.
- Three-role agent deliberation (strategy / critical advisor / domain expert):
  run 2026-11-12; verdicts recorded in BUILD_LOG.md.

## North star

Do not prove MEDIUM understands all dead software. Prove it understands ONE
real program honestly, stably, replayably — the extensibility is then
believed, not claimed.
