// yt-final3.mjs — field matching fixed: YouTube's tree calls them "textfield".
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
  await page.waitForTimeout(2500);
}
async function fillField(fieldPattern, value, label) {
  const snap = await page.snapshot();
  const line = snap.split("\n").find(l => /textfield/i.test(l) && fieldPattern.test(l));
  if (!line) throw new Error(`field ${label}: not found`);
  const ref = line.match(/ref=(\d+)/)[1];
  await page.fill("ref=" + ref, value);
  await page.waitForTimeout(1200);
  console.log("filled:", label);
}

step("title");
await fillField(/Add a title/i, TITLE, "title");
step("description");
await fillField(/Tell viewers/i, DESC, "description");

step("kids: No");
try {
  const kids = await findRef(/radio "No, it's not made for kids"/, "kids radio", true);
  if (kids) { await page.click("ref=" + kids, { label: "非儿童" }); await page.waitForTimeout(1200); }
  else console.log("kids radio not present");
} catch (e) { console.log("kids fallback: " + String(e).slice(0, 50)); }

step("Next 1 (Details -> Video elements)");
await clickRef(/button "Next"/, "Next 1");
await page.waitForTimeout(4000);

step("Next 2 (Video elements -> Checks)");
await clickRef(/button "Next"/, "Next 2");
await page.waitForTimeout(8000);

step("Next 3 (Checks -> Visibility)");
await clickRef(/button "Next"/, "Next 3");
await page.waitForTimeout(3000);

step("Visibility: Public");
try {
  const pub = await findRef(/radio "Public"/, "public radio", true);
  if (pub) { await page.click("ref=" + pub, { label: "Public" }); await page.waitForTimeout(2000); }
  else console.log("public radio not present");
} catch (e) { console.log("public fallback: " + String(e).slice(0, 50)); }

step("Publish");
await clickRef(/button "Publish"/, "点击 Publish");
await page.waitForTimeout(15000);

step("grab URL");
const done = await page.evaluate(() => document.body.innerText);
const m = done.match(/https:\/\/youtu\.be\/[\w-]+/);
console.log(m ? "VIDEO URL: " + m[0] : "no link; text:\n" + done.slice(0, 800));
