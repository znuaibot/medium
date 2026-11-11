// vm.test.ts — determinism is the product. These tests guard it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { GlassVm } from "../src/vm/glass-vm.ts";
import { assemble } from "../src/vm/asm.ts";

test("load/store roundtrip and register ops", () => {
  const prog = assemble([
    ["LDA", 0x48], ["STA", 0x0140], ["LDAM", 0x0140], ["SYS", 0],
  ]);
  const vm = new GlassVm(prog);
  vm.run(100);
  assert.equal(vm.halted, true);
  assert.equal(vm.mem[0x0140], 0x48);
  assert.equal(vm.a, 0x48);
});

test("determinism: same program + same input => same final snapshot hash", () => {
  const prog = assemble([
    ["LDAM", 0x0240], ["ADD", 1], ["STA", 0x0240],
    ["SYS", 1], // READKEY consumes one input event
    ["CMP", 0], ["JNZ", 0x0200], ["SYS", 0],
  ]);
  const r1 = new GlassVm(prog, 0x0200, [0]);
  const r2 = new GlassVm(prog, 0x0200, [0]);
  r1.run(500);
  r2.run(500);
  assert.equal(r1.snapshotHash(), r2.snapshotHash());
  assert.equal(r1.halted, true);
});

test("JSR/RET call and return", () => {
  const prog = assemble([
    ["JSR", "sub"], ["SYS", 0],
    "sub:",
    ["LDA", 0x2a], ["RET"],
  ]);
  const vm = new GlassVm(prog);
  vm.run(100);
  assert.equal(vm.halted, true);
  assert.equal(vm.a, 0x2a);
});

test("framebuffer writes are plain memory (transparency)", () => {
  const prog = assemble([
    ["LDA", 1], ["STA", 0x0400 + 128 * 10 + 20], ["SYS", 0],
  ]);
  const vm = new GlassVm(prog);
  vm.run(100);
  assert.equal(vm.mem[0x0400 + 128 * 10 + 20], 1); // pixel (20,10) lit
});

test("snapshot freeze/restore resumes to the identical future", () => {
  const prog = assemble([
    ["LDA", 5], ["ADD", 3], ["STA", 0x0300], ["LDAM", 0x0300], ["ADD", 2], ["SYS", 0],
  ]);
  const a = new GlassVm(prog);
  a.run(3);
  const frozen = a.freeze();
  const b = GlassVm.restore(frozen, []);
  a.run(100);
  b.run(100);
  assert.equal(a.snapshotHash(), b.snapshotHash());
});

test("input queue is consumed in order (READKEY)", () => {
  const prog = assemble([
    ["SYS", 1], ["STA", 0x0301], ["SYS", 1], ["STA", 0x0302], ["SYS", 0],
  ]);
  const vm = new GlassVm(prog, 0x0200, [0x41, 0x42]);
  vm.run(100);
  assert.equal(vm.mem[0x0301], 0x41);
  assert.equal(vm.mem[0x0302], 0x42);
});

test("determinism steering: no wall clock or randomness in deterministic layers", async () => {
  const { readFile, readdir } = await import("node:fs/promises");
  const files: string[] = [];
  // only the layers whose output must be reproducible; src/ui/audio.ts is
  // presentation (static noise) and is allowed its randomness.
  const layers = ["src/core", "src/vm", "src/coroner", "src/cartridges"];
  for (const layer of layers) {
    const walk = async (d: string): Promise<void> => {
      for (const f of await readdir(d, { withFileTypes: true })) {
        const p = `${d}/${f.name}`;
        if (f.isDirectory()) await walk(p);
        else if (f.name.endsWith(".ts")) files.push(p);
      }
    };
    await walk(layer);
  }
  for (const f of files) {
    const src = await readFile(f, "utf8");
    assert.ok(!/Math\.random|Date\.now|new Date\(/.test(src), `${f} must be deterministic`);
  }
});
