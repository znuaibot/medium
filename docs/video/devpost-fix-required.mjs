// devpost-fix-required.mjs — insert story via execCommand (editor-safe),
// switch video URL to watch format, save, verify errors gone.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-medium-the-glass-seance/project_details/edit");
await page.waitForTimeout(9000);

const STORY = `## The séance machine for dead software

Forgotten software survives as files nobody can run or understand. MEDIUM runs dead programs on a transparent 1-bit byte-machine (GlassVM — every byte of its 4KB memory is inspectable while the program works), inspects real files with byte-offset evidence, and answers with **verified / inferred / unknown** — never hallucinated.

### What it does

- **Runs** dead programs in the browser and shows their memory as a living grid
- **Answers** questions about the artifact — every claim cites the exact memory cells or file offsets it came from, click-to-verify
- **Refuses** to guess: a dead sector reads as 32 zero bytes and MEDIUM says *unknown*; a forged claim citing nonexistent evidence E-999 is intercepted by the Exorcist Gate, publicly, in a log
- **Exports** a Certificate of Séance: a self-contained archive page with hashes, evidence ledger, and replay

### How we built it (with Kiro)

- **Spec-driven development**: EARS requirements in \`.kiro/specs/\` froze the ISA, the memory map, and the truthfulness contract before any code existed
- **Agent hooks**: save-time typecheck + test verification; the product's own Exorcist Gate is that same discipline applied to its output
- **MCP**: a zero-dependency stdio server (\`inspect_artifact\`, \`read_vm_memory\`, \`search_memory_strings\`, \`verify_ghost_claim\`) so any agent can run the same séance programmatically
- **Property-based testing**: 6 properties × 1000 randomized cases — PBT caught a real wall-clock leak in the receipt model on day one
- **Build-time crew**: a three-role deliberation (strategist / critical advisor / domain expert, each with mandatory self-critique) whose catches are product-visible — it killed two factually sloppy narrative claims before they reached the video
- **Steering**: truthfulness, 1-bit aesthetic, and scope-lock steering files govern every change

### Challenges

- Determinism is fragile: a wall-clock timestamp inside receipts and a call-stack pointer overlapping its own push region were both caught by tests (34/34 green now)
- Honestly auditing our own story hurt and helped: dropping two catchy-but-wrong claims made the pitch quieter and far stronger

### What we learned

Verification is a product surface, not a testing afterthought. Where the bytes are silent, saying *unknown* is the feature.`;

const r1 = await page.evaluate((story) => {
  const ta = document.querySelector('textarea[name="software[description]"]');
  if (!ta) return "no textarea";
  ta.focus();
  ta.value = "";
  // clear + insert via execCommand so wrapper editors register the change
  document.execCommand("selectAll", false, null);
  document.execCommand("insertText", false, story);
  ta.dispatchEvent(new Event("input", { bubbles: true }));
  ta.dispatchEvent(new Event("change", { bubbles: true }));
  return "inserted, len=" + ta.value.length;
}, STORY);
console.log("story:", r1);
await page.waitForTimeout(800);

const r2 = await page.evaluate(() => {
  const inp = document.querySelector('input[name="software[video_url]"]');
  if (!inp) return "no video input";
  inp.focus();
  inp.value = "https://www.youtube.com/watch?v=c1W0nb-_lOk";
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  inp.dispatchEvent(new Event("change", { bubbles: true }));
  return "video=" + inp.value;
});
console.log("video:", r2);
await page.waitForTimeout(800);

// save
const saved = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => /save/i.test((x.textContent || "").trim()));
  if (!b) return "no save"; b.click(); return "saved";
});
console.log(saved);
await page.waitForTimeout(8000);

// verify errors gone
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-medium-the-glass-seance/project_details/edit");
await page.waitForTimeout(8000);
const errs = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll(".errors")) {
    if (el.offsetParent !== null) {
      let p = el, ctx = "";
      for (let i = 0; i < 10 && p; i++) { p = p.parentElement; const h = p && (p.querySelector("h2,h3,h4,label,.submission-field-label") || null); if (h) { ctx = (h.textContent || "").trim().slice(0, 60); break; } }
      out.push(ctx);
    }
  }
  return out;
});
console.log("remaining errors:", JSON.stringify(errs));
