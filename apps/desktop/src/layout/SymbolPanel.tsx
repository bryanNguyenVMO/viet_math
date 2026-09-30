import {
  searchMathCatalog,
  type MathCatalogCategory,
  type VietMathEditor,
} from "@vietmath/editor";
import {
  createTranslator,
  type Locale,
  type TranslationKey,
} from "@vietmath/i18n";
import { Panel, SearchInput, SymbolButton } from "@vietmath/ui";
import { convertLatexToMarkup } from "mathlive/ssr";
import { Search, Sigma } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type SymbolPanelProps = {
  editor: VietMathEditor | null;
  locale: Locale;
  searchRequestKey: number;
};

const categoryKeys: Record<MathCatalogCategory, TranslationKey> = {
  common: "categories.common",
  structure: "categories.structure",
  calculus: "categories.calculus",
  greek: "categories.greek",
  relation: "categories.relation",
  set: "categories.set",
};

export function SymbolPanel({
  editor,
  locale,
  searchRequestKey,
}: SymbolPanelProps) {
  const { t } = createTranslator(locale);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchRequestKey > 0) searchRef.current?.focus();
  }, [searchRequestKey]);
  const results = useMemo(() => searchMathCatalog(query).slice(0, 28), [query]);

  const grouped = useMemo(() => {
    const groups = new Map<MathCatalogCategory, typeof results>();
    for (const item of results) {
      const items = groups.get(item.category) ?? [];
      groups.set(item.category, [...items, item]);
    }
    return [...groups.entries()];
  }, [results]);

  const insert = (latex: string) => {
    editor?.insertLatex(latex);
    editor?.focus();
  };

  return (
    <Panel className="vm-side-panel" aria-label="Symbol palette">
      <div className="vm-panel-heading">
        <div>
          <p className="vm-panel-eyebrow">{t("symbols.eyebrow")}</p>
          <h2>{query ? t("symbols.results") : t("symbols.library")}</h2>
        </div>
        <Sigma size={17} />
      </div>

      <SearchInput
        ref={searchRef}
        aria-label={t("symbols.searchLabel")}
        placeholder={t("symbols.searchPlaceholder")}
        icon={<Search size={15} />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="vm-catalog-groups">
        {grouped.map(([category, items]) => (
          <section className="vm-catalog-group" key={category}>
            <h3>{t(categoryKeys[category])}</h3>
            <div className="vm-symbol-grid">
              {items.map((item) => (
                <SymbolButton
                  key={item.id}
                  label={item.label}
                  disabled={!editor}
                  onClick={() => insert(item.latex)}
                  symbol={
                    <span
                      className="vm-math-preview"
                      aria-hidden="true"
                      dangerouslySetInnerHTML={{
                        __html: convertLatexToMarkup(item.previewLatex),
                      }}
                    />
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {results.length === 0 ? (
        <p className="vm-catalog-empty">{t("symbols.noResults")}</p>
      ) : null}
    </Panel>
  );
}
