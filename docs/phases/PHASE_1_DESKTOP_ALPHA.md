# Phase 1 — Desktop Alpha Brief

> Status: Brief; expand into a detailed implementation plan only after Phase 0 is approved.  
> Updated: 2026-09-30

## Goal

Turn the validated Phase 0 desktop/editor/export architecture into the first coherent VietMath desktop alpha for Windows and macOS.

## Depends on

- Phase 0 ADRs are complete.
- Desktop shell is confirmed.
- Editor engine/adapter is confirmed.
- Vietnamese IME blocker list is empty.
- Export architecture is confirmed.

## In scope

### Application shell

- production desktop window;
- menu and app-level shortcuts;
- light/dark/system theme;
- persistent window/workspace preferences.

### Editor workspace

- production `VietMathEditor` adapter;
- main editor area;
- compact/full toolbar modes;
- symbol panel;
- left library/recent panel;
- resizable/collapsible panels.

### Vietnamese-first UI

- Vietnamese and English locales;
- search aliases with/without Vietnamese diacritics;
- text mode inside equations;
- locale-independent mathematical notation settings.

### Formula productivity

- Recent.
- Favorites.
- Templates.
- Basic user collections if Phase 1 remains within schedule.
- Search by Vietnamese/English/LaTeX aliases.

### Persistence

- SQLite-backed local store;
- autosave current draft;
- crash recovery;
- recent/history metadata.

### Export

- LaTeX.
- SVG.
- PNG.
- MathML.
- explicit copy/export actions.

### Settings

- language;
- theme;
- export defaults;
- shortcuts that are proven stable;
- editor preferences.

## Out of scope

- Word production add-in;
- PowerPoint production add-in;
- OCR;
- AI;
- cloud sync;
- account/login;
- advanced MathType legacy import.

## Proposed deliverables

- signed/dev-testable Windows build;
- signed/dev-testable macOS build where signing setup is available;
- 100–200 equation corpus;
- desktop alpha release notes;
- feedback form/process for 5–10 testers;
- benchmark comparison against Phase 0.

## Quality gates

- no known data-loss bug;
- no release-blocking Vietnamese IME bug;
- crash recovery works for current draft;
- editor navigation/undo stable for supported structures;
- export golden tests pass;
- p95 typing performance measured;
- startup/memory regression reviewed.

## UX acceptance

A new user should be able to:

1. open VietMath;
2. create a fraction/root/matrix without knowing LaTeX;
3. type Vietnamese text in a cases expression;
4. find a symbol using Vietnamese search;
5. copy/save a usable output;
6. reopen a recent formula.

## Risks to re-evaluate after Phase 0

- panel/layout behavior in WebView;
- font consistency across OSes;
- package size;
- MathLive customization depth;
- clipboard divergence between Windows/macOS.

## Before implementation

Convert this brief into a detailed task plan using the actual APIs/file structure chosen by the Phase 0 ADRs.
