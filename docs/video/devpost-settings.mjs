// devpost-settings.mjs — check the user's profile country on Devpost settings.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://devpost.com/settings/profile");
await page.waitForTimeout(8000);
console.log("URL:", await page.evaluate(() => location.href.slice(0, 80)));
const r = await page.evaluate(() => {
  const out = {};
  for (const sel of document.querySelectorAll("select")) {
    const label = (sel.closest("div,section,li")?.textContent || "").trim().slice(0, 50);
    out[sel.name || label] = sel.value ? sel.options[sel.selectedIndex]?.text : "(empty)";
  }
  for (const inp of document.querySelectorAll("input[type=text], input:not([type])")) {
    if (inp.value && inp.offsetParent !== null) out[inp.name || inp.placeholder || "anon-input"] = inp.value.slice(0, 40);
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
