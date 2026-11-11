// devpost-fill2.mjs — fill Project details: story, tags, links, video URL.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.waitForTimeout(4000);

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

const step = (n) => console.log("== " + n);

step("fill story");
const hasTextarea = await page.evaluate(() => !!document.querySelector('textarea[name="software[description]"]'));
if (!hasTextarea) throw new Error("story textarea not on page");
await page.fill('css:textarea[name="software[description]"]', STORY);
await page.waitForTimeout(800);
console.log("story filled:", (await page.evaluate(() => document.querySelector('textarea[name="software[description]"]').value.length)), "chars");

step("dump remaining controls");
const snap = await page.snapshot();
console.log(snap.split("\n").filter(l => /textbox|button|combobox|link/i.test(l)).slice(0, 24).join("\n"));
