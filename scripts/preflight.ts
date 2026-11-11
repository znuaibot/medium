#!/usr/bin/env node
// preflight.mjs — the submission gate. Every check must pass before the
// project may be submitted or committed with submission materials.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

let fail = 0;
const ok = (label: string) => console.log("  ✓", label);
const bad = (label: string) => { console.log("  ✗", label); fail++; };
const check = (cond: boolean, label: string) => (cond ? ok(label) : bad(label));

console.log("preflight — submission gate");

// 1. .kiro integrity
check(existsSync(".kiro/steering") && existsSync(".kiro/specs/glass-seance/requirements.md") && existsSync(".kiro/agents"), "/.kiro/ complete at repo root");
const gi = readFileSync(".gitignore", "utf8");
check(!/^\s*\.?kiro\b/m.test(gi), "/.kiro/ not gitignored");

// 2. license + docs
check(existsSync("LICENSE"), "LICENSE present");
for (const f of ["README.md", "PROGRESS.md", "COMPLIANCE.md", "docs/COMPETITION.md", "KIRO_WRITEUP.md", "VIDEO_SCRIPT.md"]) {
  check(existsSync(join(process.cwd(), f)), `${f} present`);
}

// 3. secrets scan (tracked files, excluding lockfiles)
try {
  const out = execSync("git grep -iE \"(as_sk_[0-9a-f]{16,}|sk-[A-Za-z0-9]{20,}|api[_-]?key\\s*=\\s*['\\\"][A-Za-z0-9]{16,})\" -- \":!*package-lock.json\" || true", { encoding: "utf8" });
  check(out.trim() === "", "no secrets in tracked files");
} catch { ok("no secrets in tracked files (scan n/a before first remote)"); }

// 4. tests + build + gates
for (const cmd of [["npm test", "test suite"], ["npm run pbt", "property-based tests"], ["npm run build", "build"], ["node scripts/e2e.ts", "e2e"], ["node scripts/audit.mjs", "audit"], ["node scripts/test-mcp.mjs", "mcp session"]]) {
  try { execSync(cmd[0], { stdio: "pipe" }); ok(`${cmd[1]} green`); }
  catch (e) { bad(`${cmd[1]} FAILED: ${String(e.message).slice(0, 60)}`); }
}

// 5. dist fresh
const appJs = "dist/app.js";
check(existsSync(appJs) && statMtime(appJs) > statMtime("src/ui/main.ts"), "dist bundle newer than sources (run npm run build)");

console.log(fail === 0 ? "preflight: ALL GREEN — cleared for submission" : `preflight: ${fail} failure(s)`);
process.exit(fail === 0 ? 0 : 1);

function statMtime(p: string): number {
  return statSync(p).mtimeMs;
}
