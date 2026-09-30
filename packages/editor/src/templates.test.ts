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
  });
});
