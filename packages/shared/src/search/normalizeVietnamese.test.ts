import { describe, expect, it } from "vitest";

import { normalizeVietnameseSearch } from "./normalizeVietnamese";

describe("normalizeVietnameseSearch", () => {
  it("normalizes Vietnamese diacritics and đ for search only", () => {
    expect(normalizeVietnameseSearch("  Phân Số  ")).toBe("phan so");
    expect(normalizeVietnameseSearch("Điều kiện")).toBe("dieu kien");
  });
});
