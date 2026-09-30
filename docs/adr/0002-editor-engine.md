# ADR 0002 — Interactive Equation Editor

> Status: Accepted provisionally  
> Date: 2026-09-30

## Context

VietMath needs a structured visual editor with cursor navigation, editable placeholders, matrices/cases, LaTeX import/export, and strong keyboard behavior.

The application must not couple the rest of the product directly to a third-party editor API.

## Decision

Use **MathLive** as the interactive editor engine behind a VietMath-owned `VietMathEditor` adapter.

The adapter owns the application-facing API:

- `getLatex()`;
- `setLatex()`;
- `insertLatex()`;
- `focus()`;
- `undo()`;
- `redo()`.

VietMath also owns its structure-template catalog and IME composition guard.

## Evidence

Automated tests validate:

- adapter read/write behavior;
- structure insertion with editable MathLive placeholders;
- fraction/root/script/integral/sum/limit/matrix/cases templates;
- undo/redo delegation;
- IME composition state suppressing app-level keyboard commands;
- desktop MathLive mount behind the adapter.

## Consequences

- MathLive is an implementation detail, not the canonical equation model.
- Export architecture remains separate.
- Any MathLive-specific workaround should stay inside the adapter/integration boundary.
- Vietnamese IME cannot be considered fully validated from CI alone.

## Remaining gate

Run the real IME matrix on:

- Windows UniKey Telex;
- Windows UniKey VNI;
- macOS Vietnamese input sources.

A repeatable text-corruption/cursor/shortcut blocker reopens this ADR.
