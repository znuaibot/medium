#!/usr/bin/env node
// Gate 0 verification: .kiro integrity — present, not gitignored, JSON parses.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const kiro = join(root, ".kiro");
let fail = 0;
const die = (m) => { console.error("FAIL:", m); fail++; };

if (!existsSync(kiro)) die(".kiro directory missing");
const gi = readFileSync(join(root, ".gitignore"), "utf8");
if (/^\s*\.?kiro\b/m.test(gi)) die(".kiro must not be gitignored");
for (const need of ["steering/product-truthfulness.md", "steering/aesthetic-1bit.md",
  "steering/scope.md", "specs/glass-seance/requirements.md", "specs/glass-seance/design.md",
  "specs/glass-seance/tasks.md", "agents/coroner.md", "agents/medium.md", "agents/archivist.md",
  "hooks/verify-evidence-on-save.kiro.hook", "hooks/submission-preflight.kiro.hook"]) {
  if (!existsSync(join(kiro, need))) die(`missing .kiro/${need}`);
}
for (const f of readdirSync(join(kiro, "hooks"))) {
  try { JSON.parse(readFileSync(join(kiro, "hooks", f), "utf8")); }
  catch (e) { die(`invalid JSON in hooks/${f}`); }
}
for (const f of ["LICENSE", "README.md", "PROGRESS.md", "COMPLIANCE.md"]) {
  if (!existsSync(join(root, f))) die(`missing ${f}`);
}
if (fail) { console.log(`check-kiro: ${fail} failure(s)`); process.exit(1); }
console.log("check-kiro: OK — .kiro armed, licenses present, nothing ignored");
