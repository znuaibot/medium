# Steering: Product Truthfulness Contract

Priority order when any instruction conflicts:
1. Official Kiroween 2026 rules
2. Product truthfulness and judge reproducibility
3. Core demo path
4. Evidence and tests
5. Visual polish
6. Stretch features

## The three-state rule

Every user-visible claim carries exactly one status label:

- `verified` — directly supported by an approved evidence record whose bytes
  were read from the current artifact or snapshot.
- `inferred` — supported by indirect evidence; the inference step must be shown.
- `unknown` — current evidence is insufficient. This is an honorable, first-class
  answer, never a failure state to be avoided.

## Hard rules

- Never convert `unknown` into a confident answer.
- Never invent addresses, offsets, strings, hashes, dates, names, or technical
  explanations.
- Every `verified`/`inferred` claim must reference >=1 Evidence ID that exists
  in the ledger and passes schema validation.
- Evidence from one snapshot must never be presented as evidence from another.
- A response failing validation must be blocked, downgraded to `unknown`, or
  regenerated; the interception is logged publicly in the Exorcist Gate log.
- The model is not the source of truth. The artifact, the snapshot, the parser,
  and the evidence ledger are the source of truth.
- The product must fully work offline with no API key. The LLM is an optional,
  validated enhancement layer, never load-bearing.

## Tone rule (post-review, 2026-11-12)

Our defensible claim is "**every assertion is checkable**" — a demonstrable
engineering property. "We are the only honest project" is an unverifiable
moral claim that implies accusations against other entrants. Honesty is a
quiet property of the machine, never a war cry, never a headline.

## Easter-egg containment rule

Demo secrets (passcodes, hidden lore) may exist ONLY in machine-state-reachable
locations (decrypted in memory by key sequences), never in any prompt context.
Otherwise the Exorcist Gate only catches stupid models and a judge who asks
"would your gate catch a model that saw the system prompt?" wins.

## Oracle-probing guard

The validator must not be usable as a free search engine for offset probing:
rate-limit or budget validation attempts per séance session (mechanism
documented before Gate 4).

## Engineering ratchet

- Max 220 lines per source file; split at 180.
- Max 3 files changed per iteration; run `npm test` before proceeding.
- Tests are sacred: never delete assertions or weaken types to pass.
- Two consecutive failed fix attempts on one problem: stop, log in
  BUILD_LOG.md, downgrade to the simplest working implementation.
- Every working day must produce at least one auditable artifact (green test,
  replayable demo, captured Kiro artifact, resolved risk, or submission asset).

## Stop conditions — halt and ask the operator when:

- a required capability has no verified implementation path;
- a dependency license is unclear;
- the demo would require an unsupported artifact;
- a claim cannot be backed by evidence;
- a feature adds complexity without improving a judging criterion;
- the remaining plan cannot complete before feature freeze (2026-12-02).
