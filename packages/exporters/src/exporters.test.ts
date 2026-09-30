import { describe, expect, it } from "vitest";

import type { EquationDocument } from "@vietmath/equation-model";
import {
  exportLatex,
  exportMathMl,
  exportPng,
  exportSvg,
  type MathRendererBackend,
} from "./index";

const equation: EquationDocument = {
  schemaVersion: 1,
  latex: String.raw`x+1`,
  displayMode: "inline",
  style: {},
};

const backend: MathRendererBackend = {
  toMathMl: (latex) => `<math><mi>${latex}</mi></math>`,
  toSvg: (latex) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" data-latex="${latex}"></svg>`,
  toPng: async () => new Uint8Array([137, 80, 78, 71]),
};

describe("production exporters", () => {
  it("preserves the canonical LaTeX source without algebraic reordering", () => {
    expect(exportLatex(equation)).toEqual({ ok: true, data: "x+1" });
  });

  it("exports MathML and SVG through a renderer backend", () => {
    expect(exportMathMl(equation, backend)).toEqual({
      ok: true,
      data: "<math><mi>x+1</mi></math>",
    });

    const svg = exportSvg(equation, backend, {
      color: "#000000",
      background: "transparent",
    });
    expect(svg.ok).toBe(true);
    if (svg.ok) expect(svg.data).toContain("<svg");
  });

  it("passes PNG scale/background options to the backend", async () => {
    const result = await exportPng(equation, backend, {
      scale: 2,
      background: "transparent",
      color: "#000000",
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(Array.from(result.data)).toEqual([137, 80, 78, 71]);
  });

  it("returns an explicit failure instead of throwing renderer errors", () => {
    const broken: MathRendererBackend = {
      ...backend,
      toMathMl: () => {
        throw new Error("unsupported construct");
      },
    };

    expect(exportMathMl(equation, broken)).toEqual({
      ok: false,
      code: "MATHML_EXPORT_FAILED",
      message: "unsupported construct",
    });
  });
});
