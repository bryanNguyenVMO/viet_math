import { describe, expect, it } from "vitest";

import { MathLiveExportBackend } from "./MathLiveExportBackend";

describe("MathLiveExportBackend", () => {
  it("uses MathLive SSR conversion for MathML", () => {
    const backend = new MathLiveExportBackend();
    const mathml = backend.toMathMl(String.raw`\frac{a}{b}`);

    expect(mathml).toContain("<math");
    expect(mathml).toContain("<mfrac");
  });

  it("returns static markup for the SVG spike renderer", () => {
    const backend = new MathLiveExportBackend();
    const markup = backend.toMarkup(String.raw`\sqrt{x}`);

    expect(markup.length).toBeGreaterThan(20);
    expect(markup).toContain("ML__");
  });
});
