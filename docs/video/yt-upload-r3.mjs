// yt-upload-r3.mjs — robust: click the aria-labeled Upload videos button,
// intercept the chooser, set the file, wait for the upload dialog.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://studio.youtube.com/");
await page.waitForTimeout(8000);

// the dashboard exposes a dedicated upload button; try direct CSS locator
const chooserPromise = page.waitForFileChooser({ timeout: 25000 });
let clicked = false;
try {
  await page.click('css:button[aria-label="Upload videos"]', { label: "点击 Upload videos" });
  clicked = true;
} catch (e) {
  console.log("direct click failed, trying snapshot route:", String(e).slice(0, 60));
}
if (!clicked) {
  const snap = await page.snapshot();
  const line = snap.split("\n").find(l => /"Upload videos"/.test(l) && /ref=(\d+)/.test(l));
  if (!line) throw new Error("no upload button found");
  await page.click("ref=" + line.match(/ref=(\d+)/)[1], { label: "点击 Upload videos" });
}
const chooser = await chooserPromise.catch(() => null);
if (!chooser) throw new Error("file chooser never appeared");
await chooser.setFiles("D:/work/agents/zcode/medium/docs/video/final-demo.mp4");
console.log("file set");
await page.waitForTimeout(12000);
console.log("TITLE:", await page.title());
const t = await page.evaluate(() => document.body.innerText.slice(0, 500));
console.log(t);
