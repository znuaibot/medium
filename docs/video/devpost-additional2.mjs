// devpost-additional2.mjs — select our three bonus prizes, dump remaining fields.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
const wanted = ["Best Kiro Crew App", "Bonus Blog Prize", "Social Blitz Prize"];
const r = await page.evaluate((wanted) => {
  const clicked = [], missing = [];
  for (const w of wanted) {
    const box = [...document.querySelectorAll("input[type=checkbox]")].find(c => {
      const label = c.closest("label") || c.parentElement;
      return (label?.textContent || "").includes(w);
    });
    if (box) { if (!box.checked) box.click(); clicked.push(w + "=" + box.checked); }
    else missing.push(w);
  }
  return { clicked, missing };
}, wanted);
console.log(JSON.stringify(r));

// scroll through the rest of the form and report fields
for (let i = 1; i <= 4; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * 900);
  await page.waitForTimeout(700);
}
const t = await page.evaluate(() => document.body.innerText);
const ki = t.indexOf("Kiro");
console.log("--- form tail (relevant):");
console.log(t.replace(/\n+/g, " | ").slice(0, 100).concat(" ... "));
const fields = await page.evaluate(() => ({
  textareas: [...document.querySelectorAll("textarea")].map(x => x.name || x.placeholder || "anon"),
  selects: [...document.querySelectorAll("select")].map(x => x.name),
  textinputs: [...document.querySelectorAll("input[type=text]")].map(x => x.name || x.placeholder || "anon"),
}));
console.log(JSON.stringify(fields));
