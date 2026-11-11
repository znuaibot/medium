// devpost-tags-type.mjs — type tags as real keystrokes with Enter per tag.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-medium-the-glass-seance/project_details/edit");
await page.waitForTimeout(9000);

const TAGS = ["Kiro", "TypeScript", "MCP", "Property-Based Testing", "Spec-driven Development", "Web Audio API", "Canvas", "esbuild", "GlassVM", "Digital Preservation"];

await page.evaluate(() => {
  const inp = document.querySelector('input[name="software[tag_list]"]');
  if (inp) inp.focus();
});
await page.waitForTimeout(500);
for (const tag of TAGS) {
  await page.keyboard.type(tag);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
}
const r = await page.evaluate(() => {
  const tag = document.querySelector('input[name="software[tag_list]"]');
  const tokens = [...document.querySelectorAll(".select2-selection__choice, .token, .tag")].map(x => x.textContent.trim()).slice(0, 14);
  return { leftover: tag ? tag.value : null, tokens };
});
console.log(JSON.stringify(r, null, 1));

// save the step
const saved = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => /save/i.test((x.textContent || "").trim()));
  if (!b) return "no save"; b.click();
  return "saved";
});
console.log(saved);
await page.waitForTimeout(6000);
console.log("URL:", await page.evaluate(() => location.href.slice(0, 120)));
