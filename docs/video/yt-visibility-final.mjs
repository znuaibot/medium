// yt-visibility-final.mjs — mouse-event clicks at computed coordinates.
// paper-tabs and paper-radios need real pointer events, not element.click().
import { writeFileSync } from "node:fs"; // (any import forces ESM parsing for top-level await)
const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");

async function rectOf() {
  return await page.evaluate(() => {
    const walk = (root, depth, fn) => { if (depth > 14) return; for (const el of root.querySelectorAll("*")) { fn(el); if (el.shadowRoot) walk(el.shadowRoot, depth + 1, fn); } };
    let rect = null;
    walk(document.body, 0, (el) => {
      if (rect) return;
      const t = (el.textContent || "").trim();
      if (el.tagName === "YTCP-VE" && t === "Visibility") {
        let p = el;
        for (let i = 0; i < 8 && p; i++) { if (p.tagName === "TP-YT-PAPER-DIALOG") { rect = el.getBoundingClientRect(); return; } p = p.parentElement; }
      }
    });
    return rect ? { x: rect.x, y: rect.y, w: rect.width, h: rect.height } : null;
  });
}

step("open dialog");
await page.goto("https://studio.youtube.com/channel/UC3_RpyY3g6YffwThX4ifElA/videos");
await page.waitForTimeout(9000);
const editRef = await findRefSoft(/button "Edit draft"/);
if (!editRef) throw new Error("no Edit draft");
await page.click("ref=" + editRef, { label: "Edit draft" });
await page.waitForTimeout(9000);

async function findRefSoft(pattern) {
  const snap = await page.snapshot();
  const line = snap.split("\n").find(l => pattern.test(l));
  return line ? line.match(/ref=(\d+)/)[1] : null;
}
function step(n) { console.log("== " + n); }

step("click Visibility tab (mouse at rect)");
let r = await rectOf();if (!r) throw new Error("Visibility tab rect not found");
await page.mouse.click(r.x + r.w / 2, r.y + r.h / 2, { label: "Visibility tab" });
await page.waitForTimeout(4500);

step("click Public radio (mouse at rect)");
r = await page.evaluate(() => {
  const radios = [];
  const walk = (root, depth) => { if (depth > 14) return; for (const el of root.querySelectorAll("*")) { if (/radio-button/i.test(el.tagName) || el.getAttribute?.("role") === "radio") radios.push(el); if (el.shadowRoot) walk(el.shadowRoot, depth + 1); } };
  walk(document.body, 0);
  for (const radio of radios) {
    let ctx = radio, text = "";
    for (let i = 0; i < 7 && ctx.parentElement; i++) { ctx = ctx.parentElement; text = (ctx.textContent || "").trim().replace(/\s+/g, " "); if (/Public/i.test(text)) break; }
    if (/^Public\b/i.test(text)) { const rc = radio.getBoundingClientRect(); return { x: rc.x, y: rc.y, w: rc.width, h: rc.height, total: radios.length }; }
  }
  return { total: radios.length, none: true };
});
console.log("radio probe:", JSON.stringify(r));
if (r.none) throw new Error("no public radio rect");
await page.mouse.click(r.x + r.w / 2, r.y + r.h / 2, { label: "Public radio" });
await page.waitForTimeout(3000);

step("click Publish/Save (mouse at rect)");
r = await page.evaluate(() => {
  const btns = [...document.querySelectorAll("button")].filter(b => /^(Publish|Save)$/i.test((b.textContent || "").trim()));
  for (const b of btns) { const rc = b.getBoundingClientRect(); if (rc.width > 0) return { x: rc.x, y: rc.y, w: rc.width, h: rc.height, label: (b.textContent || "").trim(), disabled: b.disabled }; }
  return { none: true, count: btns.length };
});
console.log("button probe:", JSON.stringify(r));
if (!r.none && !r.disabled) {
  await page.mouse.click(r.x + r.w / 2, r.y + r.h / 2, { label: r.label });
  await page.waitForTimeout(15000);
}

step("grab URL + status");
const done = await page.evaluate(() => {
  const m = document.body.innerText.match(/https:\/\/youtu\.be\/[\w-]+/);
  const vis = (document.body.innerText.match(/\b(Private|Public|Unlisted)\b/) || [])[0];
  return (m ? m[0] : "no link") + " | visibility-token: " + (vis ?? "?");
});
console.log("RESULT:", done);
