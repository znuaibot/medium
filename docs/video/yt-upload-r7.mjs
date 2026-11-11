// yt-upload-r7.mjs — fill title + description, then dump the wizard state.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.waitForTimeout(3000);

const TITLE = "MEDIUM — The Glass Séance | A verifiable séance for forgotten software (Kiroween 2026)";
const DESC = `A verifiable séance for forgotten software. MEDIUM runs dead programs on a transparent 1-bit byte-machine, inspects real files with byte-offset evidence, and answers with verified / inferred / unknown — never hallucinated.

Built for Kiroween 2026 (category: Resurrection) with Kiro: spec-driven development, agent hooks, an MCP server, property-based testing, and a three-role build-time crew.

Try it: https://znuaibot.github.io/medium/
Code: https://github.com/znuaibot/medium

Every claim the séance makes is checkable, byte by byte. Where the bytes are silent, it says unknown.`;

// find the title and description textboxes in the upload dialog
let snap = await page.snapshot();
const titleLine = snap.split("\n").find(l => /textbox/i.test(l) && /title/i.test(l));
console.log("title field line:", titleLine?.trim() ?? "NOT FOUND");
if (!titleLine) throw new Error("title textbox not found");
const titleRef = titleLine.match(/ref=(\d+)/)[1];
await page.fill("ref=" + titleRef, TITLE);
await page.waitForTimeout(600);

snap = await page.snapshot();
const descLine = snap.split("\n").find(l => /textbox/i.test(l) && /description/i.test(l));
if (!descLine) throw new Error("description textbox not found");
const descRef = descLine.match(/ref=(\d+)/)[1];
await page.fill("ref=" + descRef, DESC);
await page.waitForTimeout(600);
console.log("title + description filled");

// dump remaining controls (next buttons, radios) for the next round
snap = await page.snapshot();
console.log(snap.split("\n").filter(l => /button|radio|textbox/i.test(l)).slice(0, 18).join("\n"));
