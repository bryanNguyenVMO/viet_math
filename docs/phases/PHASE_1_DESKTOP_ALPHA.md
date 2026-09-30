# Phase 1 — Desktop Alpha Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Status: **AUTOMATED IMPLEMENTATION COMPLETE — ALPHA USER TESTING PENDING**  
> Updated: 2026-10-01

**Goal:** Turn the validated Phase 0 architecture into a coherent VietMath Desktop Alpha for Windows and macOS that a real user can install, edit equations with, recover work, manage a small formula library, and copy/export results.

**Architecture:** Production code moves out of `*-spike` application surfaces into a production `apps/desktop` shell plus VietMath-owned packages. Tauri 2 remains the desktop shell, MathLive stays behind a `VietMathEditor` adapter, and `EquationDocument` remains the canonical model. Phase 0 spike code remains as validation evidence but production packages must not import from spike apps/packages.

**Tech Stack:** Tauri 2, React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui/Radix primitives, Lucide React, MathLive 0.110.x, Zustand, i18next, react-resizable-panels, react-hook-form, Zod, SQLite through a narrow Tauri/native storage port, Vitest.

**Specs:**
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/UI_DESIGN.md`
- `docs/EDITOR_SPEC.md`
- `docs/TEST_STRATEGY.md`
- `docs/adr/0001-desktop-shell.md`
- `docs/adr/0002-editor-engine.md`
- `docs/adr/0003-equation-source-model.md`

## Global Constraints

- Windows and macOS are P0 desktop targets.
- Core desktop editing remains offline-first and requires no account.
- Tauri 2 is the desktop shell unless a validated Phase 1 blocker reopens ADR 0001.
- MathLive remains behind a VietMath-owned adapter; feature code must not depend on MathLive directly.
- `EquationDocument` is the canonical source model; SVG/PNG/MathML remain derived outputs.
- Vietnamese IME correctness is a release blocker.
- App icons use Lucide; mathematical symbols/templates render through the math engine.
- UI text must go through i18n once Task 7 lands; Vietnamese and English are required.
- No silent data loss: invalid drafts, export failures, persistence failures, and clipboard failures must preserve the current editor source.
- Dark theme must not implicitly change export colors.
- Word/PowerPoint production integration is out of scope for Phase 1.

## Review Focus

1. **Draft preservation:** incomplete LaTeX such as `\frac{` must survive autosave/restart without replacing the last valid source.
2. **IME + shortcuts:** app shortcuts must not fire while Vietnamese IME composition is active.
3. **Large library:** recent/favorites/templates must not cause editor keystroke rerenders or long startup when storage grows.
4. **Export fidelity:** radicals, accents, large operators, matrices, and Vietnamese text must not be clipped in SVG/PNG.
5. **Theme isolation:** switching app theme must not change canonical equation source or default black/transparent export output.

---

## Execution status

- Tasks 1–19: implemented with current CI green.
- Task 20: testing kit is ready; real 5–10 user sessions are still required.
- Latest verified code-bearing commit at this status update: `2e86f5e692e82d17bef8e2773cb8f853bc763bdb`.
- Desktop CI run `36747930809`: tests/build + Windows/macOS Tauri debug builds PASS.
- Alpha Release run `36747930829`: Windows NSIS + macOS DMG installers PASS.

See `docs/validation/PHASE_1_SUMMARY.md`.

## Milestones

### 1A — Core Desktop
Tasks 1–5: production structure, design system, main layout, editor, LaTeX/draft mode.

### 1B — Productivity
Tasks 6–9: search/palette, i18n, storage/autosave, library.

### 1C — Desktop Experience
Tasks 10–16: export, clipboard, quick editor, shortcuts, settings, themes, error/recovery UX.

### 1D — Alpha Release
Tasks 17–20: performance, corpus, installers, user testing.

---

## Task 1 — Production workspace and desktop shell

**Files:**
- Create: `apps/desktop/package.json`
- Create: `apps/desktop/tsconfig.json`
- Create: `apps/desktop/vite.config.ts`
- Create: `apps/desktop/index.html`
- Create: `apps/desktop/src/main.tsx`
- Create: `apps/desktop/src/App.tsx`
- Create: `apps/desktop/src/styles.css`
- Create: `apps/desktop/src-tauri/Cargo.toml`
- Create: `apps/desktop/src-tauri/build.rs`
- Create: `apps/desktop/src-tauri/tauri.conf.json`
- Create: `apps/desktop/src-tauri/src/main.rs`
- Create: `tests/phase1/production-structure.test.ts`
- Modify: root `package.json`
- Modify: `.github/workflows/phase0-desktop.yml` or replace with a renamed desktop workflow once production build is green
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: Tauri/React versions already proven by Phase 0.
- Produces: `@vietmath/desktop` with `dev`, `build`, `test`, `tauri` scripts and a buildable Tauri app.

- [ ] Write `tests/phase1/production-structure.test.ts` asserting production app files exist, package name is `@vietmath/desktop`, and no production source imports `desktop-spike`.
- [ ] Run `pnpm test`; expected RED because `apps/desktop` does not exist.
- [ ] Create the minimal React/Tauri production shell.
- [ ] Update workspace/root scripts and lockfile so `pnpm build` builds production desktop assets.
- [ ] Add CI production build on Windows/macOS while retaining Phase 0 evidence.
- [ ] Run full `pnpm test` and `pnpm build`; expected GREEN.
- [ ] Verify Windows/macOS Tauri build in CI.
- [ ] Commit `feat: bootstrap VietMath production desktop app`.

## Task 2 — VietMath UI package and design tokens

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/src/tokens.css`
- Create: `packages/ui/src/components/*`
- Create: `packages/ui/src/index.ts`
- Test: `packages/ui/src/*.test.ts`

**Interfaces:**
- Produces: VietMath-owned `Button`, `IconButton`, `Panel`, `Dialog`, `Tooltip`, `SearchInput`, `EquationCard`, `SymbolButton`.
- Feature packages consume only VietMath UI exports, not random Radix imports.

- [ ] Define semantic tokens for background/surface/border/text/primary/status/radius/shadow.
- [ ] Add focused component tests for disabled state, keyboard activation, accessible labels.
- [ ] Implement minimum shared components needed by desktop layout.
- [ ] Add dark token set without changing export styling.
- [ ] Verify test/build and commit.

## Task 3 — Production desktop layout

**Files:**
- Create: `apps/desktop/src/layout/DesktopWorkspace.tsx`
- Create: `apps/desktop/src/layout/Toolbar.tsx`
- Create: `apps/desktop/src/layout/LibraryPanel.tsx`
- Create: `apps/desktop/src/layout/SymbolPanel.tsx`
- Test: matching component/contract tests.

**Interfaces:**
- Produces: left library + center editor + right symbols workspace with collapsible/resizable panels.

- [ ] Test that four productivity regions remain reachable by keyboard.
- [ ] Implement shell and panel layout using `react-resizable-panels`.
- [ ] Persist panel open/closed + width through a preference port introduced in Task 8; until then use in-memory defaults.
- [ ] Ensure editor region does not remount during panel resize.
- [ ] Verify and commit.

## Task 4 — Production editor package

**Files:**
- Create: `packages/editor/package.json`
- Create: `packages/editor/src/VietMathEditor.ts`
- Create: `packages/editor/src/mathlive/MathLiveAdapter.ts`
- Create: `packages/editor/src/templates.ts`
- Create: `packages/editor/src/ImeCompositionGuard.ts`
- Test: `packages/editor/src/*.test.ts`

**Interfaces:**
- Produces:
  - `getLatex(): string`
  - `setLatex(latex: string): void`
  - `insertLatex(latex: string): void`
  - `focus(): void`
  - `undo(): void`
  - `redo(): void`
  - `getSelection(): EditorSelection`
  - `setMode(mode: "math" | "text"): void`
  - `subscribe(listener): () => void`

- [ ] Port behavior from Phase 0 through tests first, not direct imports from spike package.
- [ ] Cover fraction/root/scripts/integral/sum/limit/matrix/cases.
- [ ] Cover nested cursor boundaries, structural delete, undo/redo, selection replacement.
- [ ] Cover IME command suppression.
- [ ] Integrate into desktop app and commit.

## Task 5 — Visual / LaTeX / draft editing

**Files:**
- Create: `apps/desktop/src/editor/EditorWorkspace.tsx`
- Create: `apps/desktop/src/editor/LatexSourcePanel.tsx`
- Create: `packages/equation-model/src/draft.ts`
- Tests: editor/model draft tests.

**Interfaces:**
- `latex` = last supported canonical source.
- `draftLatex` = current incomplete source when parse/import cannot commit.

- [ ] Test incomplete `\frac{` is preserved as draft while prior valid `latex` remains.
- [ ] Implement synchronized Visual / LaTeX modes.
- [ ] Invalid raw LaTeX shows non-modal feedback and never clears content.
- [ ] Verify round-trip for supported corpus and commit.

## Task 6 — Symbol/structure catalog and search

**Files:**
- Create: `packages/editor/src/catalog/*`
- Create: `packages/shared/src/search/normalizeVietnamese.ts`
- Create: `apps/desktop/src/symbols/*`
- Tests: aliases/search ranking.

**Interfaces:**
- Search record includes `vi`, `viAscii`, `en`, `latex` aliases.
- Search normalization never mutates equation content.

- [ ] Test `phân số`, `phan so`, `fraction`, `frac` resolve fraction.
- [ ] Add common structures and symbols grouped by semantic category.
- [ ] Render math previews via editor/math renderer, not Lucide.
- [ ] Add keyboard selection and insert action.
- [ ] Verify and commit.

## Task 7 — i18n foundation

**Files:**
- Create: `packages/i18n/*`
- Create: `packages/i18n/locales/vi.json`
- Create: `packages/i18n/locales/en.json`
- Modify: desktop UI strings.
- Tests: missing keys, switching, fallback.

**Interfaces:**
- `t(key)` for all production UI strings.
- UI locale and math notation settings are independent.

- [ ] Test Vietnamese and English core keys.
- [ ] Migrate production shell strings.
- [ ] Add OS-locale initial selection + user override.
- [ ] Verify no missing required keys and commit.

## Task 8 — Storage, autosave, and crash recovery

**Files:**
- Create: `packages/storage/*`
- Create: Tauri storage commands in `apps/desktop/src-tauri/src/storage/*`
- Tests: in-memory port + schema/migration/autosave tests.

**Interfaces:**
- `EquationRepository`
- `SettingsRepository`
- `DraftRepository`
- production native adapter backed by SQLite.

- [ ] Define repository ports before native implementation.
- [ ] Test schema version/migrations.
- [ ] Test debounced draft save without losing invalid draft.
- [ ] Implement SQLite adapter behind Tauri boundary.
- [ ] Add crash-recovery offer when an unsent draft exists.
- [ ] Verify and commit.

## Task 9 — Formula library

**Files:**
- Create: `apps/desktop/src/library/*`
- Extend storage repositories.
- Tests: Recent/Favorite/Template/Collection behaviors.

- [ ] Recent ordered by last-opened/updated.
- [ ] Favorite toggle is idempotent.
- [ ] Templates clone into new editable equation rather than modifying template.
- [ ] Add basic user collections if no schedule blocker.
- [ ] Virtualize/thumbnail-cache when list size warrants it.
- [ ] Verify and commit.

## Task 10 — Production export package

**Files:**
- Create: `packages/exporters/*`
- Tests: corpus/golden output tests.

**Interfaces:**
- `exportLatex(doc)`
- `exportSvg(doc, options)`
- `exportPng(doc, options)`
- `exportMathMl(doc)`
- all return explicit success/failure results.

- [ ] Preserve source order; never algebraically simplify.
- [ ] Produce self-contained SVG for supported corpus.
- [ ] PNG supports 1x/2x/4x + transparent/white background.
- [ ] Add crop/bounds regression fixtures.
- [ ] Lazy-load heavy renderer.
- [ ] Verify and commit.

## Task 11 — Production clipboard

**Files:**
- Create: `packages/shared/src/clipboard/*`
- Create Tauri/native clipboard adapter if rich WebView formats are unreliable.
- Tests: port semantics/fallback.

- [ ] Implement explicit Copy LaTeX / Copy Image / Copy MathML.
- [ ] Do not advertise universal rich clipboard behavior.
- [ ] Preserve editor source when clipboard fails.
- [ ] Verify Windows/macOS manual matrix and commit.

## Task 12 — Quick Editor

**Files:**
- Create: `apps/desktop/src/quick/*`
- Add Tauri secondary window/global shortcut setup.
- Tests: quick editor state/use-case tests.

- [ ] Shortcut opens/focuses editor quickly.
- [ ] Esc closes/hides quick editor.
- [ ] Copy and Open Full App actions work.
- [ ] Avoid loading library/settings-heavy modules in quick window.
- [ ] Measure warm-show time and commit.

## Task 13 — Keyboard workflow

**Files:**
- Create: `packages/shared/src/shortcuts/*`
- Integrate with IME guard.
- Tests: collision/composition behavior.

- [ ] Standard Undo/Redo/Cut/Copy/Paste/Command Search.
- [ ] Cmd/Ctrl+K opens symbol search.
- [ ] No custom math shortcut fires during IME composition.
- [ ] Add configurable shortcut schema only for proven shortcuts.
- [ ] Verify and commit.

## Task 14 — Settings

**Files:**
- Create: `apps/desktop/src/settings/*`
- Extend settings schema/storage.
- Use react-hook-form + Zod.

- [ ] General, Appearance, Language, Editor, Shortcuts, Export, Library, Update sections.
- [ ] Settings persist across restart.
- [ ] Invalid persisted settings fall back safely.
- [ ] Verify and commit.

## Task 15 — Light/Dark/System themes

**Files:**
- Extend UI tokens and settings.
- Tests: semantic theme selection/export isolation.

- [ ] System theme follows OS.
- [ ] Manual override persists.
- [ ] Export defaults remain black/transparent unless user explicitly changes export settings.
- [ ] Verify and commit.

## Task 16 — Error and recovery UX

**Files:**
- Create: `packages/shared/src/errors/*`
- Create desktop error/toast surfaces.
- Tests: category→message/fallback behavior.

- [ ] Categories: invalid draft, unsupported export, clipboard, storage, recovery.
- [ ] User never sees raw stack trace in normal UI.
- [ ] Every failure keeps the current source recoverable.
- [ ] Verify and commit.

## Task 17 — Performance optimization

**Files:**
- Modify Vite split config and lazy boundaries.
- Create `docs/validation/phase-1-performance.md`.
- Add benchmark scripts where repeatable.

- [ ] Lazy MathJax/export/settings/library-heavy chunks.
- [ ] Editor core remains eagerly usable.
- [ ] Measure cold start, warm show, RAM, typing, export.
- [ ] Record p50/p95 where practical.
- [ ] Investigate regressions against PRODUCT targets and commit.

## Task 18 — Expand equation corpus

**Files:**
- Extend `tests/corpus/*`.
- Add regression tags/metadata.

- [ ] Grow supported corpus to 100–200+ fixtures.
- [ ] Categories include Vietnamese text and invalid drafts.
- [ ] Every equation bug adds a fixture before fix.
- [ ] Run editor/export suites across corpus and commit.

## Task 19 — Alpha installer pipeline

**Files:**
- Add/update GitHub Actions release workflow.
- Update Tauri bundle config.
- Create `docs/ALPHA_INSTALL.md`.

- [ ] Windows installer artifact.
- [ ] macOS app/dmg artifact as allowed by signing setup.
- [ ] Install/launch/uninstall smoke checklist.
- [ ] Signing/notarization limitations explicitly documented for alpha.
- [ ] Commit.

## Task 20 — Alpha user testing

**Files:**
- Create `docs/testing/PHASE_1_ALPHA_SCRIPT.md`
- Create `docs/testing/PHASE_1_ALPHA_RESULTS.md` after sessions.

- [ ] Recruit 5–10 testers: teachers, students, at least one LaTeX-aware user.
- [ ] Run fixed tasks: quadratic equation, two-equation system, Vietnamese text, integral search, PNG export.
- [ ] Record task success/time/errors/help requests.
- [ ] Fix blocker/critical issues through RED→GREEN regression tests.
- [ ] Publish known limitations and Phase 1 exit decision.

---

## Phase 1 Definition of Done

Phase 1 closes only when:

- production `apps/desktop` builds on Windows and macOS;
- visual editor + raw LaTeX mode work for the supported subset;
- Vietnamese IME has no release blocker;
- symbol/structure search works in Vietnamese/ASCII/English/LaTeX aliases;
- Recent/Favorites/Templates + autosave/crash recovery work;
- SVG/PNG/LaTeX/MathML production export passes supported corpus;
- explicit clipboard actions are documented and work on supported OSes;
- Light/Dark/System and Quick Editor work;
- equation corpus contains at least 100 supported representative fixtures;
- no known critical data-loss bug remains;
- performance benchmark is recorded;
- alpha installer artifacts exist;
- 5–10 target users complete the alpha script and blocker feedback is resolved or explicitly scoped.

## Execution Order

```text
1A Core Desktop:       1 → 2 → 3 → 4 → 5
1B Productivity:       6 → 7 → 8 → 9
1C Desktop Experience: 10 → 11 → 12 → 13 → 14 → 15 → 16
1D Alpha Release:      17 → 18 → 19 → 20
```
