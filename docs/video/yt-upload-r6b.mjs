// yt-upload-r6b.mjs — recover, click upload, then assign the file to the
// dynamic input via ego's setInputFiles (CDP DOM.setFileInputFiles).
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
try { await page.keyboard.press("Escape"); } catch {}
await page.waitForTimeout(800);
await page.goto("https://studio.youtube.com/channel/UC3_RpyY3g6YffwThX4ifElA/videos/upload");
await page.waitForTimeout(7000);

let snap = await page.snapshot();
let upLine = snap.split("\n").find(l => /button "Upload videos"/.test(l));
if (!upLine) throw new Error("no Upload videos button");
await page.click("ref=" + upLine.match(/ref=(\d+)/)[1], { label: "点击 Upload videos" });
await page.waitForTimeout(4500);

// find the dynamic input and assign the real file
const inputInfo = await page.evaluate(() => {
  const inputs = [...document.querySelectorAll('input[type=file]')];
  return inputs.length;
});
console.log("dynamic inputs:", inputInfo);
if (inputInfo > 0) {
  await page.setInputFiles('css:input[type=file]', "D:/work/agents/zcode/medium/docs/video/final-demo.mp4");
  console.log("file assigned via setInputFiles");
} else {
  throw new Error("no dynamic input appeared after click");
}
await page.waitForTimeout(18000);
console.log("TITLE:", await page.title());
const t = await page.evaluate(() => document.body.innerText.slice(0, 600));
console.log(t);
