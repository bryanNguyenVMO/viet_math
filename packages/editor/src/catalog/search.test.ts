import { describe, expect, it } from "vitest";

import { MATH_CATALOG } from "./items";
import { searchMathCatalog } from "./search";

describe("math catalog search", () => {
  it.each(["phân số", "phan so", "fraction", "frac"])(
    "finds fraction by alias %s",
    (query) => {
      const result = searchMathCatalog(query);
      expect(result[0]?.id).toBe("fraction");
      expect(result[0]?.latex).toContain("\\frac");
    },
  );

  it("finds integral by Vietnamese and LaTeX-style aliases", () => {
    expect(searchMathCatalog("tích phân")[0]?.id).toBe("integral");
    expect(searchMathCatalog("int")[0]?.id).toBe("integral");
  });

  it.each([
    ["căn bậc n", "nth-root"],
    ["dao ham", "derivative"],
    ["định thức", "determinant"],
    ["vector", "vector-structure"],
    ["forall", "forall"],
    ["vuong goc", "perpendicular"],
    ["sine", "sin"],
    ["overline", "overline"],
  ])("finds expanded catalog query %s", (query, expectedId) => {
    expect(searchMathCatalog(query)[0]?.id).toBe(expectedId);
  });

  it("ships a broad initial catalog instead of a tiny demo palette", () => {
    expect(MATH_CATALOG.length).toBeGreaterThanOrEqual(70);
    expect(new Set(MATH_CATALOG.map((item) => item.category)).size).toBe(11);
  });
});
