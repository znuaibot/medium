// devpost-overview.mjs — fix the project overview: real name, tagline, description.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-o/overview/edit");
await page.waitForTimeout(9000);
console.log("URL:", await page.evaluate(() => location.href.slice(0, 130)));
const t = await page.evaluate(() => document.body.innerText.slice(0, 700));
console.log(t.replace(/\n+/g, " | ").slice(0, 600));
const snap = await page.snapshot();
console.log("--- textboxes:");
console.log(snap.split("\n").filter(l => /textbox/i.test(l)).slice(0, 10).join("\n"));
