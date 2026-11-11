// devpost-fill4.mjs — tags, links, then save the step.
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
const TAGS = ["Kiro", "TypeScript", "MCP", "Property-Based Testing", "Spec-driven Development", "Web Audio API", "Canvas", "esbuild", "GlassVM", "Digital Preservation"];

// 1. tags into the unlabeled input (ref 1076-style: the input above urls_attributes)
const tagInput = await page.evaluate(() => {
  const inp = document.querySelector('input[name="software[urls_attributes][0][url]"]');
  let t = inp;
  for (let i = 0; i < 12 && t; i++) {
    t = t.previousElementSibling || t.parentElement && t.parentElement.previousElementSibling;
    if (t && t.matches && t.matches("input") && !t.name) return t;
  }
  return null;
});
// fallback: find any input without name (tag inputs usually nameless)
const allInputs = await page.evaluate(() => [...document.querySelectorAll("input")].map(i => ({ name: i.name, placeholder: i.placeholder, type: i.type, visible: i.offsetParent !== null })));
console.log(JSON.stringify(allInputs.filter(i => i.visible)));
