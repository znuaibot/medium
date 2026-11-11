# Software Coroner — Kiro Crew App (bonus package)

A distributable Crew App packaging MEDIUM's Coroner role: point a Crew bot at
a dead file and receive an evidence-backed autopsy — format, strings with file
offsets, entropy, and an honest `unconfirmed` list.

## Contents

- `app.json` — app manifest (name, entry, MCP tool binding)
- `skills/software-coroner/SKILL.md` — the Coroner's contract (reads bytes,
  cites offsets, refuses to speculate)
- The MCP server it binds to lives in the parent repo: `mcp/seance-mcp-server.mjs`

## Format note (honest, per our own steering)

The Kiro Crew App Kit is new (Crew shipped 2026-08, Bots 2026-11); the exact
packaging surface is still moving. This package follows the documented shape
(`app.json` + skills entry + MCP binding). If the final App Kit format
differs, the *role contract* in SKILL.md is the durable part — re-wrap it.

## Why this exists

Best Kiro Crew App bonus prize aside: the Coroner is the one MEDIUM role that
works entirely without the browser — a developer with a folder of dead files
and a Crew bot gets a first-pass morgue report for each, every finding
citable, nothing invented.
