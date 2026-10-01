import type { VietMathEditor } from "@vietmath/editor";
import { createTranslator, type Locale } from "@vietmath/i18n";
import { normalizeVietnameseSearch } from "@vietmath/shared";
import { BUILTIN_TEMPLATES } from "@vietmath/storage";
import { EquationCard, Panel, SearchInput } from "@vietmath/ui";
import { BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";

type LibraryPanelProps = {
  editor: VietMathEditor | null;
  locale: Locale;
};

const aliases: Record<string, string[]> = {
  quadratic: ["phuong trinh bac hai", "quadratic", "quadratic formula"],
  pythagorean: ["pythagore", "pythagorean"],
  "basic-integral": ["tich phan", "integral", "int"],
  "matrix-2x2": ["ma tran", "matrix"],
  "system-2": ["he phuong trinh", "system", "cases"],
};

function matchesTemplate(
  template: (typeof BUILTIN_TEMPLATES)[number],
  query: string,
) {
  if (!query) return true;

  const haystack = normalizeVietnameseSearch(
    [
      template.title,
      template.document.latex,
      ...(aliases[template.id] ?? []),
    ].join(" "),
  );

  return haystack.includes(normalizeVietnameseSearch(query));
}

export function LibraryPanel({ editor, locale }: LibraryPanelProps) {
  const { t } = createTranslator(locale);
  const [query, setQuery] = useState("");
  const templates = useMemo(
    () => BUILTIN_TEMPLATES.filter((template) => matchesTemplate(template, query)),
    [query],
  );

  const openTemplate = (latex: string) => {
    editor?.setLatex(latex);
    editor?.focus();
  };

  return (
    <Panel className="vm-side-panel" aria-label="Formula library">
      <div className="vm-panel-heading">
        <div>
          <p className="vm-panel-eyebrow">{t("library.eyebrow")}</p>
          <h2>{t("library.templates")}</h2>
        </div>
        <BookOpen size={17} />
      </div>
      <SearchInput
        aria-label={t("library.searchLabel")}
        placeholder={t("library.searchPlaceholder")}
        icon={<Search size={15} />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="vm-formula-list">
        {templates.map((template) => (
          <EquationCard
            key={template.id}
            title={template.title}
            preview={template.document.latex}
            disabled={!editor}
            onClick={() => openTemplate(template.document.latex)}
          />
        ))}
        {templates.length === 0 ? (
          <p className="vm-catalog-empty">{t("library.noResults")}</p>
        ) : null}
      </div>
    </Panel>
  );
}
