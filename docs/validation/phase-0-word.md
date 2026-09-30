# Phase 0 — Word Native Equation Validation

> Status: OOXML/OMML package generation is covered by automated tests. Actual Word desktop insert/save/reopen/edit is pending manual host validation.

## Proven in code

The Word spike now has:

- OMML builders for a fraction;
- OMML builder for a square radical;
- OMML matrix builder;
- XML escaping for math text;
- a `pkg:package` builder suitable for the Word `Range.insertOoxml()` path;
- a Word content control carrying a VietMath metadata tag;
- metadata encode/decode round-trip including canonical LaTeX.

The automated contract verifies the package contains:

- WordprocessingML document content;
- the Office Math namespace;
- `m:oMath`;
- a `w:sdt` container;
- a recoverable `vietmath:` tag.

## Important Phase 0 limitation

The current metadata tag embeds the complete JSON source as base64url. This is intentionally a short-fixture proof of concept, not the production storage format.

Production documents should move full source to a document-level metadata/custom XML strategy and keep the content-control tag small (object ID/version).

## Native conversion status

This spike proves **OMML packaging**, not a complete LaTeX/MathML → OMML converter.

The next converter validation must cover, at minimum:

- fraction;
- radical;
- script;
- large operators;
- matrix;
- cases;
- Vietnamese text.

Unsupported structures must use an explicit vector fallback.

## Manual Word matrix required

On Microsoft 365 Word for Windows and macOS:

1. Insert the generated OOXML at the selection.
2. Confirm Word displays a native equation.
3. Save.
4. Close.
5. Reopen.
6. Locate the VietMath content control/tag.
7. Recover source.
8. Replace/update the equation.
9. Copy to another document and observe whether metadata follows.
10. Edit the equation natively in Word and verify conflict detection can identify the change.

## Current gate

- OMML primitive generation: PASS automated.
- OOXML package construction: PASS automated.
- Source metadata encode/decode: PASS automated.
- Word host insertion: PENDING manual.
- Save/reopen source recovery: PENDING manual.
- Cross-machine/document transfer: PENDING manual.
- Full native conversion subset: NOT YET PASSED.
