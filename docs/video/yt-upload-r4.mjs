// yt-upload-r4.mjs — open the Create menu first, then its Upload videos item.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://studio.youtube.com/");
await page.waitForTimeout(9000);

let snap = await page.snapshot();
const dbg = snap.split("\n").filter(l => /button/i.test(l) && /create|upload/i.test(l));
console.log("--- candidates:\n" + dbg.slice(0, 10).join("\n"));

const createLine = dbg.find(l => /button "Create"/.test(l) && !/post/i.test(l));
if (!createLine) throw new Error("no Create button in snapshot");
const ref1 = createLine.match(/ref=(\d+)/)[1];
await page.click("ref=" + ref1, { label: "打开 Create 菜单" });
await page.waitForTimeout(1500);

snap = await page.snapshot();
const upLine = snap.split("\n").find(l => /button "Upload videos"/.test(l));
console.log("--- upload item: " + (upLine ?? "NOT FOUND"));
if (!upLine) throw new Error("no Upload videos item after opening menu");
const ref2 = upLine.match(/ref=(\d+)/)[1];

const chooserPromise = page.waitForFileChooser({ timeout: 25000 });
await page.click("ref=" + ref2, { label: "点击 Upload videos" });
const chooser = await chooserPromise.catch(() => null);
if (!chooser) throw new Error("file chooser never appeared");
await chooser.setFiles("D:/work/agents/zcode/medium/docs/video/final-demo.mp4");
console.log("file set");
await page.waitForTimeout(12000);
console.log("TITLE:", await page.title());
const t = await page.evaluate(() => document.body.innerText.slice(0, 400));
console.log(t);
