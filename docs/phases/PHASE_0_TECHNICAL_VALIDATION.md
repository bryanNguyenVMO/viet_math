# Phase 0 — Technical Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use a task-by-task implementation workflow with tests/verification before moving to the next task.
>
> Status: Ready for implementation planning review  
> Updated: 2026-09-30

**Goal:** Prove that VietMath's proposed desktop/editor/export/Office architecture is technically viable before investing in the production application.

**Architecture:** Build throwaway-but-structured spikes around Tauri 2 + React + TypeScript, with a thin VietMath editor adapter around MathLive. Validate export paths and Microsoft Office round-trip behavior separately so a failure in one area does not contaminate the rest of the architecture.

**Tech Stack:** Tauri 2, React, TypeScript, Vite, Tailwind CSS, shadcn/ui/Radix primitives, MathLive, MathJax where export validation requires it, Office.js for Office spikes, Vitest for unit/integration tests, Playwright only where browser-like E2E adds value.

**Specs:**  
- `docs/PRODUCT.md`  
- `docs/ARCHITECTURE.md`  
- `docs/UI_DESIGN.md`  
- `docs/EDITOR_SPEC.md`  
- `docs/OFFICE_INTEGRATION.md`  
- `docs/TEST_STRATEGY.md`

## Global constraints

- Desktop targets: Windows and macOS.
- Core desktop experience is offline-first.
- Vietnamese IME behavior is a release blocker.
- Application icons use Lucide; mathematical symbols render through the math engine.
- MathLive must be wrapped behind a VietMath-owned adapter.
- Unsupported export/Office constructs must fail explicitly; never silently drop content.
- Canonical equation source must not depend only on local SQLite.
- Phase 0 validates architecture; it does not build the full production UI.
- Every spike must leave a short written result: pass, fail, limitation, benchmark, and recommended next decision.

## Review focus

1. **IME composition:** Telex/VNI input inside math text must not trigger shortcuts or corrupt composed Vietnamese.
2. **Nested editing:** fraction/root/script navigation and undo must preserve structure after repeated edits.
3. **Export bounds:** SVG/PNG must not crop radicals, accents, large operators, or Vietnamese text.
4. **Word round-trip:** save/reopen/edit must preserve a recoverable VietMath source for supported equations.
5. **PowerPoint update:** editing an inserted equation must preserve position/size and object identity where the API allows it.

---

## 1. Proposed Phase 0 repository shape

Phase 0 should introduce only the minimum structure needed for the spikes:

```text
apps/
├── desktop-spike/
├── word-addin-spike/
└── powerpoint-addin-spike/

packages/
├── editor-core/
├── equation-model/
└── export-spike/

tests/
├── corpus/
├── editor/
└── export/

docs/
├── adr/
└── validation/
```

Do not scaffold production-only packages until a Phase 0 result justifies them.

## 2. Branch strategy

Use small branches so failures can be isolated:

```text
feature/phase-0-desktop-spike
feature/phase-0-export-spike
feature/phase-0-word-spike
feature/phase-0-powerpoint-spike
```

If execution is done by one person sequentially, branches may be merged into a parent Phase 0 branch before main.

## 3. Task plan

### Task 1: Workspace and desktop shell spike

**Deliverable:** A minimal Tauri desktop app opens on Windows and macOS and renders the VietMath shell without product feature breadth.

**Files to create:**
- `pnpm-workspace.yaml`
- root `package.json`
- `apps/desktop-spike/`
- minimal shared TypeScript config
- `docs/validation/phase-0-desktop-baseline.md`

**Produces:**
- reproducible dev/build commands;
- measured cold-start and idle-memory baseline;
- decision whether Tauri remains viable.

- [ ] Create a minimal workspace with `pnpm` and a committed lockfile.
- [ ] Scaffold React + TypeScript + Vite in `apps/desktop-spike`.
- [ ] Add Tauri 2 shell.
- [ ] Add Tailwind and only the minimal shared UI primitives needed for a shell.
- [ ] Render a simple VietMath frame: toolbar placeholder, editor region, left/right panel placeholders.
- [ ] Build on Windows.
- [ ] Build on macOS.
- [ ] Record cold start, warm reopen, idle RAM, installer/build artifact size.
- [ ] Record any WebView-specific issue in `docs/validation/phase-0-desktop-baseline.md`.
- [ ] Commit with a focused message such as `spike: validate Tauri desktop shell`.

