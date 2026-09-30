# Phase 2 — Word Beta Brief

> Status: Brief; expand after Desktop Alpha and Word architecture ADRs are stable.  
> Updated: 2026-09-30

## Goal

Deliver a Word workflow where VietMath equations can be created, inserted, saved, transferred, reopened, edited, and updated reliably.

## Depends on

- Phase 0 Word spike passes or has an approved replacement architecture.
- Shared editor package is stable from Desktop Alpha.
- Equation source schema is versioned.
- Office metadata strategy is confirmed.
- Native/fallback capability model is implemented.

## In scope

### Word add-in

- compact VietMath editor panel;
- Insert equation;
- Edit selected VietMath equation;
- Update selected equation;
- Vietnamese + English UI.

### Native equation path

- supported structured conversion to Word native equation/OMML;
- capability checks before insertion;
- no silent degradation.

### Vector fallback

- high-fidelity vector/image fallback for unsupported native structures;
- embedded/recoverable VietMath source;
- Edit with VietMath flow.

### Source persistence

- VietMath object ID;
- schema version;
- source;
- style metadata;
- version/hash for conflict detection.

### Lifecycle

- insert;
- save;
- close;
- reopen;
- select;
- edit;
- update;
- copy within document;
- transfer to another document where feasible.

### Conflict handling

When Word-native content changed outside VietMath:

- detect mismatch;
- re-import latest structure when supported;
- otherwise present a clear conflict choice;
- never silently overwrite newer user edits.

## Initial supported matrix

Priority:

- Microsoft 365 Word on Windows.
- Microsoft 365 Word on macOS.

Exact version floors are decided from Phase 0/test hardware evidence.

## Out of scope

- every historical Word version;
- perfect import of legacy MathType objects;
- deep Windows-only COM integration;
- Google Docs/WPS/LibreOffice.

## Deliverables

- Word beta add-in;
- conversion fixture suite;
- document round-trip fixtures;
- second-environment transfer tests;
- known-limitation document;
- support matrix.

## Exit criteria

A tester can create a Word document with the supported VietMath equation subset, save it, send/open it in a second supported environment, and continue editing VietMath equations without losing source.

## Quality gates

- no document corruption;
- unsupported construct never silently disappears;
- source survives supported transfer path;
- Vietnamese text in supported native equations is preserved;
- conflict case has an explicit UX;
- Word add-in failure never destroys current editor draft.

## Before implementation

Expand this brief after Phase 1 and the Word Phase 0 ADRs establish exact converter APIs, metadata mechanism, and supported Office requirement sets.
