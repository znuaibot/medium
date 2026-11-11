# COMPLIANCE — origin, licenses, permissions

## 1. Project origin and pre-existing work disclosure

- Project started: 2026-11-12 (during the Kiroween 2026 Submission Period,
  which opened 2026-10-30). First commit: see git history of this repository.
- All product source code in `src/`, `test/`, `mcp/`, `scripts/` is authored
  during the Submission Period specifically for this project.
- Standard development resources used (allowed by rules; disclosed here):
  - `typescript` (Apache-2.0) — type checking
  - `esbuild` (MIT) — dev-time bundling only; not part of the product
  - `fast-check` (MIT) — property-based test runner, test-only
  - Node.js built-in `node:test` — test runner, test-only
- Ideas and patterns studied for reference (no code copied):
  - `rea/mini-rea` evidence-ledger pattern (our own prior work, MIT, re-designed
    from scratch for this product's schema; not copied verbatim)
  - `dos-mcp` (MIT) demonstrated browser-side DOS memory reads; our GlassVM is
    an original deterministic VM, unrelated code
  - `v86` (BSD-3) evaluated and NOT included in the competition build
- No generated assets from third-party model APIs are shipped as product data.

## 2. Dependency license inventory

| Dependency | Version | License | Used in |
|---|---|---|---|
| typescript | ^5.6 | Apache-2.0 | dev only |
| esbuild | ^0.25 | MIT | dev only (bundling) |
| fast-check | ^4.0 | MIT | tests only |

Runtime dependencies of the shipped bundle: **none** (zero-dependency core).
Web Audio, Canvas 2D, File API are browser platform APIs.

## 3. Demo artifact permission records

Rule: every artifact shipped in this repository or shown in the demo video must
have a completed record below. Artifacts without a record are excluded
(`demo-assets/excluded/`).

```yaml
name: 1987-hypernote
origin: authored for this project during the Submission Period
license: MIT (this repository)
redistribution_allowed: true
included_in_repo: true
attribution_required: false
proof: src/cartridges/ (committed source of truth)
```

```yaml
name: 1992-crypt-keeper
origin: authored for this project during the Submission Period
license: MIT (this repository)
redistribution_allowed: true
included_in_repo: true
attribution_required: false
proof: src/cartridges/
```

```yaml
name: corrupted-telemetry
origin: authored for this project during the Submission Period
license: MIT (this repository)
redistribution_allowed: true
included_in_repo: true
attribution_required: false
proof: src/cartridges/
```

Public-domain or permissively-licensed third-party DOS artifacts: none
committed yet. If one is added later it gets a record here with verifiable
license proof BEFORE entering the repo or the video.

## 4. Secrets hygiene

- No API keys, tokens, private URLs, or personal data are committed. The
  optional BYO-key LLM mode stores the key in browser localStorage only, never
  transmits it anywhere except the user-configured provider endpoint.

## 5. Submission checklist pointer

See `PROGRESS.md` Gate 6 and `scripts/preflight.mjs` (final preflight is
automated and must be green before submission).
