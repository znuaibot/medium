// devpost-complete-details.mjs — tags via select2 suggestions, GitHub link, save.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-medium-the-glass-seance/project_details/edit");
await page.waitForTimeout(9000);

const TAGS = ["Kiro", "TypeScript", "MCP", "Property-Based Testing", "Web Audio API", "esbuild"];
let report = [];
for (const tag of TAGS) {
  await page.evaluate(() => {
    const inp = document.querySelector('input[name="software[tag_list]"]');
    if (inp) inp.focus();
  });
  await page.waitForTimeout(400);
  await page.keyboard.type(tag);
  await page.waitForTimeout(1600);
  const clicked = await page.evaluate((t) => {
    const opts = [...document.querySelectorAll(".select2-results__option, li[class*=result], [class*=select2] li")];
    const best = opts.find(o => (o.textContent || "").trim().toLowerCase().startsWith(t.toLowerCase()));
    if (best) { best.click(); return t + "→selected"; }
    // fallback: press Enter to create the tag if the widget allows it
    return t + "→no suggestion (" + opts.length + " opts)";
  }, tag);
  report.push(clicked);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
}
console.log("TAGS:", JSON.stringify(report));

// GitHub link: click ADD ANOTHER LINK (JS), wait, fill any new url field
const add = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button, a")].find(x => /ADD ANOTHER LINK/i.test((x.textContent || "").trim()));
  if (!b) return "no button";
  b.click();
  return "clicked";
});
console.log("add-another:", add);
await page.waitForTimeout(2000);
const linkState = await page.evaluate(() => {
  const fields = [...document.querySelectorAll('input[name*="urls_attributes"]')];
  return fields.map(f => ({ name: f.name, value: f.value }));
});
console.log("link fields:", JSON.stringify(linkState));
const emptyLink = linkState.find(f => !f.value);
if (emptyLink) {
  await page.fill(`css:input[name="${emptyLink.name}"]`, "https://github.com/znuaibot/medium");
  console.log("github filled into", emptyLink.name);
}

// save
const saved = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => /save/i.test((x.textContent || "").trim()));
  if (!b) return "no save"; b.click();
  return "saved";
});
console.log(saved);
await page.waitForTimeout(7000);
console.log("URL:", await page.evaluate(() => location.href.slice(0, 130)));
