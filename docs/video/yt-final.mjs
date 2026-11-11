// yt-final.mjs — open the saved draft and complete: title, description,
// kids=No, Next x3, Public, Publish, grab URL.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

const TITLE = "MEDIUM — The Glass Séance | A verifiable séance for forgotten software (Kiroween 2026)";
const DESC = `A verifiable séance for forgotten software. MEDIUM runs dead programs on a transparent 1-bit byte-machine, inspects real files with byte-offset evidence, and answers with verified / inferred / unknown — never hallucinated.

Built for Kiroween 2026 (category: Resurrection) with Kiro: spec-driven development, agent hooks, an MCP server, property-based testing, and a three-role build-time crew.

Try it: https://znuaibot.github.io/medium/
Code: https://github.com/znuaibot/medium

Every claim the séance makes is checkable, byte by byte. Where the bytes are silent, it says unknown.`;

const step = (n) => console.log("== " + n);
async function findRef(pattern, label) {
  const snap = await page.snapshot();
  const line = snap.split("\n").find(l => pattern.test(l));
  if (!line) throw new Error(`${label}: not found`);
  return line.match(/ref=(\d+)/)[1];
}
async function clickRef(pattern, label) {
  const ref = await findRef(pattern, label);
  await page.click("ref=" + ref, { label });
  await page.waitForTimeout(1800);
}
async function fillByLabel(labelPattern, value) {
  const snap = await page.snapshot();
  const line = snap.split("\n").find(l => /textbox/i.test(l) && labelPattern.test(l));
  if (!line) throw new Error(`textbox ${labelPattern}: not found`);
  await page.fill("ref=" + line.match(/ref=(\d+)/)[1], value);
  await page.waitForTimeout(900);
}

step("open draft editor");
await page.goto("https://studio.youtube.com/channel/UC3_RpyY3g6YffwThX4ifElA/videos");
await page.waitForTimeout(7000);
await clickRef(/button "Edit draft"|anchor.*Edit draft|link "Edit draft"/i, "点击 Edit draft");
await page.waitForTimeout(5000);

step("fill title");
await fillByLabel(/title/i, TITLE);
step("fill description");
await fillByLabel(/description/i, DESC);

step("kids: No");
try { await clickRef(/radio "No, it's not made for kids"/, "选择非儿童内容"); }
catch (e) { console.log("kids radio fallback: " + String(e).slice(0, 60)); }

step("Next 1");
await clickRef(/button "Next"/, "Next 1");
await page.waitForTimeout(3000);
step("Next 2");
await clickRef(/button "Next"/, "Next 2");
await page.waitForTimeout(6000);
step("Next 3");
await clickRef(/button "Next"/, "Next 3");
await page.waitForTimeout(2500);

step("Visibility: Public");
try { await clickRef(/radio "Public"/, "选择 Public"); }
catch (e) { console.log("public radio fallback: " + String(e).slice(0, 60)); }
await page.waitForTimeout(1500);

step("Publish");
await clickRef(/button "Publish"/, "点击 Publish");
await page.waitForTimeout(12000);

step("grab URL");
const done = await page.evaluate(() => document.body.innerText);
const m = done.match(/https:\/\/youtu\.be\/[\w-]+/);
console.log(m ? "VIDEO URL: " + m[0] : "URL not found; page text:\n" + done.slice(0, 700));
