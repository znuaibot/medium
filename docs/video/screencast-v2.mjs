// screencast-v2.mjs — CDP screenshot-frame recording. Each frame is the page
// viewport itself (no window dependence). Frame list uses real wall-clock
// gaps so the video timeline matches the narration exactly.
// Beats (s): A 15 | B 20 | C 26 | D 18 | E 20 | F 18  => 117s
import { writeFileSync, mkdirSync } from "node:fs";

const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://znuaibot.github.io/medium/");
await page.waitForTimeout(2200);

const FRAMES = "D:/work/agents/zcode/medium/docs/video/frames";
mkdirSync(FRAMES, { recursive: true });

const clickIntent = (label) => page.evaluate((l) => {
  const b = [...document.querySelectorAll(".intent-btn")].find(x => x.textContent.includes(l));
  if (b) b.click();
  return b ? "ok" : "MISSING";
}, label);
const clickCart = (label) => page.evaluate((l) => {
  const b = [...document.querySelectorAll(".cart-btn")].find(x => x.textContent.includes(l));
  if (b) b.click();
  return b ? "ok" : "MISSING";
}, label);
const hoverChip = () => page.evaluate(() => {
  const chip = [...document.querySelectorAll(".evidence-chip")].pop();
  if (chip) chip.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  return chip ? chip.textContent : "no chip";
});

function buildDemoPng() {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const chunk = (type, data) => {
    const out = new Uint8Array(12 + data.length);
    new DataView(out.buffer).setUint32(0, data.length, false);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(data, 8);
    return out;
  };
  const enc = (s) => new Uint8Array([...s].map(c => c.charCodeAt(0)));
  const parts = [new Uint8Array(sig), chunk("IHDR", new Uint8Array(13)),
    chunk("tEXt", [...enc("Keeper\0Ophelia Vane, October 1991"), 0x1a]), chunk("IEND", new Uint8Array(0))];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}
const PNG_B64 = Buffer.from(buildDemoPng()).toString("base64");

let frameNo = 0;
const frameLog = [];
let t0 = Date.now();
async function grab() {
  const name = `frame-${String(++frameNo).padStart(4, "0")}.png`;
  try { await page.screenshot({ path: `${FRAMES}/${name}` }); } catch { return; }
  frameLog.push({ name, t: Date.now() - t0 });
}
/** run one beat: interactions fire at scheduled offsets; frames every ~250ms */
async function beat(durationS, actions) {
  const start = Date.now();
  const end = start + durationS * 1000;
  const fired = actions.map(() => false);
  let i = 0;
  while (Date.now() < end) {
    for (let k = 0; k < actions.length; k++) {
      if (!fired[k] && Date.now() - start >= actions[k].at) { fired[k] = true; await actions[k].fn(); }
    }
    await grab();
    i++;
    if (i > 200) break;
  }
}

await grab(); // first frame before beat A

console.log("=== BEAT A (0-15s): result first");
await beat(15, [
  { at: 1000, fn: () => clickIntent("cheat code") },
  { at: 6500, fn: hoverChip },
  { at: 11000, fn: () => page.evaluate(() => document.body.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }))) },
]);

console.log("=== BEAT B (15-35s): coroner on a dead file");
await beat(20, [
  { at: 500, fn: () => page.evaluate((b64) => {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const dt = new DataTransfer();
      dt.items.add(new File([bytes], "vane-note-1991.png", { type: "image/png" }));
      document.body.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true }));
    }, PNG_B64) },
  { at: 4000, fn: () => page.evaluate(() => { const t = document.getElementById("transcript"); if (t) t.scrollTop = t.scrollHeight; }) },
]);

console.log("=== BEAT C (35-61s): crypt-keeper full loop");
await beat(26, [
  { at: 500, fn: () => clickCart("Crypt Keeper") },
  { at: 2200, fn: () => clickIntent("cheat code") },
  { at: 7000, fn: hoverChip },
  { at: 11500, fn: () => clickIntent("Find hidden") },
  { at: 16500, fn: () => page.evaluate(() => document.body.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }))) },
]);

console.log("=== BEAT D (61-79s): exorcist gate + unknown");
await beat(18, [
  { at: 500, fn: () => page.evaluate(() => {
      const b = [...document.querySelectorAll(".intent-btn")].find(x => x.classList.contains("intent-trap"));
      if (b) b.click();
    }) },
  { at: 3600, fn: () => clickCart("Probe 07") },
  { at: 5600, fn: () => clickIntent("damaged part") },
]);

console.log("=== BEAT E (79-99s): the archive + the Kiro repo");
await beat(20, [
  { at: 800, fn: () => page.goto("https://github.com/znuaibot/medium") },
  { at: 9000, fn: () => page.goto("https://znuaibot.github.io/medium/") },
]);

console.log("=== BEAT F (99-117s): the dead sector close");
await beat(18, [
  { at: 800, fn: () => clickCart("Probe 07") },
  { at: 2600, fn: () => clickIntent("damaged part") },
]);

await grab();
// write concat list with REAL wall-clock gaps
const lines = [];
for (let i = 0; i < frameLog.length; i++) {
  const next = frameLog[i + 1]?.t ?? frameLog[i].t + 500;
  lines.push(`file '${frameLog[i].name}'`);
  lines.push(`duration ${((next - frameLog[i].t) / 1000).toFixed(3)}`);
}
lines.push(`file '${frameLog[frameLog.length - 1].name}'`);
writeFileSync("D:/work/agents/zcode/medium/docs/video/filelist.txt", lines.join("\n") + "\n");
const totalS = (frameLog[frameLog.length - 1].t / 1000).toFixed(1);
console.log(`frames: ${frameLog.length}, wall duration: ${totalS}s -> filelist.txt`);
writeFileSync("D:/work/agents/zcode/medium/docs/video/drive-log.txt", `frames=${frameLog.length} duration=${totalS}s`);
