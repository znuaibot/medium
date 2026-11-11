// yt-complete.mjs — the WHOLE YouTube upload in one run: file → details →
// next ×3 → public → publish → video URL. The dialog never gets abandoned.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

const TITLE = "MEDIUM — The Glass Séance | A verifiable séance for forgotten software (Kiroween 2026)";
const DESC = `A verifiable séance for forgotten software. MEDIUM runs dead programs on a transparent 1-bit byte-machine, inspects real files with byte-offset evidence, and answers with verified / inferred / unknown — never hallucinated.

Built for Kiroween 2026 (category: Resurrection) with Kiro: spec-driven development, agent hooks, an MCP server, property-based testing, and a three-role build-time crew.

Try it: https://znuaibot.github.io/medium/
Code: https://github.com/znuaibot/medium

Every claim the séance makes is checkable, byte by byte. Where the bytes are silent, it says unknown.`;

const step = (name) => console.log("== " + name);

async function findRef(pattern, label) {
  const snap = await page.snapshot();
  const line = snap.split("\n").find(l => pattern.test(l));
  if (!line) throw new Error(`${label}: not found in snapshot`);
  return line.match(/ref=(\d+)/)[1];
}
async function clickRef(pattern, label) {
  const ref = await findRef(pattern, label);
  await page.click("ref=" + ref, { label });
  await page.waitForTimeout(1500);
}
async function fillByLabel(labelPattern, value) {
  const snap = await page.snapshot();
  const line = snap.split("\n").find(l => /textbox/i.test(l) && labelPattern.test(l));
  if (!line) throw new Error(`textbox ${labelPattern}: not found`);
  const ref = line.match(/ref=(\d+)/)[1];
  await page.fill("ref=" + ref, value);
  await page.waitForTimeout(800);
}

step("open upload page");
await page.goto("https://studio.youtube.com/channel/UC3_RpyY3g6YffwThX4ifElA/videos/upload?r=" + Math.floor(Math.random() * 1e6));
await page.waitForTimeout(7000);

step("click Upload videos");
await clickRef(/button "Upload videos"/, "点击 Upload videos");
await page.waitForTimeout(4500);

step("assign file");
const nInputs = await page.evaluate(() => document.querySelectorAll('input[type=file]').length);
if (nInputs === 0) throw new Error("no dynamic input appeared");
await page.setInputFiles('css:input[type=file]', "D:/work/agents/zcode/medium/docs/video/final-demo.mp4");
await page.waitForTimeout(14000); // dialog opens with Details

step("fill title");
await fillByLabel(/title/i, TITLE);

step("fill description");
await fillByLabel(/description/i, DESC);

step("not made for kids: No");
try {
  await clickRef(/radio "No, it's not made for kids"/, "选择非儿童内容");
} catch (e) { console.log("radio route failed, trying text click: " + String(e).slice(0, 50)); }

step("Next (Details -> Video elements)");
await clickRef(/button "Next"/, "点击 Next");
await page.waitForTimeout(3000);

step("Next (Video elements -> Checks)");
await clickRef(/button "Next"/, "点击 Next");
await page.waitForTimeout(6000); // checks run

step("Next (Checks -> Visibility)");
await clickRef(/button "Next"/, "点击 Next");
await page.waitForTimeout(2500);

step("Visibility: Public");
try {
  await clickRef(/radio "Public"/, "选择 Public");
} catch (e) { console.log("public radio route failed: " + String(e).slice(0, 50)); }
await page.waitForTimeout(1200);

step("Publish");
await clickRef(/button "Publish"/, "点击 Publish");
await page.waitForTimeout(9000);

step("grab video URL");
const done = await page.evaluate(() => document.body.innerText);
const m = done.match(/https:\/\/youtu\.be\/[\w-]+/);
console.log(m ? "VIDEO URL: " + m[0] : "URL not found in dialog; dumping text:\n" + done.slice(0, 600));
