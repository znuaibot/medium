// yt-final2.mjs — Edit draft -> title/desc -> kids No -> Next x3 -> Public ->
// Publish -> video URL. Tolerant matching, state dumps on failure.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

const TITLE = "MEDIUM — The Glass Séance | A verifiable séance for forgotten software (Kiroween 2026)";
const DESC = `A verifiable séance for forgotten software. MEDIUM runs dead programs on a transparent 1-bit byte-machine, inspects real files with byte-offset evidence, and answers with verified / inferred / unknown — never hallucinated.

Built for Kiroween 2026 (category: Resurrection) with Kiro: spec-driven development, agent hooks, an MCP server, property-based testing, and a three-role build-time crew.

Try it: https://znuaibot.github.io/medium/
Code: https://github.com/znuaibot/medium

Every claim the séance makes is checkable, byte by byte. Where the bytes are silent, it says unknown.`;

const step = (n) => console.log("== " + n);
async function findRef(pattern, label, quiet) {
  const snap = await page.snapshot();
  const line = snap.split("\n").find(l => pattern.test(l));
  if (!line) {
    if (quiet) return null;
    throw new Error(`${label}: not found`);
  }
  return line.match(/ref=(\d+)/)[1];
}
async function clickRef(pattern, label) {
  const ref = await findRef(pattern, label);
  await page.click("ref=" + ref, { label });
  await page.waitForTimeout(2200);
}
async function fillByLabel(labelPattern, value) {
  const snap = await page.snapshot();
  const line = snap.split("\n").find(l => /textbox/i.test(l) && labelPattern.test(l));
  if (!line) throw new Error(`textbox ${labelPattern}: not found`);
  await page.fill("ref=" + line.match(/ref=(\d+)/)[1], value);
  await page.waitForTimeout(1000);
}

step("Edit draft");
await page.goto("https://studio.youtube.com/channel/UC3_RpyY3g6YffwThX4ifElA/videos");
await page.waitForTimeout(8000);
const editRef = await findRef(/button "Edit draft"/, "Edit draft button");
await page.click("ref=" + editRef, { label: "点击 Edit draft" });
await page.waitForTimeout(6000);

step("fill title");
await fillByLabel(/title/i, TITLE);
step("fill description");
await fillByLabel(/description/i, DESC);

step("kids: No");
const kidsRef = await findRef(/radio "No, it's not made for kids"/, "kids radio", true);
if (kidsRef) { await page.click("ref=" + kidsRef, { label: "选择非儿童内容" }); await page.waitForTimeout(1200); }
else console.log("kids radio not found (may be preselected)");

step("Next 1");
await clickRef(/button "Next"/, "Next 1");
await page.waitForTimeout(3500);
step("Next 2");
await clickRef(/button "Next"/, "Next 2");
await page.waitForTimeout(7000);
step("Next 3");
await clickRef(/button "Next"/, "Next 3");
await page.waitForTimeout(3000);

step("Visibility: Public");
const pubRef = await findRef(/radio "Public"/, "public radio", true);
if (pubRef) { await page.click("ref=" + pubRef, { label: "选择 Public" }); await page.waitForTimeout(1800); }
else console.log("public radio not found");

step("Publish");
await clickRef(/button "Publish"/, "点击 Publish");
await page.waitForTimeout(14000);

step("grab URL");
const done = await page.evaluate(() => document.body.innerText);
const m = done.match(/https:\/\/youtu\.be\/[\w-]+/);
console.log(m ? "VIDEO URL: " + m[0] : "no youtu.be link; text:\n" + done.slice(0, 800));
