// devpost-fill6.mjs — add GitHub link (JS click), save the step.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

const added = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button, a")].find(x => /ADD ANOTHER LINK/i.test((x.textContent || "").trim()));
  if (!b) return "no add-another button";
  b.click();
  return "clicked";
});
console.log(added);
await page.waitForTimeout(1500);

const url1 = await page.evaluate(() => !!document.querySelector('input[name="software[urls_attributes][1][url]"]'));
console.log("second url field:", url1);
if (url1) {
  await page.fill('css:input[name="software[urls_attributes][1][url]"]', "https://github.com/znuaibot/medium");
  await page.waitForTimeout(600);
  console.log("github link filled");
}

// save & continue (button text may be "Save & continue")
const saved = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => /save/i.test((x.textContent || "").trim()));
  if (!b) return "no save button";
  const label = (b.textContent || "").trim();
  b.click();
  return "clicked: " + label;
});
console.log(saved);
await page.waitForTimeout(7000);
console.log("URL:", await page.evaluate(() => location.href.slice(0, 120)));
const t = await page.evaluate(() => document.body.innerText.slice(0, 400));
console.log(t.replace(/\n+/g, " | ").slice(0, 350));
