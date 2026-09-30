# Phase 0 — Desktop Shell Baseline

> Task 1 status: **PASS**  
> Recorded: 2026-09-30  
> GitHub Actions run: 36670215197

## What was validated

- pnpm workspace bootstraps from a committed lockfile with frozen install.
- React + TypeScript + Vite web assets build successfully.
- Minimal VietMath shell contains the four required productivity regions:
  - toolbar;
  - formula library;
  - equation editor workspace;
  - symbol palette.
- Tauri 2 debug binary builds successfully on:
  - macOS GitHub-hosted runner;
  - Windows GitHub-hosted runner.
- Tauri's platform icon requirements are now represented by:
  - `src-tauri/icons/icon.png`;
  - `src-tauri/icons/icon.ico`.

## Verification evidence

### Shared tests/build

GitHub Actions test job:

- `pnpm install --frozen-lockfile`: PASS
- `pnpm test`: PASS — 1/1 shell contract test
- `pnpm build`: PASS

### macOS

- Tauri debug build: PASS
- Clean CI Rust build time observed: about 1m 08s
- Debug binary size: **28,058,568 bytes** (~26.8 MiB)

### Windows

- Tauri debug build: PASS
- Clean CI Rust build time observed: about 2m 40s
- Debug binary size: **12,698,112 bytes** (~12.1 MiB)

These are unoptimized debug binaries, not installer sizes and not release-size targets.

## Issues found and resolved

1. Initial CI used package-manager cache before a lockfile existed.
   - Fixed bootstrap workflow and committed the generated lockfile.
2. Initial TypeScript project-reference configuration was invalid for the chosen no-emit setup.
   - Simplified the spike config to a single no-emit typecheck.
3. Tauri requires platform icon resources during build.
   - Added PNG and ICO placeholder icons.

## Ruling: runtime performance measurement

The Task 1 plan originally requested cold start, warm reopen, and idle RAM measurements.

**Decision:** Do not claim those metrics from GitHub-hosted runners. Defer interactive runtime measurement to **Task 9 — Performance and footprint benchmark**, on defined Windows/macOS reference machines.

**Reason:** Hosted CI validates compilation and binary footprint, but its virtualized hardware and non-interactive session do not provide representative desktop startup/RAM measurements.

**Cost if wrong:** A desktop performance issue could remain undetected until Task 9. This is acceptable because Task 1's purpose is shell viability, and no release/performance claim is being made yet.

## Task 1 conclusion

Tauri 2 remains a viable desktop-shell candidate. No build-level Windows/macOS blocker has been found at this stage.

The shell is intentionally not production UI. MathLive integration begins in a later editor spike.