**Pass criteria:**
- starts on both OS targets;
- no blocker caused by WebView boot behavior;
- metrics are within a range worth optimizing rather than forcing an immediate shell change.

---

### Task 2: Equation model boundary

**Deliverable:** A minimal domain model that can hold valid source, current draft, display mode, and style without depending on MathLive.

**Files to create:**
- `packages/equation-model/src/types.ts`
- `packages/equation-model/src/serialize.ts`
- `packages/equation-model/src/index.ts`
- tests under `packages/equation-model/src/*.test.ts`

**Interface to produce:**

```ts
export type EquationDocument = {
  schemaVersion: 1;
  latex: string;
  draftLatex?: string;
  displayMode: "inline" | "block";
  style: {
    fontSize?: number;
    color?: string;
  };
};

export function serializeEquation(doc: EquationDocument): string;
export function deserializeEquation(raw: string): EquationDocument;
```

- [ ] Write tests for valid serialization round-trip.
- [ ] Write a test proving an invalid/incomplete draft can coexist with last valid `latex`.
- [ ] Implement the minimum model and serializer.
- [ ] Run tests.
- [ ] Commit.

**Pass criteria:**
- no editor-library types leak into the domain model;
- draft preservation is explicit.

---

### Task 3: MathLive adapter spike

**Deliverable:** A VietMath-owned editor API wraps MathLive and supports the core structural operations required for feasibility testing.

**Files to create:**
- `packages/editor-core/src/VietMathEditor.ts`
- `packages/editor-core/src/mathlive/MathLiveAdapter.ts`
- `packages/editor-core/src/commands.ts`
- editor tests

**Minimum interface:**

```ts
export interface VietMathEditor {
  getLatex(): string;
  setLatex(latex: string): void;
  insertLatex(latex: string): void;
  focus(): void;
  undo(): void;
  redo(): void;
}
```

**Required structures:**
- fraction;
- square/nth root;
- superscript/subscript;
- integral;
- summation;
- limit;
- matrix;
- cases/system;
- text inside equation.

- [ ] Write adapter tests around input/output behavior that does not depend on DOM internals.
- [ ] Implement the thin adapter.
- [ ] Add a Phase 0 editor page to exercise all required structures.
- [ ] Verify cursor movement in nested fraction/root/script structures.
- [ ] Verify matrix cell movement.
- [ ] Verify undo/redo after structural insertion.
- [ ] Verify paste LaTeX and read-back LaTeX.
- [ ] Record unsupported/awkward behavior in `docs/validation/phase-0-editor.md`.
- [ ] Commit.

**Pass criteria:**
- no blocker in common structures;
- adapter shields the rest of the app from MathLive implementation details;
- undo/navigation behavior is good enough to continue or has a realistic workaround.

---

### Task 4: Vietnamese IME validation

**Deliverable:** A reproducible IME test matrix and evidence that Vietnamese text works in all Phase 0 input contexts.

**Files to create:**
- `tests/editor/ime-cases.md`
- `docs/validation/phase-0-ime.md`
- any targeted automated composition-event tests that are stable enough to be meaningful.

**Manual matrix:**

Windows:
- UniKey Telex;
- UniKey VNI;
- EVKey if available.

macOS:
- built-in Vietnamese Telex;
- one additional input mode if commonly used by testers.

**Contexts:**
- editor text mode;
- cases condition;
- symbol/template search;
- normal settings text field.

**Test strings:**
- `tiếng Việt`
- `phương trình`
- `nếu`
- `với mọi`
- `điều kiện`
- `nghiệm`
- `tích phân`

- [ ] Add composition event logging in the spike if needed.
- [ ] Verify shortcuts do not fire while IME is composing.
- [ ] Verify backspace during composition.
- [ ] Verify undo after completed Vietnamese text entry.
- [ ] Verify mode switching Math ↔ Text does not corrupt composed text.
- [ ] Record results by OS/input method.
- [ ] Commit fixes/workarounds only if they belong in the adapter boundary.

