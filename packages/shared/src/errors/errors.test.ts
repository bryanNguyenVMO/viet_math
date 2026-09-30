import { describe, expect, it } from "vitest";

import {
  createUserError,
  errorMessage,
  type UserErrorCode,
} from "./errors";

describe("VietMath user errors", () => {
  it.each([
    ["INVALID_DRAFT", "Công thức chưa hoàn chỉnh."],
    ["UNSUPPORTED_EXPORT", "Định dạng xuất chưa hỗ trợ công thức này."],
    ["CLIPBOARD_FAILED", "Không thể sao chép vào clipboard."],
    ["STORAGE_FAILED", "Không thể lưu dữ liệu cục bộ."],
    ["RECOVERY_FAILED", "Không thể khôi phục bản nháp."],
  ] as Array<[UserErrorCode, string]>)("maps %s to safe Vietnamese copy", (code, expected) => {
    expect(errorMessage(createUserError(code, new Error("secret stack content")), "vi")).toBe(expected);
  });

  it("never exposes raw Error messages through the normal user copy", () => {
    const error = createUserError("STORAGE_FAILED", new Error("SQLITE_CORRUPT at /private/path"));
    expect(errorMessage(error, "en")).toBe("Could not save local data.");
    expect(errorMessage(error, "en")).not.toContain("SQLITE_CORRUPT");
  });
});
