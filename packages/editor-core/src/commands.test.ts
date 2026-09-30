import { describe, expect, it } from "vitest";

import { STRUCTURE_TEMPLATES } from "./index";

describe("STRUCTURE_TEMPLATES", () => {
  it("uses MathLive placeholders so insertion selects an editable slot", () => {
    expect(STRUCTURE_TEMPLATES.fraction).toBe(String.raw`\frac{#0}{#?}`);
    expect(STRUCTURE_TEMPLATES.squareRoot).toBe(String.raw`\sqrt{#0}`);
    expect(STRUCTURE_TEMPLATES.superscript).toBe(String.raw`#@^{#?}`);
    expect(STRUCTURE_TEMPLATES.integral).toContain("#?");
    expect(STRUCTURE_TEMPLATES.summation).toContain("#?");
  });

  it("creates editable matrix and cases templates", () => {
    expect(STRUCTURE_TEMPLATES.matrix).toContain("#0");
    expect(STRUCTURE_TEMPLATES.matrix).toContain("#?");
    expect(STRUCTURE_TEMPLATES.cases).toContain("#0");
    expect(STRUCTURE_TEMPLATES.cases).toContain("#?");
  });
});
