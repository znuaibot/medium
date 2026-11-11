// yt-upload-r2.mjs — round 2: trigger upload dialog, set the file, fill
// title/description, and advance through the wizard to publish as public.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://studio.youtube.com/");
await page.waitForTimeout(6000);

// trigger the upload flow and intercept the file chooser
const chooserPromise = page.waitForFileChooser({ timeout: 20000 });
const snap = await page.snapshot();
const createBtn = snap.split("\n").find(l => /button "Create" \[ref=(\d+)\]/.test(l));
const ref = createBtn.match(/ref=(\d+)/)[1];
await page.click("ref=" + ref, { label: "打开 Create 菜单" });
await page.waitForTimeout(1200);
const snap2 = await page.snapshot();
const up = snap2.split("\n").find(l => /button "Upload videos" \[ref=(\d+)\]/.test(l));
const upRef = up.match(/ref=(\d+)/)[1];
const chooser = await chooserPromise.catch(() => null);
// if the chooser opened on click of Upload, set the file; otherwise click Upload first
if (chooser) {
  await chooser.setFiles("D:/work/agents/zcode/medium/docs/video/final-demo.mp4");
  console.log("file set via chooser");
} else {
  await page.click("ref=" + upRef, { label: "点击 Upload videos" });
  const chooser2 = await page.waitForFileChooser({ timeout: 20000 }).catch(() => null);
  if (!chooser2) throw new Error("file chooser never appeared");
  await chooser2.setFiles("D:/work/agents/zcode/medium/docs/video/final-demo.mp4");
  console.log("file set via chooser2");
}
await page.waitForTimeout(9000); // upload dialog opens, processing starts
console.log("TITLE:", await page.title());
const t = await page.evaluate(() => document.body.innerText.slice(0, 600));
console.log(t);
