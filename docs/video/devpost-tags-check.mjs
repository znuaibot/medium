// devpost-tags-check.mjs — inspect tag tokenization state.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-medium-the-glass-seance/project_details/edit");
await page.waitForTimeout(9000);
const r = await page.evaluate(() => {
  const tag = document.querySelector('input[name="software[tag_list]"]');
  const tokens = [...document.querySelectorAll(".select2-selection__choice, .token, .tag")].map(x => x.textContent.trim()).slice(0, 12);
  return { tagInputValue: tag ? tag.value : null, tokens };
});
console.log(JSON.stringify(r, null, 1));
