// devpost-refill.mjs — refill story/video/links + tags via select2 dropdown.
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

// 1. story
await page.fill('css:textarea[name="software[description]"]', STORY);
await page.waitForTimeout(800);
console.log("story chars:", await page.evaluate(() => document.querySelector('textarea[name="software[description]"]').value.length));

// 2. video
await page.fill('css:input[name="software[video_url]"]', "https://youtu.be/c1W0nb-_lOk");
await page.waitForTimeout(600);
console.log("video set");

// 3. first link
await page.fill('css:input[name="software[urls_attributes][0][url]"]', "https://znuaibot.github.io/medium/");
await page.waitForTimeout(600);
console.log("link0 set");

// 4. tags via select2 dropdown route
const TAGS = ["Kiro", "TypeScript", "MCP", "Property-Based Testing", "Web Audio API", "esbuild"];
let tagReport = [];
for (const tag of TAGS) {
  // focus the input
  await page.evaluate(() => {
    const inp = document.querySelector('input[name="software[tag_list]"]');
    if (inp) inp.focus();
  });
  await page.keyboard.type(tag);
  await page.waitForTimeout(1400); // let the dropdown render
  // click the first suggestion whose text matches the typed tag
  const clicked = await page.evaluate((t) => {
    const opts = [...document.querySelectorAll(".select2-results__option, .select2-result, [class*=result] li, li[class*=option]")];
    const best = opts.find(o => (o.textContent || "").trim().toLowerCase().startsWith(t.toLowerCase()));
    if (best) { best.click(); return "clicked: " + (best.textContent || "").trim().slice(0, 40); }
    return "no suggestion for " + t + " (options: " + opts.length + ")";
  }, tag);
  tagReport.push(clicked);
  await page.waitForTimeout(600);
}
console.log("TAGS:", JSON.stringify(tagReport, null, 1));
const state = await page.evaluate(() => {
  const tag = document.querySelector('input[name="software[tag_list]"]');
  const tokens = [...document.querySelectorAll(".select2-selection__choice, .token")].map(x => x.textContent.trim());
  return { tagValue: tag ? tag.value : null, tokens };
});
console.log("TAG STATE:", JSON.stringify(state));
