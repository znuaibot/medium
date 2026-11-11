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

## Three-role deliberation verdicts (2026-11-12, recorded)

Strategy expert / critical advisor / domain expert ran in parallel; adjudication:

**Adopted (from the critical advisor):**
- Drop the "1987 never-shipped machine" fiction entirely — one cannot resurrect
  what never lived; our claims anchor only on checkable things (offsets,
  evidence IDs, three states). The GlassVM is OUR transparent instrument.
- Never call Atkinson dithering a "lost algorithm" — it is documented and
  alive; we use it as the period-correct rendering technique. What we
  resurrect is CONTENT (dead files, era-faithful artifacts), not the algorithm.
- Coroner capped at 3 formats (PNG tEXt, ZIP comment, raw/text) + "no ghost
  responds" as themed graceful failure.
- Three truth states render as texture (clean / halftone / static), not text
  labels; UNKNOWN never appears on the main screen.
- Tone: "every assertion is checkable", never "we are the only honest ones".
- Vertical slice before any further architecture: real dead file → Coroner →
  evidence on screen. Crew App decision checkpoint = 2026-11-22, not the
  final week.

**Adopted (from the domain expert):**
- Easter eggs exist only in machine-state-reachable locations, never in prompt
  context; oracle-probing budget on the validator (before Gate 4).
- Determinism pollution sources (wall clock / randomness) banned mechanically —
  test added; PBT caught a real receipt-timestamp leak the same day.
- Prepared answer to "why not v86 snapshots": v86 restores a black box; the
  GlassVM's every byte is visible from birth to death — the product is the
  evidence chain, not emulation fidelity.

**Adjudicated as pseudo-problems (facts held first-hand):**
- "AWS services may be mandatory" — the official rules (read directly from
  kiroween.devpost.com/rules in-session) mandate only Kiro. No AWS-service
  clause exists.
- "Resurrection category may require literal resurrection" — the official
  category text is broad: "Reimagine obsolete tech with today's innovations or
  solving tomorrow's problems". The séance-for-dead-files framing fits.

**Self-critique (operator, per deliberation protocol):**
- I built the kernel before the vertical slice; the critic's pacing demand is
  correct and now governs the schedule. Kernel time was ~2h and it is tested,
  but the ordering signal is received: demo-first, always.
- I used the word "lost" for Atkinson's algorithm without fact-checking —
  a factual sloppiness that could have been brand-fatal in front of engineer
  judges. Fact-check adjectives before shipping them.
- What remains unverified: cold-viewer legibility of the memory grid, the
  deterministic Medium's output quality, and judge reproducibility from a
  clean browser profile — all scheduled as gate acceptance criteria.

## North star

Do not prove MEDIUM understands all dead software. Prove it understands ONE
real program honestly, stably, replayably — the extensibility is then
believed, not claimed.
