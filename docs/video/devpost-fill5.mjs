// devpost-fill5.mjs — tags, two links, then Save & continue.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

await page.fill('css:input[name="software[tag_list]"]', "Kiro, TypeScript, MCP, Property-Based Testing, Spec-driven Development, Web Audio API, Canvas, esbuild, GlassVM, Digital Preservation");
await page.waitForTimeout(700);
await page.keyboard.press("Enter");
await page.waitForTimeout(500);
console.log("tags:", await page.evaluate(() => document.querySelector('input[name="software[tag_list]"]').value));

await page.fill('css:input[name="software[urls_attributes][0][url]"]', "https://znuaibot.github.io/medium/");
await page.waitForTimeout(600);

// add second link (GitHub) via ADD ANOTHER LINK
let snap = await page.snapshot();
const addLine = snap.split("\n").find(l => /ADD ANOTHER LINK/i.test(l));
if (addLine) {
  const ref = addLine.match(/ref=(\d+)/)[1];
  await page.click("ref=" + ref, { label: "ADD ANOTHER LINK" });
  await page.waitForTimeout(1200);
  snap = await page.snapshot();
  const urlLine = snap.split("\n").find(l => /urls_attributes\]\[1\]\[url\]/.test(l));
  if (urlLine) {
    await page.fill('css:input[name="software[urls_attributes][1][url]"]', "https://github.com/znuaibot/medium");
    console.log("github link added");
  } else {
    console.log("second url field not found; skipping");
  }
} else {
  console.log("ADD ANOTHER LINK not found");
}

// save & continue
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1200);
snap = await page.snapshot();
const saveLine = snap.split("\n").find(l => /button/i.test(l) && /save/i.test(l));
console.log("save button:", saveLine?.trim() ?? "NOT FOUND");
if (saveLine) {
  await page.click("ref=" + saveLine.match(/ref=(\d+)/)[1], { label: "Save & continue" });
  await page.waitForTimeout(6000);
  console.log("after save URL:", await page.evaluate(() => location.href.slice(0, 110)));
  console.log("TITLE:", await page.title());
}