**Pass criteria:**
- no repeatable text corruption or lost-diacritic blocker;
- any remaining issue has a scoped workaround and test.

---

### Task 5: Export pipeline spike

**Deliverable:** Generate LaTeX, SVG, PNG, and MathML for the Phase 0 corpus with explicit success/failure results.

**Files to create:**
- `packages/export-spike/src/exportLatex.ts`
- `packages/export-spike/src/exportSvg.ts`
- `packages/export-spike/src/exportPng.ts`
- `packages/export-spike/src/exportMathMl.ts`
- `tests/corpus/phase-0-equations.json`
- export tests
- `docs/validation/phase-0-export.md`

**Result shape:**

```ts
export type ExportResult =
  | { ok: true; data: string | Uint8Array }
  | { ok: false; code: string; message: string };
```

- [ ] Create at least 50 representative equations in the corpus.
- [ ] Include nested fraction/root, large operators, matrix, cases, Vietnamese text.
- [ ] Implement deterministic LaTeX output for the supported subset.
- [ ] Validate SVG parseability and bounds.
- [ ] Validate PNG scale/background/alpha.
- [ ] Validate MathML syntax and supported semantic structure.
- [ ] Add regression cases for clipping.
- [ ] Record which path requires MathJax and whether lazy-loading is viable.
- [ ] Commit.

**Pass criteria:**
- no silent loss;
- no systematic crop in required cases;
- export cost is acceptable for lazy/on-demand execution.

---

### Task 6: Clipboard behavior spike

**Deliverable:** Prove the desktop app can reliably copy the output types needed by the initial UX.

**Files to create:**
- clipboard adapter under the desktop spike
- `docs/validation/phase-0-clipboard.md`

- [ ] Copy plain LaTeX text.
- [ ] Copy PNG image.
- [ ] Test SVG/text strategy supported by target OS APIs.
- [ ] Paste into Word, PowerPoint, browser text fields, and a basic image app.
- [ ] Record platform differences.
- [ ] Keep user-visible commands explicit: Copy LaTeX / Copy Image / Save SVG rather than claiming universal clipboard interoperability.
- [ ] Commit.

**Pass criteria:**
- core copy actions work consistently;
- platform-specific limitations are understood before product UX is locked.

---

### Task 7: Word native equation proof-of-concept

**Deliverable:** A Word add-in spike that inserts at least the core equation fixtures, persists VietMath source in the document, and reopens them for editing.

**Files to create:**
- `apps/word-addin-spike/`
- Word host adapter spike
- conversion spike
- `docs/validation/phase-0-word.md`

**Required flow:**

```text
Create → Insert → Save → Close → Reopen → Select → Edit → Update
```

**Fixtures:**
- fraction;
- nested radical;
- integral/summation;
- matrix;
- cases with Vietnamese text.

- [ ] Create the minimum Office add-in shell.
- [ ] Prove native equation insertion for at least one simple fixture.
- [ ] Extend conversion fixture-by-fixture.
- [ ] Persist VietMath object ID + schema version + source in document-supported metadata.
- [ ] Save, close, reopen, and recover source.
- [ ] Update the selected equation.
- [ ] Test on Windows Microsoft 365 Word.
- [ ] Test on macOS Microsoft 365 Word.
- [ ] Test a second document/profile/machine where practical.
- [ ] Test external modification conflict detection concept.
- [ ] Record unsupported native constructs and required vector fallback.
- [ ] Commit.

**Pass criteria:**
- at least the Phase 0 supported subset survives round-trip;
- source is not only local;
- native conversion path is viable enough to justify Phase 2 investment.

---

### Task 8: PowerPoint vector round-trip proof-of-concept

**Deliverable:** Insert an equation visual with recoverable VietMath source and update it without losing basic geometry.

**Files to create:**
- `apps/powerpoint-addin-spike/`
- PowerPoint host adapter spike
- `docs/validation/phase-0-powerpoint.md`

