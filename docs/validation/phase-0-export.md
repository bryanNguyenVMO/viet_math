# Phase 0 — Export Validation

> Status: Pipeline contract implemented; MathML path validated in CI; SVG/PNG visual fidelity still requires a renderer decision.

## Validated now

### LaTeX

The canonical LaTeX string can be exported without algebraic reordering.

### MathML

The desktop spike uses MathLive 0.110 SSR conversion through a `MathLiveExportBackend`.

CI verifies a fraction produces a MathML `<math>` tree containing `<mfrac>`.

### Failure contract

Export failures return an explicit result:

```ts
{ ok: false, code, message }
```

No exporter is allowed to silently remove unsupported content.

## SVG spike finding

The current dependency set can produce static MathLive HTML markup, but MathLive does not provide a self-contained SVG exporter.

A generic `buildForeignObjectSvg()` spike exists to prove the pipeline boundary. It embeds rendered HTML inside SVG `foreignObject`.

This is **not approved as the production Office SVG strategy** because:

- foreignObject interoperability varies by target;
- MathLive static markup depends on CSS/font resources;
- bounding boxes must be measured in a real browser/WebView;
- Office fidelity cannot be assumed.

## PNG spike finding

PNG is modeled as SVG → rasterizer.

The core pipeline is renderer-independent, but no production rasterizer is considered validated until the SVG source is self-contained and its bounds are proven on Windows/macOS.

## Architecture recommendation

Before Desktop Alpha export is locked, validate a renderer capable of self-contained SVG (MathJax is the leading candidate from the architecture spec).

The export package boundary should remain independent of MathJax so the renderer can be replaced without changing consumer APIs.

## Corpus

`tests/corpus/phase-0-equations.json` contains 50 representative fixtures including:

- nested fractions/radicals;
- large operators;
- matrices;
- cases;
- Vietnamese text.

## Current gate

- LaTeX: PASS for pipeline.
- MathML: PASS for Phase 0 automated conversion.
- SVG: PARTIAL — API boundary proven, visual fidelity not passed.
- PNG: PARTIAL — rasterization boundary proven, visual fidelity not passed.
