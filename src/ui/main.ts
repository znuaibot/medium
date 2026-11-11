// main.ts — the instrument: three panels, cartridge switcher, file séance,
// certificate export. No network calls anywhere.
import { GlassVm } from "../vm/glass-vm.ts";
import { inspectBytes, type Autopsy } from "../coroner/static-inspector.ts";
import { hypernote } from "../cartridges/hypernote.ts";
import { cryptKeeper } from "../cartridges/crypt-keeper.ts";
import { telemetry } from "../cartridges/telemetry.ts";
import type { Cartridge } from "../cartridges/index.ts";
import { MediumEngine, type TranscriptEntry } from "./medium-engine.ts";
import { createScreen, createMemoryGrid } from "./screen.ts";
import { ask, runTrap } from "./chamber.ts";
import { setMuted, click, tone } from "./audio.ts";
import { certificateHtml } from "./certificate.ts";

const CARTS: Cartridge[] = [cryptKeeper, hypernote, telemetry];

let engine: MediumEngine;
let vm: GlassVm;
let currentCart: Cartridge;
let screenRender: (mem: Uint8Array) => void;
let gridRender: (mem: Uint8Array, hot: Array<{ start: number; end: number }>) => void;

const $ = (id: string) => document.getElementById(id)!;

function boot(cart: Cartridge): void {
  currentCart = cart;
  vm = new GlassVm(cart.program, 0x0200, cart.input);
  for (const p of cart.data) vm.mem.set(p.bytes, p.addr);
  vm.run(5000);
  engine = new MediumEngine(cart, vm);
  deps.engine = engine;
  $("cart-title").textContent = `${cart.title} · ${cart.year}`;
  $("cart-origin").textContent = cart.originNote;
  $("transcript").replaceChildren();
  $("gate-log").replaceChildren();
  $("inspector").classList.add("hidden");
  // rebuild intent buttons from the cartridge's ledger
  const bar = $("intents");
  bar.replaceChildren();
  for (const entry of cart.ledger) {
    if (entry.intent === "hallucination-trap") continue; // trap button added explicitly below
    const b = document.createElement("button");
    b.className = "intent-btn";
    b.textContent = INTENT_LABEL[entry.intent] ?? entry.intent;
    b.addEventListener("click", () => { click(); ask(deps, entry.intent, INTENT_Q[entry.intent] ?? entry.intent); });
    bar.appendChild(b);
  }
  const trap = document.createElement("button");
  trap.className = "intent-btn intent-trap";
  trap.textContent = "Hallucination trap";
  trap.title = "Inject a forged claim and watch the Exorcist Gate block it";
  trap.addEventListener("click", () => runTrap(deps));
  bar.appendChild(trap);
  refresh();
}

function refresh(): void {
  screenRender(vm.mem);
  gridRender(vm.mem, []);
}

const INTENT_LABEL: Record<string, string> = {
  "what-is": "What is this?",
  "find-easter-egg": "Find hidden easter eggs",
  "cheat-code": "Is there a cheat code?",
  "corrupted-region": "What about the damaged part?",
  "hallucination-trap": "Hallucination trap",
};
const INTENT_Q: Record<string, string> = {
  "what-is": "What am I looking at?",
  "find-easter-egg": "Does anything hide inside?",
  "cheat-code": "Is there a cheat code?",
  "corrupted-region": "What does the damaged part say?",
  "hallucination-trap": "Tell me the author's full name and address.",
};

const deps = {
  transcriptEl: $("transcript"),
  gateLogEl: $("gate-log"),
  engine: null as unknown as MediumEngine,
  onEvidence: (hot: Array<{ start: number; end: number }>) => gridRender(vm.mem, hot),
};

