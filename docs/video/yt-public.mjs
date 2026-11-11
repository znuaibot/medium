// yt-public.mjs — open the draft dialog, switch to the Visibility tab,
// select Public, Save.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

const step = (n) => console.log("== " + n);
async function findRef(pattern, label) {
  const snap = await page.snapshot();
  const line = snap.split("\n").find(l => pattern.test(l));
  if (!line) throw new Error(`${label}: not found`);
  return line.match(/ref=(\d+)/)[1];
}

step("open draft dialog");
await page.goto("https://studio.youtube.com/channel/UC3_RpyY3g6YffwThX4ifElA/videos");
await page.waitForTimeout(9000);
const editRef = await findRef(/button "Edit draft"/, "Edit draft");
await page.click("ref=" + editRef, { label: "Edit draft" });
await page.waitForTimeout(9000);

step("Visibility tab");
const tabRef = await findRef(/tab \[ref=\d+\]\s*$|tab \[ref=\d+,\s*loc=.*Visibility|text "Visibility"/, "Visibility tab");
// safer: find the tab by its text within the tablist
const snap = await page.snapshot();
const tabLine = snap.split("\n").filter(l => /text "Visibility"/.test(l));
let tabRef2 = null;
// walk backwards from the Visibility text to its tab ref
for (let i = tabLine.length - 1; i >= 0 && !tabRef2; i--) {
  const idx = snap.split("\n").indexOf(tabLine[i]);
  for (let j = idx; j >= Math.max(0, idx - 4); j--) {
    const m = snap.split("\n")[j].match(/tab \[ref=(\d+)\]/);
    if (m) { tabRef2 = m[1]; break; }
  }
}
if (!tabRef2) throw new Error("Visibility tab ref not found");
await page.click("ref=" + tabRef2, { label: "Visibility 标签" });
await page.waitForTimeout(4000);

step("Public radio (DOM click)");
const r = await page.evaluate(() => {
  const pub = [...document.querySelectorAll("[role=radio], tp-yt-paper-radio-button")]
    .find(x => (x.getAttribute("aria-label") || x.textContent || "").trim() === "Public");
  if (!pub) return "no public radio; found: " + JSON.stringify(
    [...document.querySelectorAll("[role=radio], tp-yt-paper-radio-button")].map(x => (x.getAttribute("aria-label") || "").trim().slice(0, 30)));
  pub.click();
  return "PUBLIC selected";
});
console.log(r);
await page.waitForTimeout(2500);

step("Save");
const save = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").trim() === "Save");
  if (!b) return "no Save";
  if (b.disabled) return "Save disabled";
  b.click();
  return "SAVED";
});
console.log(save);
await page.waitForTimeout(9000);
const t = await page.evaluate(() => document.body.innerText);
console.log("post:", (t.match(/(Video published|Changes saved|Saved)/) || ["no token"])[0]);
