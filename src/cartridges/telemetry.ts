// telemetry.ts — cartridge 3: corrupted-telemetry, the honest ruin.
// A 1990 weather-probe log whose second sector is all zeros. The program
// copies both sectors to the screen; the Medium verifies one and refuses
// the other — the canonical `unknown` demonstration.
import { assemble } from "../vm/asm.ts";
import type { Cartridge } from "./index.ts";

function ascii(s: string): Uint8Array {
  return new Uint8Array([...s].map((c) => c.charCodeAt(0)));
}

const LOG_OK_ADDR = 0x0800;
const LOG_BAD_ADDR = 0x0840;
const ROW0 = 0x0400;
const ROW1 = 0x0400 + 64;
const SECTOR = 32;

const LOG_OK = "PROBE 07 - TEMP -12.4C - WIND NNE 14KT - BATTERY 61PCT";
const SECTOR_LEN = 32;

function copyLoop(id: string, src: number, dst: number, len: number): import("../vm/asm.ts").AsmLine[] {
  return [
    ["LDX", 0],
    ["LDA", 0], ["STA", 0x00f1], // reset the shared counter before each loop
    `${id}_cp:`,
    ["LDAX", src], ["STAX", dst], ["INX"],
    ["INC", 0x00f1], ["LDAM", 0x00f1], ["CMP", len], ["JNZ", `${id}_cp`],
  ];
}

const program = assemble([
  ...copyLoop("a", LOG_OK_ADDR, ROW0, SECTOR_LEN),
  ...copyLoop("b", LOG_BAD_ADDR, ROW1, SECTOR_LEN),
  ["LDA", 1], ["SYS", 2], // one flat tone over the dead sector
  ["SYS", 0],
]);

// The "corrupted" sector: every byte reads 0x00 (the medium will not invent it)
const badSector = new Uint8Array(SECTOR_LEN);

export const telemetry: Cartridge = {
  id: "corrupted-telemetry",
  title: "Probe 07 Telemetry",
  year: "1990",
  originNote:
    "A weather probe's log dump. The second sector did not survive the tape.",
  program,
  data: [
    { addr: LOG_OK_ADDR, bytes: ascii(LOG_OK.slice(0, SECTOR_LEN)) },
    { addr: LOG_BAD_ADDR, bytes: badSector },
  ],
  input: [],
  ledger: [
    {
      intent: "what-is",
      status: "verified",
      text: "Sector one is a live log: \"{ascii0}\" — probe 07, 1990, battery at 61 percent.",
      evidence: [{ addr: LOG_OK_ADDR, len: SECTOR_LEN, interpretation: "surviving telemetry sector, copied to screen row 0" }],
    },
    {
      intent: "corrupted-region",
      status: "unknown",
      text: "Sector two at {addr0} reads as 32 zero bytes ({bytes0}). Whatever the probe logged there did not survive. I will not invent it — this is what lost looks like.",
      evidence: [{ addr: LOG_BAD_ADDR, len: SECTOR_LEN, interpretation: "dead sector: all 0x00; no recoverable content" }],
    },
    {
      intent: "hallucination-trap",
      status: "unknown",
      text: "Asking what the dead sector says has no honest answer. The only verifiable statement is that it reads as zeros.",
      evidence: [],
    },
  ],
};
