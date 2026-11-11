// certificate.ts — the Archivist's export: one self-contained HTML file with
// the full evidence ledger, snapshot hash, and replay packet. Opens offline.
import { sha256Hex } from "../core/hash.ts";

interface Archive {
  cartridge: { id: string; title: string; year: string; originNote: string };
  artifactHash: string;
  snapshotHash: string;
  memory: number[];
  ledger: { evidence: Array<Record<string, unknown>>; claims: Array<Record<string, unknown>> };
}

function esc(s: unknown): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function certificateHtml(archive: object, cart: { id: string; title: string }): string {
  const a = archive as Archive;
  const replayPacket = JSON.stringify({ snapshotHash: a.snapshotHash, memory: a.memory });
  const replayHash = sha256Hex(replayPacket);
  const evidenceRows = a.ledger.evidence.map((e) => {
    const loc = (e.location as { value: string }).value;
    return `<tr><td>${esc(e.id)}</td><td>${esc(e.sourceType)}</td><td>${esc(loc)}</td>` +
      `<td class="mono">${esc(String(e.rawBytes).slice(0, 32))}${String(e.rawBytes).length > 32 ? "…" : ""}</td>` +
      `<td>${esc(e.asciiPreview)}</td><td>${esc(e.interpretation)}</td></tr>`;
  }).join("\n");
  const claimRows = a.ledger.claims.map((c) => {
    const ids = (c.evidenceIds as string[]).join(", ") || "—";
    return `<tr class="claim-${esc(String(c.status))}"><td>${esc(String(c.status).toUpperCase())}</td><td>${esc(c.text)}</td><td>${esc(ids)}</td></tr>`;
  }).join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Certificate of Séance — ${esc(a.cartridge.title)}</title>
<style>
  body { background:#F4F1EA; color:#141413; font-family: Georgia, 'Times New Roman', serif;
         max-width: 860px; margin: 2rem auto; padding: 0 1.5rem; line-height: 1.55; }
  h1 { font-variant: small-caps; letter-spacing: 0.06em; border-bottom: 3px double #141413; }
  .mono { font-family: ui-monospace, 'Courier New', monospace; font-size: 0.82em; word-break: break-all; }
  .seal { border: 2px solid #7A1F1F; color:#7A1F1F; display:inline-block; padding: .2rem .8rem;
          font-variant: small-caps; letter-spacing: .12em; }
  table { border-collapse: collapse; width: 100%; margin: .8rem 0 1.6rem; font-size: .88rem; }
  td, th { border: 1px solid #141413; padding: .35rem .5rem; text-align: left; vertical-align: top; }
  th { background: #EFE6C8; font-variant: small-caps; }
  .claim-unknown td:first-child { color: #5A564D; font-style: italic; }
  .claim-verified td:first-child { font-weight: bold; }
  .hashes { background:#EFE6C8; padding: .7rem 1rem; border:1px solid #141413; font-size: .8rem; }
  footer { margin-top: 2rem; font-style: italic; color:#5A564D; }
</style></head><body>
<span class="seal">Certificate of Séance</span>
<h1>${esc(a.cartridge.title)} · ${esc(a.cartridge.year)}</h1>
<p>${esc(a.cartridge.originNote)}</p>
<p>This archive was produced by <strong>MEDIUM — The Glass Séance</strong>. Every claim
below is checkable: each cites evidence read from the machine's memory at the
snapshot identified by the hashes at the foot of this page. Claims marked
UNKNOWN could not be supported by the bytes, and were left as questions.</p>
<h2>Evidence</h2>
<table><tr><th>ID</th><th>Source</th><th>Location</th><th>Bytes (hex)</th><th>ASCII</th><th>Interpretation</th></tr>
${evidenceRows}</table>
<h2>Claims</h2>
<table><tr><th>Status</th><th>Claim</th><th>Cites</th></tr>
${claimRows}</table>
<div class="hashes mono">
artifact sha256: ${esc(a.artifactHash)}<br>
snapshot sha256: ${esc(a.snapshotHash)}<br>
replay packet sha256: ${esc(replayHash)}<br>
cartridge: ${esc(cart.id)} · memory: ${a.memory.length} bytes
</div>
<p class="mono" style="font-size:.7rem; word-break:break-all;" data-replay='${esc(replayPacket)}'></p>
<footer>"We did not give the machine a fictional soul. We gave its evidence a way to speak."</footer>
</body></html>`;
}
