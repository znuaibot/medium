// devpost-fill.mjs — fill the Project details step of the Devpost submission:
// story (markdown), built-with tags, try-it-out links, video URL.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-o/edit");
await page.waitForTimeout(9000);

console.log("URL:", await page.evaluate(() => location.href.slice(0, 90)));
const t = await page.evaluate(() => document.body.innerText.slice(0, 300));
console.log("page:", t.replace(/\n+/g, " | ").slice(0, 250));
