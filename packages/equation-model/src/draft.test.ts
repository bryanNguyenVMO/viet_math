import { describe, expect, it } from "vitest";

import {
  commitEquationLatex,
  stageEquationDraft,
  type EquationDocument,
} from "./index";

const baseDocument: EquationDocument = {
  schemaVersion: 1,
  latex: String.raw`\frac{a}{b}`,
  displayMode: "block",
  style: {},
};

describe("equation draft lifecycle", () => {
  it("preserves the last valid latex while an incomplete draft is staged", () => {
    const staged = stageEquationDraft(baseDocument, String.raw`\frac{`);

    expect(staged.latex).toBe(String.raw`\frac{a}{b}`);
    expect(staged.draftLatex).toBe(String.raw`\frac{`);
  });

  it("commits a validated latex value and clears the draft", () => {
    const staged = stageEquationDraft(baseDocument, String.raw`\sqrt{x}`);
    const committed = commitEquationLatex(staged, String.raw`\sqrt{x}`);

    expect(committed.latex).toBe(String.raw`\sqrt{x}`);
    expect(committed.draftLatex).toBeUndefined();
  });
});
