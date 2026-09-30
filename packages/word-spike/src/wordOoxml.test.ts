import { describe, expect, it } from "vitest";

import {
  buildFractionOmml,
  buildMatrixOmml,
  buildRadicalOmml,
  buildWordOoxmlPackage,
  decodeWordMetadataTag,
  encodeWordMetadataTag,
  type WordEquationMetadata,
} from "./index";

const metadata: WordEquationMetadata = {
  id: "eq-001",
  schemaVersion: 1,
  latex: String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`,
  revision: 1,
};

describe("Word Phase 0 OOXML spike", () => {
  it("encodes and recovers VietMath source metadata", () => {
    const tag = encodeWordMetadataTag(metadata);

    expect(tag.startsWith("vietmath:")).toBe(true);
    expect(decodeWordMetadataTag(tag)).toEqual(metadata);
  });

  it("builds native OMML for a fraction and radical", () => {
    const radical = buildRadicalOmml("b");
    const fraction = buildFractionOmml("a", radical);

    expect(radical).toContain("<m:rad>");
    expect(fraction).toContain("<m:f>");
    expect(fraction).toContain("<m:num>");
    expect(fraction).toContain("<m:den>");
  });

  it("builds a native OMML matrix", () => {
    const matrix = buildMatrixOmml([
      ["a", "b"],
      ["c", "d"],
    ]);

    expect(matrix).toContain("<m:m>");
    expect(matrix.match(/<m:mr>/g)).toHaveLength(2);
    expect(matrix.match(/<m:e>/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it("wraps OMML and metadata into an insertOoxml-compatible package", () => {
    const ooxml = buildWordOoxmlPackage(
      buildFractionOmml("a", "b"),
      metadata,
    );

    expect(ooxml).toContain("<pkg:package");
    expect(ooxml).toContain("word/document.xml");
    expect(ooxml).toContain("<m:oMath>");
    expect(ooxml).toContain("<w:sdt>");
    expect(ooxml).toContain("vietmath:");
    expect(ooxml).toContain("http://schemas.openxmlformats.org/officeDocument/2006/math");
  });

  it("escapes text used inside OMML runs", () => {
    const ooxml = buildWordOoxmlPackage(
      buildFractionOmml("a&b", "<x>"),
      metadata,
    );

    expect(ooxml).toContain("a&amp;b");
    expect(ooxml).toContain("&lt;x&gt;");
  });
});
