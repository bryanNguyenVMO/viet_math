# ADR 0003 — Canonical Equation Source Model

> Status: Accepted  
> Date: 2026-09-30

## Context

VietMath needs one durable representation that can survive editor changes, export regeneration, autosave, Office embedding, and schema migration.

PNG/SVG/MathML/OMML cannot be the only source because they are target-specific derived artifacts.

## Decision

Use a versioned `EquationDocument` as the canonical application model.

Current schema v1:

```ts
type EquationDocument = {
  schemaVersion: 1;
  latex: string;
  draftLatex?: string;
  displayMode: "inline" | "block";
  style: {
    fontSize?: number;
    color?: string;
  };
};
```

Rules:

- `latex` is the last canonical supported source;
- `draftLatex` may preserve an incomplete user draft;
- exports are derived;
- serialization validates schema and field types;
- editor-library objects do not leak into the model.

## Evidence

Automated round-trip tests cover:

- serialization/deserialization;
- invalid field rejection;
- coexistence of valid source and incomplete draft.

## Consequences

- schema migrations become explicit;
- Office metadata can carry the same source semantics;
- renderer/editor dependencies can change without redefining persistence;
- future fields must be introduced through a schema-version decision rather than ad-hoc JSON additions.
