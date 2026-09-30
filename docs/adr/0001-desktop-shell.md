# ADR 0001 — Desktop Shell

> Status: Accepted provisionally  
> Date: 2026-09-30

## Context

VietMath needs a lightweight Windows/macOS desktop shell while sharing a React/TypeScript UI stack with Office-related surfaces.

The main alternative kept in reserve is Electron.

## Decision

Use **Tauri 2** as the VietMath desktop shell.

Keep the UI in React + TypeScript + Vite. Native capabilities should cross a narrow Tauri/Rust boundary rather than spreading platform code through feature components.

## Evidence

Phase 0 GitHub Actions has built the Tauri debug binary successfully on:

- Windows;
- macOS.

The shell is compatible with the current MathLive/editor bundle and shared automated suite.

Measured debug binary footprint from run `36679750214`:

- Windows: 13,196,288 bytes (~12.58 MiB);
- macOS: 28,553,928 bytes (~27.23 MiB).

These are not release installer sizes.

## Consequences

Positive:

- one shared web UI;
- no bundled Chromium requirement in the current architecture;
- narrow native integration point;
- current binary footprint does not force an architecture change.

Costs/risks:

- WebView2/WKWebView differences remain real;
- clipboard and IME must be validated on target machines;
- startup/RAM data is still missing.

## Revisit when

Switching shell should be reconsidered only if real-machine validation reveals a blocker in:

- Vietnamese IME;
- clipboard behavior;
- MathLive/WebView compatibility;
- performance/footprint;

and the workaround cost is greater than the cost of moving to another shell.
