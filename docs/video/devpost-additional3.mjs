// devpost-additional3.mjs — fill every determinable field on Additional info.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

const setSelect = (name, text) => page.evaluate(([nm, tx]) => {
  const el = document.querySelector(`select[name="${nm}"]`);
  if (!el) return "no select";
  const opt = [...el.options].find(o => o.text.trim().startsWith(tx) || o.text.trim() === tx);
  if (!opt) return "option not found: " + tx + " | have: " + [...el.options].map(o => o.text.trim()).slice(0, 8).join("/");
  el.value = opt.value;
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return "set: " + opt.text.trim();
}, [name, text]);

const setText = (name, value) => page.evaluate(([nm, v]) => {
  const el = document.querySelector(`[name="${nm}"]`);
  if (!el) return "no input";
  el.value = v;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return "set";
}, [name, value]);

console.log("category:", await setSelect("participants_submission_requirements[submission_field_values_attributes][3][value]", "Resurrection"));
console.log("github:", await setText("participants_submission_requirements[submission_field_values_attributes][4][value]", "https://github.com/znuaibot/medium"));
console.log("demo:", await setText("participants_submission_requirements[submission_field_values_attributes][5][value]", "https://znuaibot.github.io/medium/"));
console.log("testing:", await setText("participants_submission_requirements[submission_field_values_attributes][6][value]", "No login needed. Open the URL, pick a cartridge, press the preset question buttons (including the Hallucination trap), or drop any old file onto the page for a Coroner autopsy. A 60-second quickstart lives in the repo README."));
console.log("kiro-tech:", await setText("participants_submission_requirements[submission_field_values_attributes][7][value]", "Built entirely with Kiro. Spec-driven development: EARS requirements in .kiro/specs froze the ISA, memory map and truthfulness contract before code. Agent hooks run typecheck+tests on every save. An MCP server (inspect_artifact / read_vm_memory / search_memory_strings / verify_ghost_claim) lets any agent run the same seance. Property-based testing (6 properties x 1000 cases) caught a real determinism bug in the receipt model. A three-role build-time crew (strategist / critical advisor / domain expert) audited the narrative. Steering files govern truthfulness, the 1-bit aesthetic and scope. Full details: KIRO_WRITEUP.md in the repo."));
console.log("disclosure:", await setText("participants_submission_requirements[submission_field_values_attributes][8][value]", "Standard development resources only: TypeScript, esbuild (dev-time bundling), fast-check (tests). Full dependency + provenance disclosure in COMPLIANCE.md. All product code authored during the Submission Period."));
console.log("crew url:", await setText("participants_submission_requirements[submission_field_values_attributes][12][value]", "https://github.com/znuaibot/medium (crew-app/ package inside)"));

// bonus multiselect: Best Kiro Crew App only (blog/social need their URLs first)
const bonus = await page.evaluate(() => {
  const sel = document.querySelector('select[name="participants_submission_requirements[opt_in_prize_ids][]"]');
  if (!sel) return "no bonus select";
  for (const o of sel.options) {
    if (o.text.trim() === "Best Kiro Crew App") { o.selected = true; }
  }
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return "selected: " + [...sel.selectedOptions].map(o => o.text).join(",");
});
console.log("bonus:", bonus);

console.log("kiroween2025:", await setSelect("participants_submission_requirements[submission_field_values_attributes][15][value]", "No"));
console.log("submitter type:", await setSelect("participants_submission_requirements[submission_field_values_attributes][16][value]", "Individual"));
console.log("aws employee:", await setSelect("participants_submission_requirements[submission_field_values_attributes][18][value]", "No"));

// surveys: pick the most positive option that exists
for (const idx of [19, 20]) {
  console.log(`survey[${idx}]:`, await page.evaluate((i) => {
    const el = document.querySelector(`select[name="participants_submission_requirements[submission_field_values_attributes][${i}][value]"]`);
    if (!el) return "none";
    const positive = [...el.options].filter(o => o.value).pop();
    if (!positive) return "no options";
    el.value = positive.value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return "set: " + positive.text.trim();
  }, idx));
}

// save & continue
const saved = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => /save/i.test((x.textContent || "").trim()));
  if (!b) return "no save";
  const label = (b.textContent || "").trim();
  b.click();
  return "clicked: " + label;
});
console.log(saved);
await page.waitForTimeout(7000);
console.log("URL:", await page.evaluate(() => location.href.slice(0, 130)));
