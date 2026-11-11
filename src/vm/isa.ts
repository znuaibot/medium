// isa.ts — the GlassVM instruction set. Frozen by spec: glass-seance/design.md.
// 21 opcodes. Implied ops are 1 byte, immediate ops 2 bytes (op + imm8),
// address ops 3 bytes (op + addr16 little-endian).
// This table is shared by the VM, the assembler, and the UI.

export const MEM_SIZE = 4096;
export const ZP = 0x0000; // zero page: system state + call stack (0x00F0-0x00FF)
export const DATA = 0x0100; // 0x0100-0x03FF program data / lore
export const SCREEN = 0x0400; // 0x0400-0x07FF framebuffer, 128x64, 1 byte per pixel
export const SCREEN_SIZE = 128 * 64; // 1024 bytes
export const FREE = 0x0800; // 0x0800-0x0FFF general purpose
export const CALL_STACK_BASE = 0x00ff; // SP lives at 0x00FF (top of zero page);
// frames grow DOWN from 0x00FE (lo@n, hi@n+1), max 7 frames, never touches SP.

export interface OpInfo {
  name: string;
  size: 1 | 2 | 3; // bytes including opcode
  immediate?: boolean; // uses an 8-bit immediate
  address?: boolean; // uses a 16-bit address
}

export const OPS: Record<number, OpInfo> = {
  0x00: { name: "NOP", size: 1 },
  0x01: { name: "LDA", size: 2, immediate: true },
  0x02: { name: "LDAM", size: 3, address: true },
  0x03: { name: "STA", size: 3, address: true },
  0x04: { name: "LDX", size: 2, immediate: true },
  0x05: { name: "STX", size: 3, address: true },
  0x06: { name: "ADD", size: 2, immediate: true },
  0x07: { name: "SUB", size: 2, immediate: true },
  0x08: { name: "AND", size: 2, immediate: true },
  0x09: { name: "ORA", size: 2, immediate: true },
  0x0a: { name: "XOR", size: 2, immediate: true },
  0x0b: { name: "INC", size: 3, address: true },
  0x0c: { name: "CMP", size: 2, immediate: true },
  0x0d: { name: "JMP", size: 3, address: true },
  0x0e: { name: "JZ", size: 3, address: true },
  0x0f: { name: "JNZ", size: 3, address: true },
  0x10: { name: "JSR", size: 3, address: true },
  0x11: { name: "RET", size: 1 },
  0x12: { name: "SYS", size: 2, immediate: true },
  0x13: { name: "SHL", size: 1 },
  0x14: { name: "SHR", size: 1 },
  0x15: { name: "LDAX", size: 3, address: true }, // A = mem[addr + X]
  0x16: { name: "STAX", size: 3, address: true }, // mem[addr + X] = A
  0x17: { name: "CMPM", size: 3, address: true }, // flags from A - mem[addr]
  0x18: { name: "INX", size: 1 }, // X = (X + 1) & 0xff, Z flag on wrap
};

export const SYS = { HALT: 0, READKEY: 1, TONE: 2 } as const;

export function opName(opcode: number): string {
  return OPS[opcode]?.name ?? `??0x${opcode.toString(16)}`;
}
