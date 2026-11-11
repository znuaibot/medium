// drive-recording.mjs — performs the video beats against the live app with
// exact dwell times, spawning the desktop capture itself (frame 0 = beat 0).
// Beat durations (s): A 15 | B 20 | C 26 | D 18 | E 20 | F 18  => ~117s
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const task = await taskSpace("kiroween-hackathon-rules");
const page = task.page("p1");
await page.goto("https://znuaibot.github.io/medium/");
await page.waitForTimeout(2200);

// capture starts NOW; beat A begins on the next statement
const ff = spawn("ffmpeg", ["-y", "-f", "gdigrab", "-framerate", "30",
  "-offset_x", "0", "-offset_y", "0", "-video_size", "1600x950", "-i", "desktop",
  "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p",
  "-t", "124", "D:/work/agents/zcode/medium/docs/video/raw-take.mp4"], { stdio: "ignore" });
await new Promise(r => setTimeout(r, 900));

const clickIntent = (label) => page.evaluate((l) => {
  const b = [...document.querySelectorAll(".intent-btn")].find(x => x.textContent.includes(l));
  if (b) b.click();
  return b ? "clicked" : "MISSING";
}, label);
const clickCart = (label) => page.evaluate((l) => {
  const b = [...document.querySelectorAll(".cart-btn")].find(x => x.textContent.includes(l));
  if (b) b.click();
  return b ? "clicked" : "MISSING";
}, label);
const hoverChip = () => page.evaluate(() => {
  const chip = [...document.querySelectorAll(".evidence-chip")].pop();
  if (chip) chip.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  return chip ? chip.textContent : "no chip";
});
const hoverOff = () => page.evaluate(() => {
  document.body.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
  return "off";
});

// beat B payload: a real PNG carrying a tEXt note (our own demo artifact)
const png = buildDemoPng();
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
async function dropDeadFile() {
  await page.evaluate((b64) => {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const file = new File([bytes], "vane-note-1991.png", { type: "image/png" });
    const dt = new DataTransfer();
    dt.items.add(file);
    document.body.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true }));
    return "dropped";
  }, Buffer.from(png).toString("base64"));
}

const sleep = (ms) => page.waitForTimeout(ms);
console.log("=== BEAT A (0-15s): result first");
console.log(await clickIntent("cheat code"));
await sleep(3600);           // automatic writing
console.log(await hoverChip());
await sleep(4000);
console.log(await hoverOff());
await sleep(6400);           // rest of beat A

console.log("=== BEAT B (15-35s): coroner on a dead file");
await dropDeadFile();
await sleep(2500);
await page.evaluate(() => {
  const t = document.getElementById("transcript");
  if (t) t.scrollTop = t.scrollHeight;
});
await sleep(3500);
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(13000);

console.log("=== BEAT C (35-61s): crypt-keeper full loop");
console.log(await clickCart("Crypt Keeper"));
await sleep(1800);
console.log(await clickIntent("cheat code"));
await sleep(4200);
console.log(await hoverChip());
await sleep(3200);
console.log(await hoverOff());
console.log(await clickIntent("Find hidden"));
await sleep(4200);
await sleep(12000);

console.log("=== BEAT D (61-79s): exorcist gate + unknown");
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".intent-btn")].find(x => x.classList.contains("intent-trap"));
  if (b) b.click();
});
await sleep(2600);
console.log(await clickCart("Probe 07"));
await sleep(1200);
console.log(await clickIntent("damaged part"));
await sleep(4500);
await sleep(9500);

console.log("=== BEAT E (79-99s): the archive + the Kiro repo");
await page.goto("https://github.com/znuaibot/medium");
await sleep(6500);
await page.goto("https://znuaibot.github.io/medium/");
await sleep(2500);
await sleep(10000);

console.log("=== BEAT F (99-117s): the dead sector close");
console.log(await clickCart("Probe 07"));
await sleep(1200);
console.log(await clickIntent("damaged part"));
await sleep(4800);
await sleep(11000);

console.log("=== recording choreography done (117s)");
writeFileSync("D:/work/agents/zcode/medium/docs/video/drive-log.txt", "choreography complete");
