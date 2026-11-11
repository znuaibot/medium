// devpost-fill3.mjs — video URL, tags, links for the Project details step.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

// 1. video URL
await page.fill('css:input[name="software[video_url]"]', "https://youtu.be/c1W0nb-_lOk");
await page.waitForTimeout(800);
console.log("video url:", await page.evaluate(() => document.querySelector('input[name="software[video_url]"]').value));

// 2. scroll to the tags/links area (upper-middle of the form)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.4));
await page.waitForTimeout(1200);
let snap = await page.snapshot();
console.log("--- mid-form controls:");
console.log(snap.split("\n").filter(l => /textbox|button|combobox/i.test(l)).slice(0, 16).join("\n"));
