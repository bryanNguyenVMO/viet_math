import {
  SETTINGS_KEY,
  type AppSettings,
  type AppTheme,
  type ExportBackground,
  type ExportScale,
} from "@vietmath/shared";
import type { SettingsRepository } from "@vietmath/storage";
import { useEffect, useState } from "react";
import { createTranslator, type Locale } from "@vietmath/i18n";

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
  const { t } = createTranslator(locale);

  useEffect(() => {
    if (open) setDraft(settings);
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
    await storage.set(SETTINGS_KEY, JSON.stringify(draft));
    onSaved(draft);
    onClose();
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
