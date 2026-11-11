// screen.ts — the Vessel: renders the 64x16 character screen in 1-bit style.
const COLS = 64;
const ROWS = 16;
const CELL_W = 9;
const CELL_H = 16;

export function createScreen(canvas: HTMLCanvasElement): {
  render: (mem: Uint8Array) => void;
} {
  canvas.width = COLS * CELL_W + 16;
  canvas.height = ROWS * CELL_H + 16;
  const ctx = canvas.getContext("2d")!;
  const INK = "#141413";
  const PAPER = "#F4F1EA";

  function render(mem: Uint8Array): void {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // screen bezel: double 1-bit border
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
    ctx.font = `${CELL_H - 4}px ui-monospace, "Courier New", monospace`;
    ctx.textBaseline = "top";
    ctx.fillStyle = INK;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const b = mem[0x0400 + row * COLS + col]!;
        if (b >= 32 && b < 127) {
          ctx.fillText(String.fromCharCode(b), 8 + col * CELL_W, 8 + row * CELL_H);
        } else if (b !== 0) {
          // non-printable bytes render as solid cells (the machine's static)
          ctx.fillRect(8 + col * CELL_W + 2, 8 + row * CELL_H + 5, CELL_W - 5, CELL_H - 10);
        }
      }
    }
    // faint scanlines: every other row, one ink line at low alpha
    ctx.globalAlpha = 0.05;
    for (let row = 1; row < ROWS; row += 2) {
      ctx.fillRect(8, 8 + row * CELL_H + CELL_H - 2, COLS * CELL_W, 1);
    }
    ctx.globalAlpha = 1;
  }
  return { render };
}

// memory-grid.ts companion: a canvas hex grid over all 4096 bytes with
// evidence highlight. Lives here to keep file count and size in ratchet.
export function createMemoryGrid(
  canvas: HTMLCanvasElement,
  onClickCell: (addr: number) => void,
): { render: (mem: Uint8Array, hot: Array<{ start: number; end: number }>) => void } {
  const COLS2 = 64;
  const CELL = 8;
  canvas.width = COLS2 * CELL + 8;
  canvas.height = 64 * CELL + 8;
  const ctx = canvas.getContext("2d")!;
  const hotCells = new Map<number, string>();
  let memRef = new Uint8Array(4096);

  canvas.addEventListener("click", (e) => {
    const r = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - r.left - 4) / CELL);
    const row = Math.floor((e.clientY - r.top - 4) / CELL);
    if (col >= 0 && col < COLS2 && row >= 0 && row < 64) onClickCell(row * COLS2 + col);
  });

  function render(mem: Uint8Array, hot: Array<{ start: number; end: number }>): void {
    memRef = mem;
    hotCells.clear();
    for (const h of hot) for (let a = h.start; a < h.end; a++) hotCells.set(a, "hot");
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let addr = 0; addr < 4096; addr++) {
      const col = addr % COLS2;
      const row = Math.floor(addr / COLS2);
      const x = 4 + col * CELL;
      const y = 4 + row * CELL;
      const b = mem[addr]!;
      if (hotCells.has(addr)) {
        ctx.fillStyle = "#EFE6C8"; // candle glow highlight
        ctx.fillRect(x, y, CELL - 1, CELL - 1);
        ctx.fillStyle = INK;
        ctx.fillRect(x + 1, y + CELL - 3, CELL - 3, 2); // underline tick
      } else if (b !== 0) {
        // ink density by value: the machine's breath, visible
        ctx.fillStyle = INK;
        ctx.globalAlpha = Math.min(0.85, 0.15 + (b / 255) * 0.7);
        ctx.fillRect(x + 1, y + 1, CELL - 3, CELL - 3);
        ctx.globalAlpha = 1;
      }
    }
  }
  return { render };
}
const INK = "#141413";
const PAPER = "#F4F1EA";
