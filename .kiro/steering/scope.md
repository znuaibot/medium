# Steering: Scope Lock (competition build)

## The promise (public, do not widen without updating evidence plan, demo, tests, copy)

> MEDIUM is a verifiable séance for forgotten software: it runs programs on a
> transparent 1-bit byte-machine, inspects real files with byte-offset evidence,
> and answers with `verified`, `inferred`, or `unknown` — never hallucinated.
> The competition build supports a curated set of documented demonstration
> cartridges and a deterministic static inspector for arbitrary files.
> Unsupported formats are identified and safely rejected, never guessed at.

## Must ship (core loop)

1. Load a bundled cartridge (or drop a file for static inspection)
2. Run it on the GlassVM (deterministic, visualizable memory)
3. Ask a documented question (preset buttons + free text)
4. Receive a labeled answer (verified / inferred / unknown)
5. Open the cited evidence (address, bytes, snapshot hash, interpretation)
6. Replay a saved séance from its snapshot
7. Export the Certificate of Séance (self-contained single-file archive)
8. Judge 60-second quickstart in README; offline path; fallback copy

## Stretch (only after core loop is green AND frozen scope holds)

- v86 real-DOS exhibit (only if everything else is green by 2026-11-24)
- Second deep-mapped cartridge family
- BYO-key free-form LLM mode (the validator already gates it; UI last)
- Extra audio/visual flourishes

## Explicitly out (competition build)

- Running arbitrary third-party DOS executables with per-title memory maps
- Universal disassembly or automatic address discovery
- Long-term cross-session ghost memory
- Non-English UI
- User uploads shared publicly (inspection is local-only; nothing leaves the
  browser except the exported certificate the user saves themselves)
