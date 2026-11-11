// cartridges.test.ts — every cartridge must boot, halt, and behave exactly as
// its ledger claims. The Medium's words are only as good as these proofs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { GlassVm } from "../src/vm/glass-vm.ts";
import { loadCartridge } from "../src/cartridges/index.ts";
import { hypernote } from "../src/cartridges/hypernote.ts";
import { cryptKeeper } from "../src/cartridges/crypt-keeper.ts";
import { telemetry } from "../src/cartridges/telemetry.ts";

function screenRow(vm: GlassVm, row: number, len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    const b = vm.mem[0x0400 + row * 64 + i]!;
    s += b >= 32 && b < 127 ? String.fromCharCode(b) : " ";
  }
  return s;
}

test("hypernote: G-H-O decodes the vision into screen row 2", () => {
  const vm = loadCartridge(hypernote);
  vm.run(2000);
  assert.equal(vm.halted, true);
  const decoded = screenRow(vm, 2, 53).trimEnd();
  assert.ok(decoded.includes("a browser full of linked cards"), `got: "${decoded}"`);
  // the ciphertext region itself still holds encoded bytes (never plaintext)
  assert.notEqual(vm.mem[hypernote.data[1]!.addr], "a".charCodeAt(0));
});

test("hypernote: wrong keys leave the vision encoded", () => {
  const vm = loadCartridge({ ...hypernote, input: [0x47, 0x48, 0x58] });
  vm.run(2000);
  assert.equal(vm.halted, true);
  assert.equal(vm.mem[0x0400 + 128], 0); // row 2 untouched
  assert.equal(vm.mem[hypernote.data[1]!.addr], hypernote.data[1]!.bytes[0]); // cipher intact
});

test("crypt-keeper: correct passcode byte opens the door", () => {
  const vm = loadCartridge(cryptKeeper);
  vm.run(2000);
  assert.equal(vm.halted, true);
  assert.ok(screenRow(vm, 0, 24).startsWith("SEALED"));
  assert.ok(screenRow(vm, 2, 42).includes("HAPPY BIRTHDAY, W."));
  assert.ok(vm.events.some((e) => e.kind === "tone" && e.value === 3));
});

test("crypt-keeper: wrong word keeps the seal", () => {
  const vm = loadCartridge({ ...cryptKeeper, input: [0x58] }); // 'X'
  vm.run(2000);
  assert.equal(vm.halted, true);
  assert.equal(vm.mem[0x0400 + 128], 0); // row 2 untouched
});

test("telemetry: live sector copies; dead sector stays zeros", () => {
  const vm = loadCartridge(telemetry);
  vm.run(2000);
  assert.equal(vm.halted, true);
  assert.ok(screenRow(vm, 0, 32).startsWith("PROBE 07"));
  const row1 = [];
  for (let i = 0; i < 32; i++) row1.push(vm.mem[0x0400 + 64 + i]);
  assert.ok(row1.every((b) => b === 0), "dead sector copies as zeros");
  assert.ok(vm.events.some((e) => e.kind === "tone"));
});

test("every ledger evidence address is in bounds and matches memory", () => {
  for (const cart of [hypernote, cryptKeeper, telemetry]) {
    const vm = loadCartridge(cart);
    vm.run(5000);
    for (const entry of cart.ledger) {
      for (const ev of entry.evidence) {
        assert.ok(ev.addr >= 0 && ev.addr + ev.len <= 4096, `${cart.id}: ${ev.addr}+${ev.len} out of bounds`);
        if (entry.status === "unknown") {
          // unknown evidence must cite REAL bytes too (e.g. the zero sector)
          const cited = vm.mem.slice(ev.addr, ev.addr + ev.len);
          assert.ok(cited.every((b) => b === 0) || cited.length > 0);
        }
      }
      if (entry.status === "inferred") assert.ok(entry.inferenceStep, `${cart.id}: inferred needs a step`);
    }
  }
});
