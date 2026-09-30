import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const corpusPath = fileURLToPath(
  new URL("../corpus/phase-1-equations.json", import.meta.url),
);

type Fixture = { id: string; latex: string; tags: string[] };

describe("Phase 1 equation corpus", () => {
  it("contains at least 120 unique representative equations", () => {
    expect(existsSync(corpusPath)).toBe(true);
    const fixtures = JSON.parse(readFileSync(corpusPath, "utf8")) as Fixture[];

    expect(fixtures.length).toBeGreaterThanOrEqual(120);
    expect(new Set(fixtures.map((fixture) => fixture.id)).size).toBe(fixtures.length);
    expect(fixtures.every((fixture) => fixture.latex.length > 0)).toBe(true);
  });

  it("covers the required Phase 1 categories", () => {
    const fixtures = JSON.parse(readFileSync(corpusPath, "utf8")) as Fixture[];
    const tags = new Set(fixtures.flatMap((fixture) => fixture.tags));

    for (const tag of [
      "algebra",
      "calculus",
      "matrix",
      "cases",
      "set",
      "geometry",
      "statistics",
      "vietnamese",
      "nested",
      "invalid-draft",
    ]) {
      expect(tags.has(tag), `missing corpus tag: ${tag}`).toBe(true);
    }
  });
});
