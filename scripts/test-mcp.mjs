#!/usr/bin/env node
// test-mcp.mjs — real stdio session against the server: initialize, list,
// read memory, verify a true claim, then feed a forged one and watch the gate.
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const server = spawn(process.execPath, ["--experimental-strip-types", "mcp/seance-mcp-server.mjs"], { cwd: process.cwd() });
const log = [];
const pending = new Map();
let nextId = 1;

server.stdout.setEncoding("utf8");
server.stdout.on("data", (d) => {
  for (const line of d.split("\n")) {
    if (!line.trim()) continue;
    const msg = JSON.parse(line);
    const resolve = pending.get(msg.id);
    if (resolve) { pending.delete(msg.id); resolve(msg.result); }
  }
});

function call(method, params) {
  const id = nextId++;
  return new Promise((res) => {
    pending.set(id, res);
    const line = JSON.stringify({ jsonrpc: "2.0", id, method, params });
    log.push("-> " + line);
    server.stdin.write(line + "\n");
  });
}

const init = await call("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "seance-test", version: "0.1.0" } });
log.push("<- " + JSON.stringify(init));
console.log("server:", init.serverInfo?.name, "protocol:", init.protocolVersion);

const tools = await call("tools/list", {});
console.log("tools:", tools.tools.map((t) => t.name).join(", "));

const mem = await call("tools/call", { name: "read_vm_memory", arguments: { address: 0x0800, length: 16 } });
const memText = JSON.parse(mem.content[0].text);
console.log("read_vm_memory 0x0800:", memText.ascii);

const good = await call("tools/call", { name: "verify_ghost_claim", arguments: {
  claimId: "C-MCP-1", text: "sector one is a live log", status: "verified", evidenceIds: ["E-001"] } });
console.log("true claim verdict:", JSON.parse(good.content[0].text).verdict);

const forged = await call("tools/call", { name: "verify_ghost_claim", arguments: {
  claimId: "C-MCP-2", text: "the probe recorded a name here", status: "verified", evidenceIds: ["E-999"] } });
const forgedResult = JSON.parse(forged.content[0].text);
console.log("forged claim verdict:", forgedResult.verdict, forgedResult.receipt?.code);

mkdirSync("docs/kiro/evidence", { recursive: true });
log.push("\n# verdicts: true=" + JSON.parse(good.content[0].text).verdict + " forged=" + forgedResult.verdict + " (" + forgedResult.receipt?.code + ")");
writeFileSync("docs/kiro/evidence/mcp-session.log", log.join("\n") + "\n");
console.log("session log -> docs/kiro/evidence/mcp-session.log");
server.kill();
process.exit(forgedResult.verdict === "INTERCEPTED" && JSON.parse(good.content[0].text).verdict === "PASSED" ? 0 : 1);
