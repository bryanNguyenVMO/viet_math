import { createTranslator, type Locale } from "@vietmath/i18n";

type HelpDialogProps = {
  open: boolean;
  locale: Locale;
  onClose: () => void;
};

export function HelpDialog({ open, locale, onClose }: HelpDialogProps) {
  const { t } = createTranslator(locale);

  if (!open) return null;

  return (
    <div className="vm-settings-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="vm-settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("help.title")}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="vm-settings-header">
          <h2>{t("help.title")}</h2>
          <button type="button" aria-label={t("help.close")} onClick={onClose}>×</button>
        </header>

        <div className="vm-help-content">
          <section>
            <h3>{t("help.quickStart")}</h3>
            <p>{t("help.quickStartText")}</p>
          </section>
          <section>
            <h3>{t("help.shortcuts")}</h3>
            <ul>
              <li>{t("help.searchShortcut")}</li>
              <li>{t("help.quickEditorShortcut")}</li>
            </ul>
          </section>
          <section>
            <h3>{t("help.latex")}</h3>
            <p>{t("help.latexText")}</p>
          </section>
        </div>

        <footer className="vm-settings-footer">
          <button type="button" className="is-primary" onClick={onClose}>
            {t("help.close")}
          </button>
        </footer>
      </section>
    </div>
  );
}
