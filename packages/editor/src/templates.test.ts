import { describe, expect, it } from "vitest";

import { STRUCTURE_TEMPLATES } from "./templates";

describe("production structure templates", () => {
  it("keeps the common structures editable with MathLive placeholders", () => {
    expect(STRUCTURE_TEMPLATES.fraction).toBe(String.raw`\frac{#0}{#?}`);
    expect(STRUCTURE_TEMPLATES.squareRoot).toBe(String.raw`\sqrt{#0}`);
    expect(STRUCTURE_TEMPLATES.superscript).toBe(String.raw`#@^{#?}`);
    expect(STRUCTURE_TEMPLATES.subscript).toBe(String.raw`#@_{#?}`);
    expect(STRUCTURE_TEMPLATES.integral).toContain("#?");
    expect(STRUCTURE_TEMPLATES.summation).toContain("#?");
    expect(STRUCTURE_TEMPLATES.limit).toContain("#?");
    expect(STRUCTURE_TEMPLATES.matrix).toContain("#0");
    expect(STRUCTURE_TEMPLATES.cases).toContain("#0");
    expect(STRUCTURE_TEMPLATES.nthRoot).toContain("\\sqrt[");
    expect(STRUCTURE_TEMPLATES.product).toContain("\\prod");
    expect(STRUCTURE_TEMPLATES.derivative).toContain("d#?");
    expect(STRUCTURE_TEMPLATES.partialDerivative).toContain("\\partial");
    expect(STRUCTURE_TEMPLATES.determinant).toContain("vmatrix");
    expect(STRUCTURE_TEMPLATES.binomial).toContain("\\binom");
    expect(STRUCTURE_TEMPLATES.vector).toContain("\\vec");
  });
});
