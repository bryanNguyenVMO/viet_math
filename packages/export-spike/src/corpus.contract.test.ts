import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const corpusPath = fileURLToPath(
  new URL("../../../tests/corpus/phase-0-equations.json", import.meta.url),
);

describe("Phase 0 equation corpus", () => {
  it("contains at least 50 representative equations including Vietnamese and nested structures", () => {
    const corpus = JSON.parse(readFileSync(corpusPath, "utf8")) as Array<{
      id: string;
      latex: string;
      tags: string[];
    }>;

    expect(corpus.length).toBeGreaterThanOrEqual(50);
    expect(corpus.some((item) => item.tags.includes("vietnamese"))).toBe(true);
    expect(corpus.some((item) => item.tags.includes("matrix"))).toBe(true);
    expect(corpus.some((item) => item.tags.includes("nested"))).toBe(true);
  });
});
