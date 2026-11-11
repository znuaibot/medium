// index.ts — cartridge type, loader, and the three demo artifacts.
// Easter-egg containment (steering rule): secrets exist as machine-state
// (encoded bytes + key-gated programs), never as prompt-context strings.
// The repo ships openly — transparency is the product; the gate still
// validates every claim against live bytes.
import { GlassVm } from "../vm/glass-vm.ts";
import { DATA, SCREEN } from "../vm/isa.ts";

export interface LedgerEntry {
  intent: string; // "find-easter-egg" | "cheat-code" | "what-is" | ...
  status: "verified" | "inferred" | "unknown";
  text: string; // claim text; may cite addresses in plain language
  evidence: Array<{ addr: number; len: number; interpretation: string }>;
  inferenceStep?: string; // required for "inferred"
}

export interface Cartridge {
  id: string;
  title: string;
  year: string;
  originNote: string; // in-world provenance, shown on the certificate
  program: Uint8Array;
  data: Array<{ addr: number; bytes: Uint8Array }>; // lore patches
  input: number[]; // scripted keys for the demo path
  ledger: LedgerEntry[];
}

export function loadCartridge(cart: Cartridge, inputOverride?: number[]): GlassVm {
  const vm = new GlassVm(cart.program, 0x0200, inputOverride ?? cart.input);
  for (const p of cart.data) vm.mem.set(p.bytes, p.addr);
  return vm;
}

export const SCREEN_ADDR = SCREEN;
export const DATA_ADDR = DATA;
export { GlassVm };
