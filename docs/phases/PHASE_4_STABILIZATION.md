# Phase 4 — 1.0 Stabilization Brief

> Status: Brief; expand after Desktop/Word/PowerPoint beta scope is stable.  
> Updated: 2026-09-30

## Goal

Turn the proven VietMath feature set into a stable public 1.0 release with clear compatibility, distribution, performance, accessibility, and support expectations.

## Depends on

- Desktop Alpha architecture is production-ready.
- Word Beta reaches its supported round-trip goals.
- PowerPoint supported workflow reaches its exit criteria.
- Feature scope is frozen for 1.0.

## In scope

### Reliability

- bug burn-down;
- migration tests;
- crash recovery hardening;
- corrupted local-store recovery;
- Office failure recovery;
- no known critical data-loss issues.

### Equation coverage

- expand fixture corpus to 500+ representative equations;
- golden export coverage;
- Office conversion coverage for the advertised subset;
- Vietnamese text fixtures.

### Performance

- startup optimization;
- memory optimization;
- lazy loading;
- bundle analysis;
- export performance;
- large-library behavior.

### Distribution

Windows:
- installer;
- code signing;
- updater;
- uninstall/update validation.

macOS:
- app signing;
- notarization;
- updater;
- Intel/Apple Silicon strategy as decided by build pipeline.

### Accessibility

- keyboard-only baseline;
- visible focus;
- labels/tooltips;
- contrast;
- zoom;
- review math accessibility capabilities and document limitations.

### Localization

- full Vietnamese language review;
- English language review;
- missing-key checks;
- search aliases review;
- UI overflow checks.

### Documentation

- install guide;
- quick-start guide;
- keyboard shortcuts;
- Word/PowerPoint guide;
- supported formats;
- supported OS/Office versions;
- known limitations;
- privacy statement;
- troubleshooting.

## Release gates

VietMath 1.0 cannot ship with:

- known blocker/critical data-loss bug;
- release-blocking Vietnamese IME bug;
- document corruption bug in supported Office matrix;
- silent export/conversion loss;
- broken installer/update path.

Required evidence:

- 500+ corpus pass;
- supported Office lifecycle pass;
- export regression pass;
- migration pass;
- installer/update pass;
- performance regression review;
- privacy/known limitations published.

## Out of scope for 1.0 unless promoted earlier

- OCR;
- handwriting recognition;
- AI equation generation;
- cloud sync;
- team collaboration;
- full MathType legacy compatibility;
- mobile app;
- broad third-party office-suite integrations.

## Launch readiness

Before public 1.0, define:

- release channels;
- issue/reporting flow;
- crash/log collection policy;
- changelog format;
- support response expectations;
- rollback/update strategy.

## Before implementation

Turn this brief into a detailed stabilization plan using the real feature inventory and supported-platform matrix at beta freeze.