- [ ] Insert SVG/vector-compatible equation output.
- [ ] Persist VietMath object ID/source through the best supported metadata mechanism.
- [ ] Save/reopen and recover source.
- [ ] Edit and replace visual.
- [ ] Preserve x/y/width/height.
- [ ] Check rotation/z-order handling where API allows.
- [ ] Duplicate shape.
- [ ] Duplicate slide.
- [ ] Record ID/source behavior and collisions.
- [ ] Commit.

**Pass criteria:**
- position/size survives normal edit/update;
- source can be recovered after save/reopen;
- no architectural blocker for a production add-in.

---

### Task 9: Performance and footprint benchmark

**Deliverable:** Comparable baseline numbers and a go/no-go recommendation for Tauri + chosen editor/export approach.

**Files to create:**
- `docs/validation/phase-0-performance.md`
- benchmark scripts where automation is reliable.

**Measure:**
- cold start;
- warm show/reopen;
- idle memory;
- typical editing memory;
- input responsiveness on simple/complex equation;
- 10x10 matrix stress behavior;
- export duration;
- build/installer footprint.

- [ ] Define reference Windows machine.
- [ ] Define reference macOS machine.
- [ ] Capture measurements using repeatable steps.
- [ ] Compare with product targets in `PRODUCT.md`.
- [ ] Identify startup/bundle/lazy-load opportunities.
- [ ] Record whether any target must be revised.
- [ ] Commit.

---

### Task 10: Architecture decision review

**Deliverable:** Phase 0 closes with explicit architecture decisions, not just a collection of spikes.

**Files to create:**
- `docs/adr/0001-desktop-shell.md`
- `docs/adr/0002-editor-engine.md`
- `docs/adr/0003-equation-source-model.md`
- `docs/adr/0004-word-storage-and-conversion.md`
- `docs/adr/0005-powerpoint-object-strategy.md`
- `docs/validation/PHASE_0_SUMMARY.md`

- [ ] Summarize each spike as PASS / PASS WITH LIMITATIONS / FAIL.
- [ ] Record measured performance.
- [ ] Record known unsupported constructs.
- [ ] Confirm or replace Tauri.
- [ ] Confirm or replace MathLive.
- [ ] Confirm export architecture.
- [ ] Confirm Word source/OMML strategy.
- [ ] Confirm PowerPoint vector/source strategy.
- [ ] Update `ARCHITECTURE.md`, `EDITOR_SPEC.md`, `OFFICE_INTEGRATION.md`, and `ROADMAP.md` where findings change assumptions.
- [ ] Define Phase 1 implementation scope from proven capabilities.
- [ ] Commit the architecture-lock documentation.

## 4. Phase 0 Definition of Done

Phase 0 is complete only when all of the following are true:

- Windows desktop spike runs.
- macOS desktop spike runs.
- MathLive adapter viability is decided.
- Vietnamese IME matrix has no unresolved blocker.
- 50+ equation corpus exists.
- SVG/PNG/MathML export is validated.
- Word create/save/reopen/edit flow is demonstrated for the supported subset or explicitly rejected with a replacement architecture.
- PowerPoint create/save/reopen/edit flow is demonstrated for the supported subset or explicitly rejected with a replacement architecture.
- Performance baseline is documented.
- ADRs capture the architecture decisions.
- Phase 1 brief is updated from actual Phase 0 evidence.

## 5. Explicit non-goals

Phase 0 does not require:

- polished full UI;
- production updater;
- production installer design;
- complete formula library;
- OCR;
- AI features;
- Google Docs/WPS/LibreOffice;
- full MathType compatibility;
- hundreds of toolbar buttons;
- broad Office version support.

## 6. Expected output

After Phase 0, the team should be able to answer with evidence:

1. Can VietMath use Tauri for the intended Windows/macOS experience?
2. Can MathLive satisfy the required editing model behind an adapter?
3. Does Vietnamese IME work reliably?
4. Can exports be produced without fidelity loss in the supported subset?
5. Can Word equations be inserted and edited again with source retention?
6. Can PowerPoint equations be updated with source retention and geometry preservation?
7. Are the performance/footprint characteristics compatible with the product positioning?
