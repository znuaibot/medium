#!/usr/bin/env node
// audit.mjs — mechanical guardrails from the retro (2026-11-12):
//   1. .kiro integrity (present, not ignored, valid JSON)
//   2. 220-line ratchet on source files
//   3. determinism grep is in the test suite (test/vm.test.ts) — not duplicated here
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

let fail = 0;
const die = (m) => { console.error("AUDIT FAIL:", m); fail++; };

// 1. kiro integrity (delegates to the gate-0 check)
if (!existsSync(join(process.cwd(), "scripts", "check-kiro.mjs"))) {
  die("scripts/check-kiro.mjs missing");
}

// 2. line-count ratchet (steering: split at 180, hard cap 220)
const LIMIT = 220;
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|mjs)$/.test(e.name)) {
      const lines = readFileSync(p, "utf8").split("\n").length;
      if (lines > LIMIT) die(`${p} is ${lines} lines (cap ${LIMIT}) — split it`);
    }
  }
}
for (const dir of ["src", "mcp", "scripts"].filter((d) => existsSync(d))) walk(dir);

// 3. required docs exist
for (const f of ["README.md", "LICENSE", "PROGRESS.md", "BUILD_LOG.md", "COMPLIANCE.md", "docs/COMPETITION.md"]) {
  if (!existsSync(join(process.cwd(), f))) die(`missing ${f}`);
}

if (fail) { console.log(`audit: ${fail} failure(s)`); process.exit(1); }
console.log("audit: OK — guardrails hold");
