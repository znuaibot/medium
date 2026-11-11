// devpost-additional.mjs — open the Additional info step and dump its fields.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-medium-the-glass-seance/edit");
await page.waitForTimeout(8000);
const r = await page.evaluate(() => {
  const links = [...document.querySelectorAll("a, button")].filter(x => (x.textContent || "").trim() === "Additional info");
  if (links.length === 0) return "not found";
  links[0].click();
  return "clicked";
});
console.log(r);
await page.waitForTimeout(7000);
console.log("URL:", await page.evaluate(() => location.href.slice(0, 140)));
const t = await page.evaluate(() => document.body.innerText.slice(0, 1600));
console.log(t.replace(/\n+/g, " | ").slice(0, 1300));
