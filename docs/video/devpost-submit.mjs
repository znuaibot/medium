// devpost-submit.mjs — country=United States, save, then submit the project.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

const step = (n) => console.log("== " + n);

step("country = United States");
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-medium-the-glass-seance/additional-info/edit");
await page.waitForTimeout(9000);
const c = await page.evaluate(() => {
  const el = document.querySelector('select[name="participants_submission_requirements[submission_field_values_attributes][0][value]"]');
  if (!el) return "no country select";
  const opt = [...el.options].find(o => o.text.trim() === "United States" || o.text.trim() === "United States of America");
  if (!opt) return "US option not found";
  el.value = opt.value;
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return "set: " + opt.text.trim();
});
console.log(c);

step("save additional info");
const saved = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => /save/i.test((x.textContent || "").trim()));
  if (!b) return "no save"; b.click();
  return "saved";
});
console.log(saved);
await page.waitForTimeout(7000);

step("finalization: rules checkbox + submit");
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-medium-the-glass-seance/finalization");
await page.waitForTimeout(8000);
const chk = await page.evaluate(() => {
  const box = [...document.querySelectorAll("input[type=checkbox]")].find(x => x.offsetParent !== null);
  if (!box) return "no checkbox";
  if (!box.checked) box.click();
  return "agreed: " + box.checked;
});
console.log(chk);
await page.waitForTimeout(1200);
const sub = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").trim() === "Submit project");
  if (!b) return "no submit button"; b.click();
  return "SUBMIT CLICKED";
});
console.log(sub);
await page.waitForTimeout(12000);
console.log("URL:", await page.evaluate(() => location.href.slice(0, 140)));
const t = await page.evaluate(() => document.body.innerText);
const okIdx = t.search(/(has been submitted|successfully|thanks for submitting|submission received)/i);
console.log(okIdx >= 0 ? "SUCCESS: " + t.slice(okIdx - 80, okIdx + 200).replace(/\n+/g, " | ")
  : "VALIDATION: " + t.slice(t.search(/complete required/i) - 50, t.search(/complete required/i) + 300).replace(/\n+/g, " | "));
