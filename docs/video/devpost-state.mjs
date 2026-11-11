// devpost-state.mjs — full state audit of both steps before continuing.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-medium-the-glass-seance/project_details/edit");
await page.waitForTimeout(9000);
const details = await page.evaluate(() => {
  const tokens = [...document.querySelectorAll(".select2-selection__choice, .token, .tag, .select2-selection__rendered")].map(x => x.textContent.trim()).filter(x => x).slice(0, 14);
  const tag = document.querySelector('input[name="software[tag_list]"]');
  const video = document.querySelector('input[name="software[video_url]"]');
  const desc = document.querySelector('textarea[name="software[description]"]');
  const links = [...document.querySelectorAll('input[name*="urls_attributes"]')].map(i => i.value);
  return {
    tokens, tagValue: tag ? tag.value : null,
    video: video ? video.value : null,
    descLen: desc ? desc.value.length : 0,
    links,
  };
});
console.log("DETAILS:", JSON.stringify(details, null, 1));

await page.goto("https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1295796-medium-the-glass-seance/additional-info/edit");
await page.waitForTimeout(8000);
const additional = await page.evaluate(() => {
  const country = document.querySelector('select[name="participants_submission_requirements[submission_field_values_attributes][0][value]"]');
  const category = document.querySelector('select[name="participants_submission_requirements[submission_field_values_attributes][3][value]"]');
  const gh = document.querySelector('input[name="participants_submission_requirements[submission_field_values_attributes][4][value]"]');
  const demo = document.querySelector('input[name="participants_submission_requirements[submission_field_values_attributes][5][value]"]');
  const kiro = document.querySelector('textarea[name="participants_submission_requirements[submission_field_values_attributes][7][value]"]');
  const bonus = document.querySelector('select[name="participants_submission_requirements[opt_in_prize_ids][]"]');
  return {
    country: country ? country.value : "no field",
    category: category ? category.value : "no field",
    github: gh ? gh.value : null,
    demo: demo ? demo.value : null,
    kiroLen: kiro ? kiro.value.length : 0,
    bonusSelected: bonus ? [...bonus.selectedOptions].map(o => o.text) : [],
  };
});
console.log("ADDITIONAL:", JSON.stringify(additional, null, 1));
