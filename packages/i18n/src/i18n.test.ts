import { describe, expect, it } from "vitest";

import { createTranslator, type Locale } from "./index";

describe("VietMath i18n", () => {
  it("translates core UI strings in Vietnamese and English", () => {
    const vi = createTranslator("vi");
    const en = createTranslator("en");

    expect(vi.t("app.title")).toBe("VietMath");
    expect(vi.t("editor.visual")).toBe("Soạn thảo");
    expect(vi.t("actions.copy")).toBe("Sao chép");

    expect(en.t("app.title")).toBe("VietMath");
    expect(en.t("editor.visual")).toBe("Visual");
    expect(en.t("actions.copy")).toBe("Copy");
  });

  it("falls back to Vietnamese for unsupported locales", () => {
    const locale = "ja" as Locale;
    const translator = createTranslator(locale);

    expect(translator.locale).toBe("vi");
    expect(translator.t("symbols.searchPlaceholder")).toContain("Tìm");
  });

  it("returns the key when a translation is missing in every locale", () => {
    const translator = createTranslator("en");
    expect(translator.t("missing.key" as never)).toBe("missing.key");
  });
});
