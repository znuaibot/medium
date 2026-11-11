// yt-upload-r6.mjs — recover from stray native dialogs, then start the upload
// by assigning a File to YouTube's dynamic input programmatically.
const task = await taskSpace("kiroween-hackathon-rules");
let page = task.page("p1");

// 1. dismiss any native file dialog with Escape (twice, to be sure)
try { await page.keyboard.press("Escape"); } catch {}
try { await page.keyboard.press("Escape"); } catch {}
await page.waitForTimeout(1000);

// 2. reload the upload page
await page.goto("https://studio.youtube.com/channel/UC3_RpyY3g6YffwThX4ifElA/videos/upload");
await page.waitForTimeout(7000);

// 3. click the upload button (fresh ref each time)
let snap = await page.snapshot();
let upLine = snap.split("\n").find(l => /button "Upload videos"/.test(l));
if (!upLine) throw new Error("no Upload videos button");
await page.click("ref=" + upLine.match(/ref=(\d+)/)[1], { label: "点击 Upload videos" });
await page.waitForTimeout(4000);

// 4. look for the dynamic file input and assign our file programmatically
const result = await page.evaluate(() => {
  const input = document.querySelector('input[type=file]');
  if (!input) return { ok: false, why: "no input[type=file] in DOM" };
  const B64 = window.__VIDEO_B64;
  if (!B64) return { ok: false, why: "no base64 payload on window" };
  const bin = atob(B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const file = new File([bytes], "final-demo.mp4", { type: "video/mp4" });
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return { ok: true };
});
console.log(JSON.stringify(result));
if (!result.ok) throw new Error(result.why);
await page.waitForTimeout(15000);
console.log("TITLE:", await page.title());
const t = await page.evaluate(() => document.body.innerText.slice(0, 500));
console.log(t);
