// devpost-overview3.mjs — tagline, then save overview.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.fill('css:textarea[name="participants_manage_project_overview[tagline]"]', "A verifiable séance for forgotten software — run, inspect, and explain dead programs with byte-cited evidence. Never hallucinated.");
await page.waitForTimeout(700);
console.log("tagline filled");

const saved = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => /save/i.test((x.textContent || "").trim()));
  if (!b) return "no save button";
  const label = (b.textContent || "").trim();
  b.click();
  return "clicked: " + label;
});
console.log(saved);
await page.waitForTimeout(7000);
console.log("URL:", await page.evaluate(() => location.href.slice(0, 130)));
const t = await page.evaluate(() => document.body.innerText.slice(0, 500));
console.log(t.replace(/\n+/g, " | ").slice(0, 450));
