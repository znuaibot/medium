// hypernote.ts — cartridge 1: 1987-hypernote, the curator's notepad.
// Waits for the key sequence G-H-O, then decodes a XOR-hidden "vision" note
// into a screen row, in memory only. The Medium can cite both regions.
import { assemble } from "../vm/asm.ts";
import type { Cartridge } from "./index.ts";

function ascii(s: string): Uint8Array {
  return new Uint8Array([...s].map((c) => c.charCodeAt(0)));
}

const NOTES_ADDR = 0x0140;
const VISION_ADDR = 0x0180;
const VISION_KEY = 0x5a;
const ROW = 0x0400 + 64 * 2; // screen row 2
const NOTES_TEXT = "the screen is a card - cards link - ask the medium about the keys";
const VISION_CLEAR = "a browser full of linked cards - he was right - 1987";
const COPY_LEN = VISION_CLEAR.length; // decode the whole vision into one row
const VISION_CIPHER = new Uint8Array([...VISION_CLEAR].map((c) => c.charCodeAt(0) ^ VISION_KEY));

const program = assemble([
  ["SYS", 1], ["CMP", 0x47], ["JNZ", "halt"], // G
  ["SYS", 1], ["CMP", 0x48], ["JNZ", "halt"], // H
  ["SYS", 1], ["CMP", 0x4f], ["JNZ", "halt"], // O
  ["LDX", 0],
  "dec:",
  ["LDAX", VISION_ADDR],
  ["XOR", VISION_KEY],
  ["STAX", ROW],
  ["INX"],
  ["INC", 0x00f1],
  ["LDAM", 0x00f1],
  ["CMP", COPY_LEN],
  ["JNZ", "dec"],
  ["SYS", 0],
  "halt:",
  ["SYS", 0],
]);

export const hypernote: Cartridge = {
  id: "1987-hypernote",
  title: "Hypernote",
  year: "1987",
  originNote:
    "A curator's notepad for a small note-machine. The notes talk about 'linked cards'.",
  program,
  data: [
    { addr: NOTES_ADDR, bytes: ascii(NOTES_TEXT) },
    { addr: VISION_ADDR, bytes: VISION_CIPHER },
  ],
  input: [0x47, 0x48, 0x4f],
  ledger: [
    {
      intent: "what-is",
      status: "verified",
      text: "The curator's notes, plaintext at {addr0}: \"{ascii0}\".",
      evidence: [{ addr: NOTES_ADDR, len: NOTES_TEXT.length, interpretation: "working notes, plaintext in the lore region" }],
    },
    {
      intent: "find-easter-egg",
      status: "verified",
      text: "The key sequence G-H-O is checked three times by the program; on match it XOR-decodes 50 bytes at {addr0} into screen row 2. Decoded in memory: \"{ascii0}\". The ciphertext never appears as text anywhere — only bytes in memory.",
      evidence: [
        { addr: VISION_ADDR, len: COPY_LEN, interpretation: "XOR-encoded note (key 0x5A), decoded in place by the program" },
      ],
    },
    {
      intent: "hallucination-trap",
      status: "unknown",
      text: "Nothing in this cartridge records who the curator was. I cannot verify a name from these bytes — that would need a source outside the artifact.",
      evidence: [],
    },
  ],
};
