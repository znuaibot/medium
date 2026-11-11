// yt-upload-r1.mjs — round 1: open the upload dialog and set the video file
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://studio.youtube.com/");
await page.waitForTimeout(6000);

// open the Create menu, then Upload videos
const snap = await page.snapshot();
const lines = snap.split("\n").filter(l => /button|anchor/i.test(l) && /create|upload/i.test(l));
console.log(lines.slice(0, 8).join("\n"));
