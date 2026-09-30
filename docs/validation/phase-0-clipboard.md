# Phase 0 — Clipboard Validation

> Status: Clipboard abstraction implemented; native cross-app interoperability is a manual validation gate.

## Implemented contract

VietMath exposes separate operations:

- Copy LaTeX → `text/plain`-style text through `writeText`.
- Copy PNG → `image/png`.
- Copy SVG → `image/svg+xml`.

The core `ClipboardService` is platform-independent and returns a typed error instead of claiming a write succeeded.

The desktop spike includes `BrowserClipboardPort`, which uses the Web Clipboard API available inside the Tauri WebView.

## Why actions stay explicit

A browser/WebView clipboard does not guarantee that every native recipient interprets all MIME flavors.

Therefore the UX must not promise that one generic Copy action always pastes as an editable equation everywhere.

Initial UI should keep explicit actions such as:

- Copy LaTeX
- Copy Image
- Save SVG
- Insert into Word

## Manual matrix still required

On Windows and macOS, verify paste into:

- Microsoft Word;
- Microsoft PowerPoint;
- a browser text field;
- a basic image application/editor.

Record:

- whether text arrives unchanged;
- whether PNG is accepted;
- whether SVG MIME is accepted or rejected;
- whether the recipient transforms the data.

## Current gate

- Clipboard service behavior: PASS in automated tests.
- Browser/WebView API compile path: implemented.
- Windows native interoperability: PENDING manual validation.
- macOS native interoperability: PENDING manual validation.

If rich clipboard support is inconsistent, the production desktop app should use a Tauri/native clipboard plugin behind the same `ClipboardPort` interface rather than changing feature code.
