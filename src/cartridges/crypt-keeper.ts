// crypt-keeper.ts — cartridge 2: 1992-crypt-keeper.
// A sealed-door micro-game. The passcode is ONE byte living at 0x0140 —
// readable only by looking into memory (the séance's founding demo).
import { assemble } from "../vm/asm.ts";
import type { Cartridge } from "./index.ts";

function ascii(s: string): Uint8Array {
  return new Uint8Array([...s].map((c) => c.charCodeAt(0)));
}

const PASSCODE_ADDR = 0x0140;
const PASSCODE = 0x57; // 'W' — for W., whose birthday is buried in the door
const SEALED_ADDR = 0x0150;
const OPEN_ADDR = 0x0170;
const ROW0 = 0x0400;
const ROW2 = 0x0400 + 64 * 2;
const SEALED_TEXT = "SEALED. IT WANTS A WORD.";
const OPEN_TEXT = "THE DOOR OPENS - HAPPY BIRTHDAY, W. - 1992";
const SEALED_LEN = 24;
const OPEN_LEN = 42;

const program = assemble([
  // row 0: sealed notice
  ["LDX", 0],
  "s1:",
  ["LDAX", SEALED_ADDR], ["STAX", ROW0], ["INX"],
  ["INC", 0x00f1], ["LDAM", 0x00f1], ["CMP", SEALED_LEN], ["JNZ", "s1"],
  // ask for the word
  ["SYS", 1], // READKEY -> A
  ["STA", 0x00f1], // save the guess
  ["LDAM", PASSCODE_ADDR], // A = the passcode byte (memory, not immediate!)
  ["CMPM", 0x00f1], // flags from passcode - guess
  ["JNZ", "halt"], // wrong: the seal stays
  // row 2: the door opens
  ["LDX", 0],
  "s2:",
  ["LDAX", OPEN_ADDR], ["STAX", ROW2], ["INX"],
  ["INC", 0x00f1], ["LDAM", 0x00f1], ["CMP", OPEN_LEN], ["JNZ", "s2"],
  ["LDA", 3], ["SYS", 2], // TONE — the door hums
  ["SYS", 0],
  "halt:",
  ["SYS", 0],
]);

export const cryptKeeper: Cartridge = {
  id: "1992-crypt-keeper",
  title: "Crypt Keeper",
  year: "1992",
  originNote:
    "A one-room dungeon from a shareware floppy. The author sealed the door and hid the word in memory.",
  program,
  data: [
    { addr: PASSCODE_ADDR, bytes: new Uint8Array([PASSCODE]) },
    { addr: SEALED_ADDR, bytes: ascii(SEALED_TEXT) },
    { addr: OPEN_ADDR, bytes: ascii(OPEN_TEXT) },
  ],
  input: [PASSCODE],
  ledger: [
    {
      intent: "what-is",
      status: "verified",
      text: "Screen row 0 carries the seal notice: \"{ascii0}\". It asks for a word.",
      evidence: [{ addr: SEALED_ADDR, len: SEALED_LEN, interpretation: "seal notice, copied to screen row 0 by the program" }],
    },
    {
      intent: "cheat-code",
      status: "verified",
      text: "The passcode is not a string — it is one byte at {addr0}: 0x57, the letter W. The program compares your keystroke against that memory cell directly (CMPM). The author hid it in plain memory.",
      evidence: [{ addr: PASSCODE_ADDR, len: 1, interpretation: "the passcode byte itself; CMPM compares the guess against it" }],
    },
    {
      intent: "find-easter-egg",
      status: "verified",
      text: "Open text at {addr0}: \"{ascii1}\" — the author left a birthday for W. inside the door.",
      evidence: [{ addr: OPEN_ADDR, len: OPEN_LEN, interpretation: "opening message, copied to screen row 2 on success" }],
    },
    {
      intent: "hallucination-trap",
      status: "unknown",
      text: "Who was W.? The cartridge never says. Any name I gave you would be invented — the bytes remember a letter, not a person.",
      evidence: [],
    },
  ],
};
