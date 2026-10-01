import { invoke } from "@tauri-apps/api/core";
import {
  SETTINGS_KEY,
  type AppSettings,
  type AppTheme,
  type AutosaveDelay,
  type EditorFontSize,
  type ExportBackground,
  type ExportScale,
  type QuickEditorShortcut,
  type RecentLimit,
} from "@vietmath/shared";
import type { SettingsRepository } from "@vietmath/storage";
import { createTranslator, type Locale } from "@vietmath/i18n";
import { useEffect, useState } from "react";

type SettingsDialogProps = {
  open: boolean;
  storage: SettingsRepository;
  settings: AppSettings;
  locale: Locale;
  onClose: () => void;
  onSaved: (settings: AppSettings) => void;
};

export function SettingsDialog({
  open,
  storage,
  settings,
  locale,
  onClose,
  onSaved,
}: SettingsDialogProps) {
  const [draft, setDraft] = useState(settings);
  const [saveError, setSaveError] = useState("");
  const { t } = createTranslator(locale);

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setSaveError("");
    }
  }, [open, settings]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const save = async () => {
    const shortcutChanged =
      draft.quickEditorShortcut !== settings.quickEditorShortcut;

    try {
      if (shortcutChanged) {
        await invoke("set_quick_editor_shortcut", {
          previousShortcut: settings.quickEditorShortcut,
          shortcut: draft.quickEditorShortcut,
        });
      }

      await storage.set(SETTINGS_KEY, JSON.stringify(draft));
      onSaved(draft);
      onClose();
    } catch {
      if (shortcutChanged) {
        try {
          await invoke("set_quick_editor_shortcut", {
            previousShortcut: draft.quickEditorShortcut,
            shortcut: settings.quickEditorShortcut,
          });
        } catch {
          // Keep the dialog open and let the user choose another shortcut.
        }
      }
      setSaveError(t("settings.shortcutFailed"));
    }
  };

  return (
    <div className="vm-settings-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="vm-settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("settings.title")}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="vm-settings-header">
          <h2>{t("settings.title")}</h2>
          <button type="button" aria-label={t("settings.cancel")} onClick={onClose}>×</button>
        </header>

        <div className="vm-settings-form">
          <h3>{t("settings.appearanceSection")}</h3>
          <label>
            <span>{t("settings.theme")}</span>
            <select
              value={draft.theme}
              onChange={(event) =>
                setDraft((current) => ({ ...current, theme: event.target.value as AppTheme }))
              }
            >
              <option value="system">{t("settings.themeSystem")}</option>
              <option value="light">{t("settings.themeLight")}</option>
              <option value="dark">{t("settings.themeDark")}</option>
            </select>
          </label>

          <label>
            <span>{t("settings.language")}</span>
            <select
              value={draft.locale}
              onChange={(event) =>
                setDraft((current) => ({ ...current, locale: event.target.value as "vi" | "en" }))
              }
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </label>

          <h3>{t("settings.editorSection")}</h3>
          <label>
            <span>{t("settings.editorFontSize")}</span>
            <select
              value={draft.editorFontSize}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  editorFontSize: Number(event.target.value) as EditorFontSize,
                }))
              }
            >
              <option value={28}>28 px</option>
              <option value={32}>32 px</option>
              <option value={36}>36 px</option>
              <option value={40}>40 px</option>
              <option value={44}>44 px</option>
            </select>
          </label>

          <label>
            <span>{t("settings.autosaveDelay")}</span>
            <select
              value={draft.autosaveDelay}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  autosaveDelay: Number(event.target.value) as AutosaveDelay,
                }))
              }
            >
              <option value={150}>150 ms</option>
              <option value={300}>300 ms</option>
              <option value={500}>500 ms</option>
              <option value={1000}>1 s</option>
            </select>
          </label>

          <h3>{t("settings.shortcutsSection")}</h3>
          <label>
            <span>{t("settings.quickEditorShortcut")}</span>
            <select
              value={draft.quickEditorShortcut}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  quickEditorShortcut: event.target.value as QuickEditorShortcut,
                }))
              }
            >
              <option value="CmdOrCtrl+Shift+M">Cmd/Ctrl + Shift + M</option>
              <option value="CmdOrCtrl+Shift+E">Cmd/Ctrl + Shift + E</option>
              <option value="CmdOrCtrl+Alt+M">Cmd/Ctrl + Alt + M</option>
              <option value="CmdOrCtrl+Alt+E">Cmd/Ctrl + Alt + E</option>
            </select>
          </label>

          <h3>{t("settings.librarySection")}</h3>
          <label>
            <span>{t("settings.recentLimit")}</span>
            <select
              value={draft.recentLimit}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  recentLimit: Number(event.target.value) as RecentLimit,
                }))
              }
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <h3>{t("settings.exportSection")}</h3>
          <label>
            <span>{t("settings.exportScale")}</span>
            <select
              value={draft.exportScale}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  exportScale: Number(event.target.value) as ExportScale,
                }))
              }
            >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </label>

          <label>
            <span>{t("settings.exportBackground")}</span>
            <select
              value={draft.exportBackground}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  exportBackground: event.target.value as ExportBackground,
                }))
              }
            >
              <option value="transparent">{t("settings.transparent")}</option>
              <option value="white">{t("settings.white")}</option>
            </select>
          </label>

          {saveError ? (
            <p className="vm-settings-error" role="status">{saveError}</p>
          ) : null}
        </div>

        <footer className="vm-settings-footer">
          <button type="button" onClick={onClose}>{t("settings.cancel")}</button>
          <button type="button" className="is-primary" onClick={() => void save()}>
            {t("settings.save")}
          </button>
        </footer>
      </section>
    </div>
  );
}
