// glass-vm.ts — a transparent, deterministic byte-machine.
// Every byte the machine "thinks" is a plain typed array reachable from JS:
// that transparency is the séance. Wall clocks and randomness are forbidden
// inside the deterministic core (see .kiro/steering/product-truthfulness.md).
import { sha256Hex } from "../core/hash.ts";
import { CALL_STACK_BASE, MEM_SIZE, OPS, SYS } from "./isa.ts";

export interface VmEvent {
  kind: "halt" | "key" | "tone";
  pc: number;
  value?: number; // key code or tone index
  at: number; // VM step counter (deterministic time)
}

export interface VmStateJson {
  mem: number[]; // 4096 bytes
  pc: number;
  a: number;
  x: number;
  flags: number; // bit0 Z, bit1 N, bit2 C
  steps: number;
  inputPos: number; // how many key events were consumed
  halted: boolean;
}

const SP = 0x00ff; // call-stack pointer, top of the zero page (frames grow down)

export class GlassVm {
  readonly mem: Uint8Array;
  pc = 0;
  a = 0;
  x = 0;
  flags = 0;
  steps = 0;
  halted = false;
  readonly events: VmEvent[] = [];
  private readonly input: readonly number[];
  private inputPos = 0;

  constructor(program: Uint8Array, loadAt = 0x0200, input: readonly number[] = []) {
    if (program.length > MEM_SIZE - loadAt) {
      throw new Error(`program too large: ${program.length} bytes at 0x${loadAt.toString(16)}`);
    }
    this.mem = new Uint8Array(MEM_SIZE);
    this.mem.set(program, loadAt);
    this.mem[SP] = CALL_STACK_BASE; // empty call stack
    this.pc = loadAt;
    this.input = input;
  }

  step(): VmEvent | null {
    if (this.halted) return null;
    const op = this.mem[this.pc]!;
    const info = OPS[op];
    if (!info) throw new Error(`invalid opcode 0x${op.toString(16)} at 0x${this.pc.toString(16)}`);
    const imm = this.mem[this.pc + 1]!;
    const addr = this.mem[this.pc + 1]! | (this.mem[this.pc + 2]! << 8);
    this.pc += info.size;
    this.steps++;
    let ev: VmEvent | null = null;

    switch (op) {
      case 0x00: break;
      case 0x01: this.a = imm; break;
      case 0x02: this.a = this.mem[addr]!; break;
      case 0x03: this.mem[addr] = this.a; break;
      case 0x04: this.x = imm; break;
      case 0x05: this.mem[addr] = this.x; break;
      case 0x06: { const r = this.a + imm; this.a = r & 0xff; this.setFlags(r > 0xff, this.a === 0); break; }
      case 0x07: { const r = this.a - imm; this.a = r & 0xff; this.setFlags(r < 0, this.a === 0); break; }
      case 0x08: this.a &= imm; this.setFlags(false, this.a === 0); break;
      case 0x09: this.a |= imm; this.setFlags(false, this.a === 0); break;
      case 0x0a: this.a ^= imm; this.setFlags(false, this.a === 0); break;
      case 0x0b: { const r = (this.mem[addr]! + 1) & 0xff; this.mem[addr] = r; this.setFlags(false, r === 0); break; }
      case 0x0c: { const r = this.a - imm; this.setFlags(r < 0, r === 0); break; }
      case 0x0d: this.pc = addr; break;
      case 0x0e: if (this.flags & 1) this.pc = addr; break;
      case 0x0f: if (!(this.flags & 1)) this.pc = addr; break;
      case 0x10: { // JSR: push return pc (2 bytes) onto the zero-page call stack
        const sp = this.mem[SP]!;
        if (sp < 0xf2) throw new Error(`call stack overflow at 0x${(this.pc - 3).toString(16)}`);
        this.mem[SP] = sp - 2;
        this.mem[sp - 1] = (this.pc & 0xff00) >> 8;
        this.mem[sp - 2] = this.pc & 0xff;
        this.pc = addr; break;
      }
      case 0x11: { // RET
        const sp = this.mem[SP]!;
        this.pc = this.mem[sp]! | (this.mem[sp + 1]! << 8);
        this.mem[SP] = sp + 2; break;
      }
      case 0x12: { // SYS
        if (imm === SYS.HALT) {
          this.halted = true;
          ev = { kind: "halt", pc: this.pc - info.size, at: this.steps };
        } else if (imm === SYS.READKEY) {
          const key = this.inputPos < this.input.length ? this.input[this.inputPos]! : 0;
          this.inputPos++;
          this.a = key;
          ev = { kind: "key", pc: this.pc - info.size, value: key, at: this.steps };
        } else if (imm === SYS.TONE) {
          ev = { kind: "tone", pc: this.pc - info.size, value: this.a, at: this.steps };
        }
        break;
      }
      case 0x13: this.a = (this.a << 1) & 0xff; this.setFlags(false, this.a === 0); break;
      case 0x14: this.a = this.a >>> 1; this.setFlags(false, this.a === 0); break;
      case 0x15: this.a = this.mem[(addr + this.x) & 0xfff]!; break;
      case 0x16: this.mem[(addr + this.x) & 0xfff] = this.a; break;
      case 0x17: { const r = this.a - this.mem[addr]!; this.setFlags(r < 0, r === 0); break; }
      case 0x18: this.x = (this.x + 1) & 0xff; this.setFlags(false, this.x === 0); break;
    }
    if (ev) this.events.push(ev);
    return ev;
  }

  run(maxSteps: number): VmEvent[] {
    const emitted: VmEvent[] = [];
    for (let i = 0; i < maxSteps && !this.halted; i++) {
      const ev = this.step();
      if (ev) emitted.push(ev);
    }
    return emitted;
  }

  private setFlags(carry: boolean, zero: boolean): void {
    this.flags = (this.flags & ~0x05) | (carry ? 4 : 0) | (zero ? 1 : 0);
  }

  /** Content-addressed identity of the entire machine state. */
  snapshotHash(): string {
    const head = new Uint8Array([this.pc & 0xff, (this.pc >> 8) & 0xff, this.a, this.x,
      this.flags, this.steps & 0xff, (this.steps >> 8) & 0xff, this.inputPos & 0xff]);
    const all = new Uint8Array(this.mem.length + head.length);
    all.set(this.mem, 0);
    all.set(head, this.mem.length);
    return sha256Hex(all);
  }

  freeze(): VmStateJson {
    return {
      mem: [...this.mem], pc: this.pc, a: this.a, x: this.x, flags: this.flags,
      steps: this.steps, inputPos: this.inputPos, halted: this.halted,
    };
  }

  static restore(s: VmStateJson, fullInput: readonly number[]): GlassVm {
    const vm = new GlassVm(new Uint8Array(0), 0x0200, fullInput);
    vm.mem.set(s.mem);
    vm.mem[SP] = s.mem[SP] ?? CALL_STACK_BASE;
    vm.pc = s.pc; vm.a = s.a; vm.x = s.x; vm.flags = s.flags;
    vm.steps = s.steps; vm.halted = s.halted; vm.inputPos = s.inputPos;
    return vm;
  }
}
