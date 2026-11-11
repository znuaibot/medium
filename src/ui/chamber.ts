// chamber.ts — the Séance Chamber: transcript, badges, evidence chips,
// automatic writing, and the Exorcist Gate log.
import type { MediumEngine, TranscriptEntry } from "./medium-engine.ts";
import { scratch, staticBurst } from "./audio.ts";

export interface ChamberDeps {
  transcriptEl: HTMLElement;
  gateLogEl: HTMLElement;
  engine: MediumEngine;
  onEvidence: (entries: Array<{ start: number; end: number }>) => void;
}

const BADGE: Record<string, string> = {
  verified: "VERIFIED", inferred: "INFERRED", unknown: "UNKNOWN",
};

function el(tag: string, cls: string, parent: HTMLElement): HTMLElement {
  const e = document.createElement(tag);
  e.className = cls;
  parent.appendChild(e);
  return e;
}

/** Reveal text character by character with a scratch cadence. */
function autoWrite(target: HTMLElement, text: string, done: () => void): void {
  let i = 0;
  const timer = window.setInterval(() => {
    target.textContent = text.slice(0, ++i);
    if (i % 3 === 0) scratch(40);
    if (i >= text.length) { window.clearInterval(timer); done(); }
  }, 14);
}

export function ask(deps: ChamberDeps, intent: string, question: string): void {
  const entry: TranscriptEntry = deps.engine.séance(intent);
  renderEntry(deps, entry, question);
}

export function runTrap(deps: ChamberDeps): void {
  const entry = deps.engine.hallucinationTrap();
  staticBurst();
  renderEntry(deps, entry, "[forged claim injected]");
  if (entry.receipt) {
    const log = el("div", "gate-log-entry", deps.gateLogEl);
    log.textContent =
      `GATE · ${entry.claimId} · ${entry.receipt.code} · ${entry.receipt.reason}`;
    deps.gateLogEl.scrollTop = deps.gateLogEl.scrollHeight;
  }
}

function renderEntry(deps: ChamberDeps, entry: TranscriptEntry, question: string): void {
  const wrap = el("div", `se-entry se-${entry.status}`, deps.transcriptEl);
  el("div", "se-q", wrap).textContent = question;
  const head = el("div", "se-head", wrap);
  el("span", `badge badge-${entry.status}`, head).textContent = BADGE[entry.status]!;
  el("span", "se-id", head).textContent = entry.claimId;
  const body = el("div", "se-body", wrap);
  autoWrite(body, entry.text, () => {
    if (entry.evidence.length > 0) {
      const chips = el("div", "se-chips", wrap);
      for (const ev of entry.evidence) {
        const chip = el("button", "evidence-chip", chips);
        chip.textContent = `[${ev.id} @ 0x${ev.addr.toString(16)}]`;
        chip.addEventListener("mouseenter", () => {
          deps.onEvidence([{ start: ev.addr, end: ev.addr + ev.len }]);
        });
        chip.addEventListener("mouseleave", () => deps.onEvidence([]));
        chip.addEventListener("click", () => {
          const inspector = document.getElementById("inspector");
          if (inspector) {
            inspector.classList.remove("hidden");
            inspector.querySelector(".insp-addr")!.textContent = `0x${ev.addr.toString(16)} (${ev.addr})`;
            inspector.querySelector(".insp-hex")!.textContent = ev.hex.match(/.{2}/g)!.join(" ");
            inspector.querySelector(".insp-ascii")!.textContent = ev.ascii;
            inspector.querySelector(".insp-note")!.textContent = ev.interpretation;
          }
        });
      }
    }
    deps.transcriptEl.scrollTop = deps.transcriptEl.scrollHeight;
  });
  deps.transcriptEl.scrollTop = deps.transcriptEl.scrollHeight;
}
