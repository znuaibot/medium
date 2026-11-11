# Spec: glass-seance — Requirements (EARS)

## 1. Artifact identity and ingestion

- WHEN any file is dropped onto the vessel, THE SYSTEM SHALL compute its
  SHA-256 artifact hash before any other processing.
- WHEN a bundled cartridge is selected, THE SYSTEM SHALL verify its embedded
  hash against the manifest before booting.
- WHEN a dropped file is not a recognized cartridge or inspectable format,
  THE SYSTEM SHALL display a safe rejection naming the detection failure and
  SHALL NOT fabricate an analysis.
- IF the same artifact is loaded twice, THEN THE SYSTEM SHALL produce the
  identical artifact hash both times.

## 2. Deterministic execution (GlassVM)

- WHEN a cartridge boots, THE SYSTEM SHALL start from an all-zero memory state
  with program counter at the cartridge entry address.
- WHEN the VM executes N steps from an identical state, THE SYSTEM SHALL reach
  an identical state (registers + memory + screen) every time.
- WHEN a snapshot is frozen, THE SYSTEM SHALL produce a snapshot hash over
  (memory + registers + screen + pc) that changes if any byte changes.
- WHEN execution is resumed from a frozen snapshot, THE SYSTEM SHALL continue
  deterministically as if never interrupted.

## 3. Evidence and claims

- WHEN a claim is generated, THE SYSTEM SHALL attach >=1 Evidence ID for
  status `verified`, >=1 Evidence ID plus an inference step for `inferred`,
  or no evidence for `unknown`.
- WHEN a claim references an Evidence ID that does not exist, is out of
  bounds, or whose bytes do not match the referenced snapshot, THE SYSTEM
  SHALL reject the claim and emit an ExorcismReceipt to the public gate log.
- WHEN evidence is displayed, THE SYSTEM SHALL show source type, address or
  file offset, raw bytes, snapshot hash, and a human-readable interpretation.
- IF a user asks a question no evidence supports, THEN THE SYSTEM SHALL answer
  `unknown` and state what observation would be needed.

## 4. Replay and archive

- WHEN a séance answer is saved, THE SYSTEM SHALL store a replay packet
  (artifact hash, snapshot hash, question, tool calls, evidence records,
  answer, validation result).
- WHEN a replay packet is re-imported, THE SYSTEM SHALL reproduce the exact
  answer and evidence chain without network access.
- WHEN the Certificate of Séance is exported, THE SYSTEM SHALL produce one
  self-contained HTML file renderable offline.

## 5. Interface

- THE SYSTEM SHALL render all machine surfaces in two colors only.
- THE SYSTEM SHALL highlight the exact memory cells a selected evidence chip
  references.
- WHEN the viewport is under 900px, THE SYSTEM SHALL stack the three panels
  into tabs without loss of function.
- THE SYSTEM SHALL be fully operable by keyboard and remain fully functional
  with network disabled.

## 6. Non-functional

- THE SYSTEM SHALL make zero network requests during normal operation.
- THE SYSTEM SHALL start usable in under 2 seconds on a mid-range laptop.
- THE SYSTEM SHALL keep every source file under 220 lines.
