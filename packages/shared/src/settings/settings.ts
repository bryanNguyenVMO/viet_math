export type AppTheme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type ExportScale = 1 | 2 | 4;
export type ExportBackground = "transparent" | "white";
export type AppLocale = "vi" | "en";

export type AppSettings = {
  theme: AppTheme;
  locale: AppLocale;
  exportScale: ExportScale;
  exportBackground: ExportBackground;
};

export const SETTINGS_KEY = "app-settings";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: "system",
  locale: "vi",
  exportScale: 2,
  exportBackground: "transparent",
};

function isAppSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppSettings>;

  return (
    (candidate.theme === "light" ||
      candidate.theme === "dark" ||
      candidate.theme === "system") &&
    (candidate.locale === "vi" || candidate.locale === "en") &&
    (candidate.exportScale === 1 ||
      candidate.exportScale === 2 ||
      candidate.exportScale === 4) &&
    (candidate.exportBackground === "transparent" ||
      candidate.exportBackground === "white")
  );
}

export function normalizeAppSettings(raw: string | null | undefined): AppSettings {
  if (!raw) return { ...DEFAULT_APP_SETTINGS };

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isAppSettings(parsed) ? parsed : { ...DEFAULT_APP_SETTINGS };
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export function resolveTheme(
  theme: AppTheme,
  prefersDark: boolean,
): ResolvedTheme {
  if (theme === "system") return prefersDark ? "dark" : "light";
  return theme;
}
