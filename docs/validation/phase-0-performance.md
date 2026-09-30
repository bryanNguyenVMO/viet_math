# Phase 0 — Performance and Footprint Benchmark

> Status: CI footprint/build measurements recorded. Interactive startup, RAM, and input-latency measurements remain a real-machine gate.
>
> Recorded: 2026-09-30

## 1. Evidence source

The latest fully completed cross-platform reference used for the measurements below is:

- Commit: `88f2eac13a33726345e51980d01e1032826f592e`
- GitHub Actions run: `36679750214`
- Workflow: `.github/workflows/phase0-desktop.yml`

That commit already includes:

- Tauri 2 shell;
- React/TypeScript/Vite;
- MathLive editor integration;
- equation model;
- IME guard;
- export spike;
- clipboard spike;
- Word OOXML/OMML package code.

The Office packages are not bundled into the desktop runtime unless imported by the desktop app.

## 2. Web bundle

Vite production build on the Ubuntu test runner reported:

- JavaScript: **1,050.47 kB minified**
- JavaScript gzip: **299.61 kB**
- CSS: **20.67 kB**
- CSS gzip: **7.82 kB**
- Vite build time: **3.69 s**

The build also includes the MathLive/KaTeX font assets required by the current editor dependency.

### Finding

Vite emits a warning because the main JavaScript chunk is larger than 500 kB after minification.

This is not a Phase 0 blocker, but it is a clear Phase 1 optimization target.

Likely follow-up work:

- lazy-load export-only modules;
- keep MathJax out of startup if adopted for SVG;
- split non-editor panels/settings from the initial chunk where useful;
- measure whether MathLive can be isolated without delaying first editable paint.

## 3. Tauri debug binary footprint

### Windows

GitHub-hosted Windows runner:

- Tauri debug binary: **13,196,288 bytes**
- Approximately **12.58 MiB**
- Clean Rust debug build observed: approximately **2m 50s**

### macOS

GitHub-hosted macOS runner:

- Tauri debug binary: **28,553,928 bytes**
- Approximately **27.23 MiB**
- Clean Rust debug build observed: approximately **1m 38s**

These are **debug binaries**, not signed release bundles or installer sizes.

They must not be compared directly with the product's release-installer target.

## 4. Build pipeline timing

Reference run:

| Job | Observed wall time |
|---|---:|
| Shared test/build job | ~21 s |
| Windows desktop-build job | ~3m 40s |
| macOS desktop-build job | ~2m 11s |

Rust compilation dominates a cold desktop CI build.

This affects CI speed, not end-user runtime performance.

## 5. Product performance targets

The product specification currently targets:

| Metric | Design target |
|---|---:|
| Cold start to editable | <= 2 s p95 |
| Warm show/reopen | <= 300 ms |
| Common typing latency | <= 30 ms p95 |
| Idle memory | <= 150 MB |
| Typical editing memory | <= 250 MB |
| Installer without large bundled runtime | target <= 50 MB |

These remain **targets**, not measured achievements.

## 6. Why CI cannot close the runtime-performance gate

GitHub-hosted build runners prove:

- code compiles;
- tests pass;
- both desktop targets produce binaries;
- artifact footprint is measurable.

They do not provide a representative interactive desktop session for:

- cold launch to first editable cursor;
- warm window show;
- WebView process RAM;
- keyboard-to-editor latency;
- real IME latency;
- sustained editing memory.

Publishing those values from hosted CI would create false precision.

## 7. Required reference-machine protocol

Before Phase 0 can be closed as a full runtime benchmark, run the following on real machines.

### Windows reference profile

Record before testing:

- Windows version/build;
- CPU model and core count;
- RAM;
- SSD type;
- WebView2 runtime version;
- display scaling;
- power mode.

Minimum representative profile should include a mainstream **4-core / 8 GB RAM / SSD** machine, not only a high-end development workstation.

### macOS reference profile

Record before testing:

- macOS version;
- Mac model;
- Apple Silicon generation;
- RAM;
- display scaling.

Minimum representative profile should include an **Apple Silicon / 8 GB RAM** machine.

## 8. Manual measurement protocol

### Cold start

1. Reboot or ensure VietMath/WebView processes are not resident.
2. Launch the packaged app 10 times.
3. Measure from process launch to editor accepting input.
4. Record all samples and p50/p95.

### Warm show/reopen

1. Keep the process resident.
2. Hide/close the window according to the production lifecycle.
3. Reopen/show 20 times.
4. Record p50/p95.

### Memory

Record:

- idle after 30 seconds;
- simple equation editing;
- complex nested equation;
- 10x10 matrix;
- after 10 minutes of editing;
- after repeated open/close cycles.

Include child WebView processes in the total.

### Input responsiveness

Use at least:

- simple expression;
- ~100-token expression;
- deeply nested fraction/radical;
- 10x10 matrix;
- Vietnamese text composition.

Measure event-to-render/settled-state latency where instrumentation permits and record p50/p95.

## 9. Phase 0 performance ruling

### Build/footprint viability

**PASS WITH LIMITATIONS.**

The current Tauri architecture produces Windows/macOS debug binaries well below the product's 50 MB release-installer design target in raw debug-binary size, but installer size has not been measured and must not be inferred from this value.

### Runtime performance

**PENDING MANUAL MEASUREMENT.**

No claim is made yet for:

- cold-start target;
- warm-reopen target;
- RAM targets;
- input-latency target.

## 10. Phase 1 performance priorities

If Phase 0 architecture is retained:

1. split the >1 MB main JavaScript chunk where it improves startup;
2. keep export-only renderer code lazy;
3. instrument first-editable timing;
4. instrument editor input latency;
5. measure total process-tree memory;
6. benchmark release builds rather than debug binaries;
7. record signed installer sizes on both platforms.
