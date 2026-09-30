import { describe, expect, it } from "vitest";

import {
  deserializeEquation,
  serializeEquation,
  type EquationDocument,
} from "./index";

describe("EquationDocument serialization", () => {
  it("round-trips the canonical equation document exactly", () => {
    const doc: EquationDocument = {
      schemaVersion: 1,
      latex: String.raw`\frac{a+b}{c+d}`,
      displayMode: "block",
      style: {
        fontSize: 18,
        color: "#0f172a",
      },
    };

    expect(deserializeEquation(serializeEquation(doc))).toEqual(doc);
  });

  it("preserves an incomplete draft separately from the last valid LaTeX", () => {
    const doc: EquationDocument = {
      schemaVersion: 1,
      latex: String.raw`\frac{a}{b}`,
      draftLatex: String.raw`\frac{a}{`,
      displayMode: "inline",
      style: {},
    };

    const restored = deserializeEquation(serializeEquation(doc));

    expect(restored.latex).toBe(String.raw`\frac{a}{b}`);
    expect(restored.draftLatex).toBe(String.raw`\frac{a}{`);
  });

  it("rejects a document with an unsupported schema version", () => {
    const raw = JSON.stringify({
      schemaVersion: 2,
      latex: "x",
      displayMode: "inline",
      style: {},
    });

    expect(() => deserializeEquation(raw)).toThrow(/schema version/i);
  });
});
