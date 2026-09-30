# Phase 0 — PowerPoint Shape Validation

> Status: Source/identity/update strategy is covered by automated tests. Actual PowerPoint host save/reopen/update behavior remains a manual validation gate.

## Strategy under validation

VietMath should avoid locking Phase 0 to PowerPoint's preview `ShapeCollection.addPicture()` API.

The stable candidate used for the production spike is:

1. create a normal geometric shape;
2. fill that shape with a Base64 equation image using `shape.fill.setImage(...)`;
3. attach VietMath metadata with shape tags;
4. bind the shape with a stable VietMath binding ID when PowerPointApi 1.8 is available;
5. refresh the same shape's image rather than deleting/recreating it.

Microsoft documents this geometric-shape + image-fill + binding pattern for add-ins that need to find and refresh the same shape later:

- https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/bind-shapes-in-presentation

PowerPoint shape tags are available from PowerPointApi 1.3:

- https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.tagcollection

The current Microsoft documentation marks `ShapeCollection.addPicture()` / `PictureAddOptions` as preview-only, so VietMath should not require that path for 1.0 unless its status changes:

- https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.shapecollection
- https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.pictureaddoptions

## Automated contract

`packages/powerpoint-spike` proves:

- source metadata can be encoded/decoded;
- binding IDs are deterministic from VietMath object IDs;
- an update changes image + metadata while preserving the pre-update geometry snapshot;
- duplicating a VietMath equation assigns a new VietMath object ID and resets revision;
- update failures are explicit and do not mutate the caller's metadata object.

The geometry tracked by Phase 0 is:

- left;
- top;
- width;
- height;
- rotation.

## Phase 0 metadata limitation

As with the Word spike, the source is embedded directly in a tag only to prove round-trip behavior for short fixtures.

For production, the preferred design is:

- small tag: VietMath object ID/schema pointer;
- full source: document-level storage when a reliable PowerPoint mechanism is confirmed.

This avoids relying on undocumented practical tag-size limits.

## Manual host matrix still required

On Microsoft 365 PowerPoint for Windows and macOS:

1. create the equation shape on the selected slide;
2. attach tag and binding;
3. move and resize it;
4. rotate it;
5. save and close;
6. reopen;
7. recover the shape by binding/tag;
8. update only the fill image;
9. verify left/top/width/height/rotation remain unchanged;
10. duplicate the shape;
11. duplicate the slide;
12. confirm duplicated VietMath objects receive distinct IDs before future updates;
13. test z-order;
14. test grouping and animation separately and document limitations.

## Current gate

- metadata encode/decode: PASS automated;
- stable binding ID policy: PASS automated;
- geometry-preserving update plan: PASS automated;
- duplicate-ID policy: PASS automated;
- real PowerPoint insert/save/reopen/update: PENDING manual;
- grouping/animation behavior: PENDING manual.
