// asm.ts — the GlassVM assembler. Cartridges are stored as assembled bytes;
// their assembly source ships alongside for the transparency story.
import { OPS } from "./isa.ts";

export type Instr = [string] | [string, number | string];
export type AsmLine = Instr | string; // a bare string is a label ("sub:" or "sub")

const BY_NAME = new Map<string, { op: number; mode: "imm" | "addr" | "imp"; size: 1 | 2 | 3 }>();
for (const [op, info] of Object.entries(OPS)) {
  const mode = info.immediate ? "imm" : info.address ? "addr" : "imp";
  const name = info.name;
  if (name === "SYS") BY_NAME.set("SYS", { op: Number(op), mode: "imm", size: info.size });
  else if (name === "LDAM") BY_NAME.set("LDAM", { op: Number(op), mode: "addr", size: info.size });
  else BY_NAME.set(name, { op: Number(op), mode: mode as "imm" | "addr" | "imp", size: info.size });
}
BY_NAME.set("HALT", { op: 0x12, mode: "imm", size: 2 }); // HALT = SYS 0

export function assemble(lines: AsmLine[], loadAt = 0x0200): Uint8Array {
  const instructions: Instr[] = lines.map((l) => (typeof l === "string" ? [l] : l));
  const out: number[] = [];
  const labels = new Map<string, number>();

  const emit = (b: number): number => { out.push(b & 0xff); return out.length - 1; };

  // pass 1: sizes + labels
  let pc = loadAt;
  for (const ins of instructions) {
    const name = ins[0];
    if (name.endsWith(":")) {
      labels.set(name.slice(0, -1), pc);
      continue;
    }
    const info = BY_NAME.get(name.toUpperCase());
    if (!info) {
      const near = [...BY_NAME.keys()].filter((k) => {
        let d = 0;
        const a = name.toUpperCase(), b = k;
        for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) d++;
        return d <= 2;
      }).slice(0, 3).join(", ");
      throw new Error(`unknown mnemonic: ${name}${near ? ` — did you mean ${near}?` : ""}`);
    }
    pc += info.size;
  }

  // pass 2: emit
  for (const ins of instructions) {
    const name = ins[0];
    if (name.endsWith(":")) continue;
    const arg = ins[1];
    const info = BY_NAME.get(name.toUpperCase());
    if (!info) throw new Error(`unknown mnemonic: ${name}`);
    emit(info.op);
    if (info.mode === "imp") {
      if (name.toUpperCase() === "HALT") emit(0x00); // SYS 0
      continue;
    }
    if (arg === undefined) throw new Error(`${name} requires an operand`);
    let v: number;
    if (typeof arg === "number") v = arg;
    else if (/^0x[0-9a-f]+$/i.test(arg)) v = parseInt(arg, 16);
    else if (labels.has(arg)) v = labels.get(arg)!;
    else throw new Error(`unknown operand: ${arg}`);
    if (info.mode === "imm") emit(v);
    else {
      emit(v & 0xff);
      emit((v >> 8) & 0xff);
    }
  }
  return new Uint8Array(out);
}
