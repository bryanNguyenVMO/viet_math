export type AppTheme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type ExportScale = 1 | 2 | 4;
export type ExportBackground = "transparent" | "white";
export type AppLocale = "vi" | "en";
export type EditorFontSize = 28 | 32 | 36 | 40 | 44;
export type AutosaveDelay = 150 | 300 | 500 | 1000;
export type RecentLimit = 10 | 20 | 50;
export type QuickEditorShortcut =
  | "CmdOrCtrl+Shift+M"
  | "CmdOrCtrl+Shift+E"
  | "CmdOrCtrl+Alt+M"
  | "CmdOrCtrl+Alt+E";

export type AppSettings = {
  theme: AppTheme;
  locale: AppLocale;
  exportScale: ExportScale;
  exportBackground: ExportBackground;
  editorFontSize: EditorFontSize;
  autosaveDelay: AutosaveDelay;
  recentLimit: RecentLimit;
  quickEditorShortcut: QuickEditorShortcut;
};

export const SETTINGS_KEY = "app-settings";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: "system",
  locale: "vi",
  exportScale: 2,
  exportBackground: "transparent",
  editorFontSize: 36,
  autosaveDelay: 300,
  recentLimit: 20,
  quickEditorShortcut: "CmdOrCtrl+Shift+M",
};

function isTheme(value: unknown): value is AppTheme {
  return value === "light" || value === "dark" || value === "system";
}

function isLocale(value: unknown): value is AppLocale {
  return value === "vi" || value === "en";
}

function isExportScale(value: unknown): value is ExportScale {
  return value === 1 || value === 2 || value === 4;
}

function isExportBackground(value: unknown): value is ExportBackground {
  return value === "transparent" || value === "white";
}

function isEditorFontSize(value: unknown): value is EditorFontSize {
  return value === 28 || value === 32 || value === 36 || value === 40 || value === 44;
}

function isAutosaveDelay(value: unknown): value is AutosaveDelay {
  return value === 150 || value === 300 || value === 500 || value === 1000;
}

function isRecentLimit(value: unknown): value is RecentLimit {
  return value === 10 || value === 20 || value === 50;
}

function isQuickEditorShortcut(value: unknown): value is QuickEditorShortcut {
  return (
    value === "CmdOrCtrl+Shift+M" ||
    value === "CmdOrCtrl+Shift+E" ||
    value === "CmdOrCtrl+Alt+M" ||
    value === "CmdOrCtrl+Alt+E"
  );
}

export function normalizeAppSettings(raw: string | null | undefined): AppSettings {
  if (!raw) return { ...DEFAULT_APP_SETTINGS };

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_APP_SETTINGS };
    }

    const candidate = parsed as Partial<AppSettings>;
    return {
      theme: isTheme(candidate.theme) ? candidate.theme : DEFAULT_APP_SETTINGS.theme,
      locale: isLocale(candidate.locale) ? candidate.locale : DEFAULT_APP_SETTINGS.locale,
      exportScale: isExportScale(candidate.exportScale)
        ? candidate.exportScale
        : DEFAULT_APP_SETTINGS.exportScale,
      exportBackground: isExportBackground(candidate.exportBackground)
        ? candidate.exportBackground
        : DEFAULT_APP_SETTINGS.exportBackground,
      editorFontSize: isEditorFontSize(candidate.editorFontSize)
        ? candidate.editorFontSize
        : DEFAULT_APP_SETTINGS.editorFontSize,
      autosaveDelay: isAutosaveDelay(candidate.autosaveDelay)
        ? candidate.autosaveDelay
        : DEFAULT_APP_SETTINGS.autosaveDelay,
      recentLimit: isRecentLimit(candidate.recentLimit)
        ? candidate.recentLimit
        : DEFAULT_APP_SETTINGS.recentLimit,
      quickEditorShortcut: isQuickEditorShortcut(candidate.quickEditorShortcut)
        ? candidate.quickEditorShortcut
        : DEFAULT_APP_SETTINGS.quickEditorShortcut,
    };
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
