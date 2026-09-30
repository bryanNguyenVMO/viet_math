# Phase 3 — PowerPoint + Document Productivity Brief

> Status: Brief; expand after Word Beta architecture is stable.  
> Updated: 2026-09-30

## Goal

Provide a reliable PowerPoint equation workflow and add document-level productivity features only after core Office editability is proven.

## Depends on

- shared editor is stable;
- export/vector path is production quality;
- PowerPoint metadata/object identity strategy passed Phase 0;
- Word Beta has validated the source versioning model.

## In scope

### PowerPoint add-in

- create equation;
- insert vector/high-fidelity equation;
- recover VietMath source;
- edit/update existing equation;
- preserve position and size;
- preserve rotation/z-order where supported;
- duplicate shape/slide behavior;
- Vietnamese + English panel UI.

### Object identity

- VietMath object ID;
- source/schema metadata;
- collision handling for duplicated shapes/slides;
- safe update of the selected object only.

### Document productivity candidates

Include only if core PowerPoint reliability is already green:

- equation numbering helper;
- style presets;
- batch style update with preview;
- recent/templates inside Office;
- cross-reference helper where Office APIs make the behavior reliable.

## Out of scope

- forcing native PowerPoint equation support if the API path is not proven;
- complex animation preservation promises without test evidence;
- OCR/AI;
- broad non-Microsoft Office integrations.

## Deliverables

- PowerPoint beta add-in;
- geometry-preservation test matrix;
- duplicate/copy behavior report;
- shared Office component cleanup;
- optional first document-productivity feature set.

## Exit criteria

For the supported subset, a user can insert a VietMath equation into PowerPoint, move/resize it, save/reopen, edit it with VietMath, and update it without unexpected geometry loss.

## Quality gates

- source survives save/reopen;
- update targets the correct shape;
- duplicate handling does not corrupt IDs/source;
- basic geometry is preserved;
- failure path leaves current source recoverable;
- any unsupported animation/group behavior is documented.

## Before implementation

Convert this brief into a detailed implementation plan using actual Office.js capabilities measured in Phase 0 and the shared Office abstractions established in Phase 2.
