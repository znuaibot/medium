// devpost-overview2.mjs — set the real project title, dump/other fields, save.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.fill('css:input[name="participants_manage_project_overview[title]"]', "MEDIUM — The Glass Séance");
await page.waitForTimeout(600);
console.log("title:", await page.evaluate(() => document.querySelector('input[name="participants_manage_project_overview[title]"]').value));

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1500);
const snap = await page.snapshot();
console.log("--- other controls:");
console.log(snap.split("\n").filter(l => /textbox|combobox|checkbox|radio|button/i.test(l)).slice(0, 16).join("\n"));