// file séance: drop any real dead file -> Coroner autopsy -> evidence chips
async function fileSeance(file: File): Promise<void> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const autopsy: Autopsy = inspectBytes(bytes);
  const wrap = $("coroner-report");
  wrap.classList.remove("hidden");
  $("coroner-title").textContent = `The Coroner speaks · ${file.name}`;
  $("coroner-body").textContent =
    `format ${autopsy.format} · ${autopsy.size} bytes · entropy ${autopsy.entropy}/8 · ` +
    autopsy.findings.map((f) => `${f.label}${f.offset !== undefined ? ` @0x${f.offset.toString(16)}` : ""}: ${f.detail}`).join(" | ");
  // findings become real evidence chips in the transcript
  $("transcript").replaceChildren();
  const entry = document.createElement("div");
  entry.className = `se-entry se-${autopsy.findings.length > 0 ? "verified" : "unknown"}`;
  entry.innerHTML =
    `<div class="se-head"><span class="badge badge-${autopsy.findings.length > 0 ? "verified" : "unknown"}">${autopsy.findings.length > 0 ? "VERIFIED" : "UNKNOWN"}</span>` +
    `<span class="se-id">C-FILE</span></div>` +
    `<div class="se-body">${autopsy.findings.length > 0
      ? autopsy.findings.map((f) => `${f.label} — ${f.detail}${f.offset !== undefined ? ` (evidence at file offset 0x${f.offset.toString(16)})` : ""}`).join(" · ")
      : "No ghost responds to this file. I find no readable traces worth citing — it may be alive, or empty, or simply quiet."}</div>`;
  $("transcript").appendChild(entry);
  // hot cells: findings' offsets light up in the memory grid over a padded image
  const padded = new Uint8Array(4096);
  padded.set(bytes.slice(0, 4096));
  gridRender(padded, autopsy.findings.filter((f) => f.offset !== undefined).map((f) => ({ start: f.offset!, end: f.offset! + (f.byteLen ?? 1) })));
  screenRender(asciiScreen(file.name + "\n" + autopsy.strings.slice(0, 7).map((s) => s.text).join("\n")));
  click();
}

function asciiScreen(text: string): Uint8Array {
  const mem = new Uint8Array(4096);
  const lines = text.split("\n");
  lines.slice(0, 16).forEach((line, r) => {
    [...line.slice(0, 64)].forEach((ch, c) => { mem[0x0400 + r * 64 + c] = ch.charCodeAt(0); });
  });
  return mem;
}

// wiring
function init(): void {
  deps.engine = null as unknown as MediumEngine;
  screenRender = createScreen($("screen") as HTMLCanvasElement).render;
  gridRender = createMemoryGrid($("memgrid") as HTMLCanvasElement, (addr) => {
    const inspector = $("inspector");
    inspector.classList.remove("hidden");
    const b = vm.mem[addr]!;
    inspector.querySelector(".insp-addr")!.textContent = `0x${addr.toString(16)} (${addr})`;
    inspector.querySelector(".insp-hex")!.textContent = b.toString(16).padStart(2, "0");
    inspector.querySelector(".insp-ascii")!.textContent = b >= 32 && b < 127 ? String.fromCharCode(b) : "·";
    inspector.querySelector(".insp-note")!.textContent = "live memory cell — click any evidence chip to jump here";
  });
  const switcher = $("switcher");
  for (const cart of CARTS) {
    const b = document.createElement("button");
    b.className = "cart-btn";
    b.textContent = `${cart.title} '${cart.year.slice(2)}`;
    b.addEventListener("click", () => { click(); boot(cart); });
    switcher.appendChild(b);
  }
  // keyboard: keys flow into a fresh VM run for interactive replay
  document.addEventListener("keydown", (e) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key.length === 1) tone(0);
  });
  $("mute").addEventListener("click", () => {
    const m = !($("mute") as HTMLInputElement).checked;
    setMuted(m);
  });
  $("export").addEventListener("click", () => {
    const html = certificateHtml(engine.archive(), currentCart);
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `certificate-of-seance-${currentCart.id}.html`;
    a.click();
    click();
  });
  // file drop on the whole window
  document.addEventListener("dragover", (e) => e.preventDefault());
  document.addEventListener("drop", (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) void fileSeance(f);
  });
  boot(CARTS[0]!);
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}
