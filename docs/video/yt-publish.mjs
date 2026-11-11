// yt-publish.mjs — finish the wizard via DOM clicks: kids=No, Next, Next,
// Public, Publish, grab URL.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

console.log(await page.evaluate(() => {
  const el = [...document.querySelectorAll("[role=radio], tp-yt-paper-radio-button")]
    .find(r => (r.getAttribute("aria-label") || "").includes("not made for kids"));
  if (!el) return "no kids radio";
  el.click();
  return "kids=No clicked";
}));
await page.waitForTimeout(2500);

console.log(await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label") || x.textContent || "").trim() === "Next");
  if (!b) return "no Next"; b.click();
  return "Next->Checks";
}));
await page.waitForTimeout(9000);

console.log(await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label") || x.textContent || "").trim() === "Next");
  if (!b) return "no Next"; b.click();
  return "Next->Visibility";
}));
await page.waitForTimeout(4000);

console.log(await page.evaluate(() => {
  const el = [...document.querySelectorAll("[role=radio], tp-yt-paper-radio-button")]
    .find(r => (r.getAttribute("aria-label") || "").trim() === "Public");
  if (!el) return "no public radio";
  el.click();
  return "Public clicked";
}));
await page.waitForTimeout(3000);

console.log(await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label") || x.textContent || "").trim() === "Publish");
  if (!b) return "no Publish";
  if (b.disabled) return "Publish disabled";
  b.click();
  return "Published";
}));
await page.waitForTimeout(18000);

const url = await page.evaluate(() => {
  const m = document.body.innerText.match(/https:\/\/youtu\.be\/[\w-]+/);
  return m ? m[0] : "link not found; text: " + document.body.innerText.slice(0, 400);
});
console.log("RESULT:", url);
