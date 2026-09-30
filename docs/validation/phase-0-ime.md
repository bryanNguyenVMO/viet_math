# Phase 0 — Vietnamese IME Validation

> Status: Automated guard implemented; real OS/IME validation pending.

## What is automated

VietMath now owns an `ImeCompositionGuard` in `@vietmath/editor-core`.

The guard has two responsibilities:

1. Track `compositionstart` / `compositionend`.
2. Refuse app-level keyboard commands when either the guard or `KeyboardEvent.isComposing` says composition is active.

The MathLive desktop spike wires the guard at the mathfield boundary and exposes a `data-ime-composing` state for debugging the spike.

Automated tests cover:

- normal keyboard commands are allowed outside composition;
- app commands are suppressed during composition;
- a missed `compositionstart` is still protected by `KeyboardEvent.isComposing`;
- the MathLive integration registers composition start/end listeners.

## What cannot be proven in CI

GitHub Actions can compile Windows/macOS binaries, but it cannot reproduce interactive UniKey/EVKey/macOS Vietnamese input behavior inside WebView2/WKWebView.

Therefore Phase 0 IME is **not considered fully passed** until the manual matrix in `tests/editor/ime-cases.md` is executed on real Windows and macOS machines.

## Release blocker rule

Any reproducible lost-diacritic, cursor-jump, premature shortcut, or corrupted undo behavior during Vietnamese composition is a blocker for Desktop Alpha.
