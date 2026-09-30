export type UserErrorCode =
  | "INVALID_DRAFT"
  | "UNSUPPORTED_EXPORT"
  | "CLIPBOARD_FAILED"
  | "STORAGE_FAILED"
  | "RECOVERY_FAILED";

export type UserError = {
  code: UserErrorCode;
  cause?: unknown;
};

const messages = {
  vi: {
    INVALID_DRAFT: "Công thức chưa hoàn chỉnh.",
    UNSUPPORTED_EXPORT: "Định dạng xuất chưa hỗ trợ công thức này.",
    CLIPBOARD_FAILED: "Không thể sao chép vào clipboard.",
    STORAGE_FAILED: "Không thể lưu dữ liệu cục bộ.",
    RECOVERY_FAILED: "Không thể khôi phục bản nháp.",
  },
  en: {
    INVALID_DRAFT: "The equation is incomplete.",
    UNSUPPORTED_EXPORT: "This export format does not support the equation.",
    CLIPBOARD_FAILED: "Could not copy to the clipboard.",
    STORAGE_FAILED: "Could not save local data.",
    RECOVERY_FAILED: "Could not recover the draft.",
  },
} satisfies Record<"vi" | "en", Record<UserErrorCode, string>>;

export function createUserError(code: UserErrorCode, cause?: unknown): UserError {
  return { code, cause };
}

export function errorMessage(error: UserError, locale: "vi" | "en"): string {
  return messages[locale][error.code];
}
