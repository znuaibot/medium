# KIRO_WRITEUP — how Kiro built MEDIUM

> Every claim below points at a committed artifact. Read this beside the repo.

## What MEDIUM is

A verifiable séance for forgotten software: dead programs run on a transparent
1-bit byte-machine, real files are inspected with byte-offset evidence, and
answers carry `verified` / `inferred` / `unknown` labels — with an Exorcist
Gate that intercepts any claim whose citations do not exist.

## Surfaces: IDE / CLI / Web / Crew

The four Kiro surfaces did different jobs. **IDE + CLI** drove the build loop:
strict TS (`tsc --noEmit`), `node --test` suites, and the ratchet rules
(≤220 lines/file, ≤3 files per iteration) were enforced through `npm test`
after every change. **Web** is the delivery target: the product itself is a
static bundle (`npm run build`, zero runtime dependencies, zero network
calls). **Crew** appears twice — at build time as the three-role deliberation
and lore crew (below), and as a distributable Crew App package (`crew-app/`).
The honest difference we found: IDE/CLI are *interactive* partners, Web is a
*deployment* surface, and Crew is where work continues *without* you — our
build-time séance (authoring each cartridge's response ledger against live
memory) is exactly the kind of parallel, inspectable work Crew exists for.

## Spec-driven development (`.kiro/specs/glass-seance/`)

The spec was the contract that kept a solo build honest. `requirements.md`
uses EARS-style statements ("WHEN a claim references an Evidence ID that does
not exist … THE SYSTEM SHALL reject the claim and emit an ExorcismReceipt");
`design.md` froze the ISA and memory map; `tasks.md` is the ratchet. What the
spec changed in practice: the determinism requirement ("same program + same
input ⇒ same snapshot hash") was written down *before* the VM existed, and it
caught two design mistakes early — wall-clock timestamps inside
`ExorcismReceipts` (removed; callers timestamp logs) and a call-stack pointer
placed inside its own push region (moved to 0x00FF). Compared to vibe coding:
the spec made disagreements with myself resolvable by reading, not re-deriving.

## Agent hooks (`.kiro/hooks/`)

Two hooks ship. `verify-evidence-on-save` runs typecheck + tests after every
save under `src/` and `mcp/` — "success is silent, failures are verbose". The
one we show off is conceptual-but-real: the Exorcist Gate *inside the product*
is the same idea applied to the artifact's own voice — a claim citing
evidence `E-999` is intercepted and logged publicly (`test-mcp.mjs` output:
`INTERCEPTED EVIDENCE_NOT_FOUND`, archived at `docs/kiro/evidence/`).

## MCP (`mcp/seance-mcp-server.mjs`)

A zero-dependency stdio MCP server exposes four tools — `inspect_artifact`,
`read_vm_memory`, `search_memory_strings`, `verify_ghost_claim` — so *any*
agent can perform a séance programmatically. This is bidirectional MCP: the
byte-machine is haunted by whichever agent is invited. A real session
(initialize → tools/list → memory read → true claim PASSED → forged claim
INTERCEPTED) is scripted in `scripts/test-mcp.mjs` and logged to
`docs/kiro/evidence/mcp-session.log`.

## Custom agents (`.kiro/agents/`)

Coroner, Medium, Archivist — separated by **data boundaries, not vibes**:
Coroner reads bytes and writes `autopsy` findings (never sees user questions);
Medium reads snapshots + approved evidence and writes claims (never writes
archive facts); Archivist reads validated outputs and renders the Certificate
(never calls the emulator). The same contracts drive the runtime's
deterministic engine (`src/ui/medium-engine.ts`).

## Property-based testing

The evidence kernel's six properties (bounds safety, single-byte tamper
detection, referential integrity, round-trip stability, unknown-status
preservation, deterministic verdicts) run 1000 randomized cases each —
`docs/kiro/evidence/pbt-report.txt`. PBT earned its keep on day one: the
"deterministic verdicts" property failed against a counterexample and
exposed a wall-clock timestamp leaking into `ExorcismReceipts`. We report PBT
as *evidence of correctness*, not a proof.

## Steering (`.kiro/steering/`)

Three files, all load-bearing: `product-truthfulness.md` (the three-state
rule, the tone rule, easter-egg containment, oracle-probing budget — plus
*stop conditions* that decide when the agent halts and asks instead of
guessing); `aesthetic-1bit.md` (the two-color instrument, the anti-slop bans,
states-as-textures); `scope.md` (the public promise and its boundaries —
"unsupported formats are identified and safely rejected, never guessed at").

## Kiro powers

The build deliberately ran on a minimal harness (the product must not depend
on anything the judge cannot run offline), so powers were used only where
they earned their context: none were load-bearing. We say that plainly rather
than perform a keyword.

## Build-time Crew session

The cartridge lore and response ledgers were authored in a three-role
deliberation (strategist / critical advisor / domain expert, each with
mandatory self-critique) recorded in `BUILD_LOG.md` and `PROJECT.md`; the
critic's catches are product-visible — it killed two factually sloppy
narrative claims before they reached the video.
