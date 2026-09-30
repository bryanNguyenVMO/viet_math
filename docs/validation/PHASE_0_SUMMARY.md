# Phase 0 — Technical Validation Summary

> Status: **AUTOMATED SPIKES COMPLETE — PHASE 0 NOT CLOSED**  
> Updated: 2026-09-30

## Executive result

The proposed VietMath architecture has enough automated evidence to continue validation:

- Tauri builds on Windows/macOS;
- MathLive is isolated behind a VietMath adapter;
- the equation source model is versioned and editor-independent;
- Vietnamese IME composition has an app-level guard;
- 50 representative equation fixtures exist;
- LaTeX/MathML export paths are working;
- clipboard has a platform abstraction;
- Word OMML/OOXML construction is viable;
- PowerPoint has a stable bound-shape update strategy;
- all current automated tests and cross-platform desktop builds pass on the latest code-bearing validation run.

However, Phase 0's own Definition of Done requires real host/machine evidence that CI cannot provide.

**Do not label Phase 0 complete until the manual gates below are green or explicitly waived/replaced.**

## Latest automated verification

Code-bearing run:

- GitHub Actions run: `36680501813`
- Commit: `3b3e6e03eb1a7f2ad31923ee652028f8f0114203`
- Test files: **13 passed**
- Tests: **38 passed**
- Windows Tauri debug build: **PASS**
- macOS Tauri debug build: **PASS**
- Vite build: **PASS**

Phase 0 implementation was performed directly on `main` because the repository owner explicitly requested that workflow.

## Task status

| Task | Status | Evidence / limitation |
|---|---|---|
| 1. Desktop shell | PASS WITH LIMITATIONS | Win/mac builds pass; runtime metrics pending |
| 2. Equation model | PASS | schema v1 + serialization tests |
| 3. MathLive adapter | PASS WITH LIMITATIONS | adapter/templates automated; real interactive QA remains |
| 4. Vietnamese IME | PARTIAL | composition guard pass; OS IME matrix pending |
| 5. Export | PARTIAL | LaTeX/MathML pass; self-contained SVG/PNG fidelity unresolved |
| 6. Clipboard | PARTIAL | abstraction/tests pass; native paste matrix pending |
| 7. Word | PARTIAL | OMML/OOXML/source contracts pass; Word host lifecycle pending |
| 8. PowerPoint | PARTIAL | shape/tag/binding/update contracts pass; host lifecycle pending |
| 9. Performance | PARTIAL | build/footprint measured; runtime performance pending |
| 10. Architecture review | PASS | ADRs recorded with explicit reopen conditions |

## Decisions that can stand now

### Desktop

Continue with Tauri 2 unless real-machine validation reveals a WebView/IME/clipboard/performance blocker.

See: `docs/adr/0001-desktop-shell.md`.

### Editor

Continue with MathLive behind `VietMathEditor`.

Do not expose MathLive APIs through unrelated feature code.

See: `docs/adr/0002-editor-engine.md`.

### Source model

Use versioned `EquationDocument` as canonical source.

See: `docs/adr/0003-equation-source-model.md`.

### Word

Continue the native Word route as:

```text
EquationDocument → converter → OMML → OOXML
```

Use explicit visual fallback for unsupported structures.

See: `docs/adr/0004-word-storage-and-conversion.md`.

### PowerPoint

Continue with geometric shape + image fill + tag + binding and refresh the same shape.

See: `docs/adr/0005-powerpoint-object-strategy.md`.

### Export

Keep renderer-independent exporter interfaces.

MathLive SSR is acceptable for MathML. A self-contained SVG renderer still needs validation; MathJax remains the leading candidate in the architecture spec.

## Known unresolved technical areas

### 1. Vietnamese IME

Need real Windows/macOS runs for:

- UniKey Telex;
- UniKey VNI;
- macOS Vietnamese input source.

Checklist: `tests/editor/ime-cases.md`.

### 2. SVG/PNG fidelity

The generic `foreignObject` SVG spike is not approved for production Office output.

Need to prove:

- self-contained fonts/styles;
- radicals/accents/large operators not clipped;
- transparent background;
- Vietnamese text;
- SVG compatibility with Word/PowerPoint;
- PNG rasterization at multiple scales.

### 3. Native clipboard

Need real paste tests into:

- Word;
- PowerPoint;
- browser text input;
- image editor.

If Web Clipboard rich formats are inconsistent, implement a Tauri/native port behind the existing interface.

### 4. Word lifecycle

Need real:

```text
Insert → Save → Close → Reopen → Recover → Edit → Update
```

Also test:

- native Word modification conflict;
- copy to another document;
- second machine/profile;
- Vietnamese text;
- supported/unsupported converter fixtures.

### 5. PowerPoint lifecycle

Need real:

```text
Insert → Move/Resize/Rotate → Save → Reopen → Recover → Update
```

Also test duplicate shape/slide, z-order, grouping, animation.

### 6. Runtime performance

CI has footprint data, but real-machine data is still required for:

- cold start;
- warm show;
- memory;
- input latency.

See: `docs/validation/phase-0-performance.md`.

## Performance evidence already recorded

Reference cross-platform run `36679750214`:

- JS: 1,050.47 kB minified / 299.61 kB gzip;
- CSS: 20.67 kB / 7.82 kB gzip;
- Windows debug binary: ~12.58 MiB;
- macOS debug binary: ~27.23 MiB.

The >500 kB main JS chunk is a Phase 1 optimization target, not a Phase 0 architecture blocker.

## Manual closure checklist

Phase 0 can be marked complete only after all required rows are resolved:

| Gate | Windows | macOS | Required outcome |
|---|---|---|---|
| Vietnamese IME | Pending | Pending | no corruption/blocker |
| SVG/PNG visual fidelity | Pending | Pending | supported corpus renders correctly |
| Clipboard native paste | Pending | Pending | documented compatible actions |
| Word lifecycle | Pending | Pending | supported round-trip passes |
| PowerPoint lifecycle | Pending | Pending | supported round-trip passes |
| Runtime benchmark | Pending | Pending | measurements recorded and reviewed |

A failed gate does not automatically kill VietMath. It must produce one of:

1. a fix + regression test;
2. a scoped limitation + fallback;
3. an ADR replacing the affected architecture.

## Next action

Run the manual validation harness on real Windows/macOS machines and Office hosts.

After those results:

1. update the relevant validation docs;
2. reopen any ADR affected by a blocker;
3. mark Phase 0 closed only when all required gates have a disposition;
4. expand `PHASE_1_DESKTOP_ALPHA.md` into the detailed implementation plan.
