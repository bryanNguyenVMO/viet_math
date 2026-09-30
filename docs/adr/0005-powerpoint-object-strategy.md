# ADR 0005 — PowerPoint Equation Object Strategy

> Status: Accepted provisionally  
> Date: 2026-09-30

## Context

VietMath needs an equation object in PowerPoint that can be found later, refreshed without unexpected geometry loss, and associated with recoverable VietMath source.

## Decision

Prefer a **bound geometric shape with image fill** rather than requiring picture insertion.

Phase 0 strategy:

1. create a geometric shape;
2. render the equation to a Base64 image/vector-compatible representation;
3. call `shape.fill.setImage(...)`;
4. add VietMath source/object tag;
5. add a binding with ID `vietmath:<object-id>` when PowerPointApi 1.8 is supported;
6. edit by retrieving the bound shape and updating its fill instead of deleting/recreating it.

References used for the decision:

- https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/bind-shapes-in-presentation
- https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.tagcollection
- https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.shapecollection

The current Microsoft documentation marks `ShapeCollection.addPicture()` as preview-only, so it is not a required production dependency.

## Phase 0 evidence

Automated tests validate:

- metadata encode/decode;
- deterministic binding ID;
- same-shape image update contract;
- preservation of a geometry snapshot;
- typed update failure;
- duplicate metadata receives a new VietMath object ID;
- host spike uses geometric shape + fill image + binding + tags;
- host update retrieves the bound shape and refreshes its fill.

## Storage ruling

Full equation source in a shape tag is Phase 0 only.

Production target is a small object tag plus a document-level source store if PowerPoint host validation identifies a reliable mechanism.

## Remaining gates

On real PowerPoint Microsoft 365 Windows/macOS validate:

- save/reopen;
- tag and binding persistence;
- same-shape refresh;
- x/y/width/height/rotation;
- z-order;
- duplicate shape;
- duplicate slide;
- grouping;
- animation behavior.

Any behavior that cannot be preserved must be documented rather than hidden.
