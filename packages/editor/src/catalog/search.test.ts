import { describe, expect, it } from "vitest";

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
});
