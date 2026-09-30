import { describe, expect, it } from "vitest";

import {
  buildForeignObjectSvg,
  exportLatex,
  exportMathMl,
  exportPng,
  type MathExportBackend,
  type SvgRasterizer,
} from "./index";

const backend: MathExportBackend = {
  toMathMl: (latex) => `<math><mtext>${latex}</mtext></math>`,
  toMarkup: (latex) => `<span class="math">${latex}</span>`,
};

describe("Phase 0 export pipeline", () => {
  it("preserves supported LaTeX as the canonical text export", () => {
    expect(exportLatex(String.raw`\frac{a}{b}`)).toEqual({
      ok: true,
      data: String.raw`\frac{a}{b}`,
    });
  });

  it("converts LaTeX to MathML through an explicit backend", () => {
    const result = exportMathMl(String.raw`x^2`, backend);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toContain("<math");
  });

  it("wraps rendered markup in an explicitly sized SVG document", () => {
    const svg = buildForeignObjectSvg(
      '<span class="math">x²</span>',
      { width: 320, height: 96 },
    );

    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="96"');
    expect(svg).toContain("<foreignObject");
    expect(svg).toContain('xmlns="http://www.w3.org/1999/xhtml"');
  });

  it("delegates PNG rasterization and returns bytes", async () => {
    const expected = new Uint8Array([137, 80, 78, 71]);
    const rasterizer: SvgRasterizer = {
      rasterize: async () => expected,
    };

    const result = await exportPng("<svg />", rasterizer);

    expect(result).toEqual({ ok: true, data: expected });
  });

  it("returns an explicit error instead of silently dropping failed output", () => {
    const broken: MathExportBackend = {
      toMathMl: () => {
        throw new Error("unsupported");
      },
      toMarkup: backend.toMarkup,
    };

    expect(exportMathMl(String.raw`\unknowncommand{x}`, broken)).toEqual({
      ok: false,
      code: "MATHML_EXPORT_FAILED",
      message: "unsupported",
    });
  });
});
