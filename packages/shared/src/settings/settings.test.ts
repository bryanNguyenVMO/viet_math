import { describe, expect, it } from "vitest";

import {
  DEFAULT_APP_SETTINGS,
  normalizeAppSettings,
  resolveTheme,
} from "./settings";

describe("VietMath app settings", () => {
  it("falls back safely when persisted settings are invalid", () => {
    expect(normalizeAppSettings("{bad json")).toEqual(DEFAULT_APP_SETTINGS);
    expect(
      normalizeAppSettings(JSON.stringify({
        theme: "unknown",
        locale: "xx",
        exportScale: 99,
        exportBackground: "purple",
      })),
    ).toEqual(DEFAULT_APP_SETTINGS);
  });

  it("preserves valid user preferences without coupling export color to theme", () => {
    const settings = normalizeAppSettings(JSON.stringify({
      theme: "dark",
      locale: "en",
      exportScale: 4,
      exportBackground: "transparent",
    }));

    expect(settings.theme).toBe("dark");
    expect(settings.locale).toBe("en");
    expect(settings.exportScale).toBe(4);
    expect(settings.exportBackground).toBe("transparent");
    expect(settings.editorFontSize).toBe(DEFAULT_APP_SETTINGS.editorFontSize);
    expect(settings.autosaveDelay).toBe(DEFAULT_APP_SETTINGS.autosaveDelay);
    expect(settings.recentLimit).toBe(DEFAULT_APP_SETTINGS.recentLimit);
  });

  it("migrates old partial settings without discarding valid preferences", () => {
    const settings = normalizeAppSettings(JSON.stringify({
      theme: "light",
      locale: "vi",
      exportScale: 1,
      exportBackground: "white",
    }));

    expect(settings).toEqual({
      ...DEFAULT_APP_SETTINGS,
      theme: "light",
      locale: "vi",
      exportScale: 1,
      exportBackground: "white",
    });
  });

  it("resolves system theme only from the OS preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });
});
