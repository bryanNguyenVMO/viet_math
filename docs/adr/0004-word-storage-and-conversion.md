# ADR 0004 — Word Storage and Native Conversion

> Status: Accepted for Phase 0; production storage/converter still gated  
> Date: 2026-09-30

## Context

Word should receive a native editable equation when VietMath can convert the structure safely, while VietMath must retain enough source to reopen and edit its own equation later.

## Decision

Use this architecture:

```text
EquationDocument
  ↓
capability/conversion
  ↓
OMML
  ↓
Word OOXML package
  ↓
content control / VietMath identity
```

For unsupported native constructs, use an explicit high-fidelity visual fallback rather than silently losing structure.

## Phase 0 evidence

Automated tests validate:

- OMML fraction primitive;
- radical primitive;
- matrix primitive;
- XML escaping;
- Word `pkg:package` creation;
- `word/document.xml`;
- `m:oMath`;
- `w:sdt` content control;
- source metadata encode/decode.

## Storage ruling

Embedding the complete source in a content-control tag is only a short-fixture Phase 0 proof of concept.

Production target:

- content control/tag keeps a small VietMath object ID/schema/version;
- full source lives in a reliable document-level metadata/custom XML mechanism confirmed by real Word testing.

## Remaining gates

Before Phase 2 implementation is locked:

- validate actual `insertOoxml` behavior in Word Microsoft 365 Windows/macOS;
- save/close/reopen/recover/update;
- test document-to-document transfer;
- implement/validate the supported LaTeX/MathML → OMML subset;
- validate conflict detection after native Word edits.

If native conversion fidelity is insufficient, the capability model must route that structure to the visual fallback.
