// yt-upload-r5.mjs — click Upload videos on the upload page, set the file,
// then dump the Details dialog fields for the next round.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://studio.youtube.com/channel/UC3_RpyY3g6YffwThX4ifElA/videos/upload");
await page.waitForTimeout(6000);

const snap = await page.snapshot();
const upLine = snap.split("\n").find(l => /button "Upload videos"/.test(l));
const ref = upLine.match(/ref=(\d+)/)[1];
const chooserPromise = page.waitForFileChooser({ timeout: 25000 });
await page.click("ref=" + ref, { label: "点击 Upload videos" });
const chooser = await chooserPromise.catch(() => null);
if (!chooser) throw new Error("file chooser never appeared");
await chooser.setFiles("D:/work/agents/zcode/medium/docs/video/final-demo.mp4");
console.log("file set — upload started");
await page.waitForTimeout(15000);
console.log("TITLE:", await page.title());
const snap2 = await page.snapshot();
console.log(snap2.split("\n").filter(l => /textbox|radio|button "Next|button "Publish|heading/i.test(l)).slice(0, 20).join("\n"));
