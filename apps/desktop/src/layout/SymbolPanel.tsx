import {
  searchMathCatalog,
  type MathCatalogCategory,
  type VietMathEditor,
} from "@vietmath/editor";
import { Panel, SearchInput, SymbolButton } from "@vietmath/ui";
import { convertLatexToMarkup } from "mathlive/ssr";
import { Search, Sigma } from "lucide-react";
import { useMemo, useState } from "react";

type SymbolPanelProps = {
  editor: VietMathEditor | null;
};

const categoryLabels: Record<MathCatalogCategory, string> = {
  common: "Phổ biến",
  structure: "Cấu trúc",
  calculus: "Giải tích",
  greek: "Hy Lạp",
  relation: "Quan hệ",
  set: "Tập hợp",
};

export function SymbolPanel({ editor }: SymbolPanelProps) {
  const [query, setQuery] = useState("");
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
          <p className="vm-panel-eyebrow">Ký hiệu & cấu trúc</p>
          <h2>{query ? "Kết quả tìm kiếm" : "Thư viện nhanh"}</h2>
        </div>
        <Sigma size={17} />
      </div>

      <SearchInput
        aria-label="Tìm ký hiệu"
        placeholder={"phân số, integral, \\alpha..."}
        icon={<Search size={15} />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="vm-catalog-groups">
        {grouped.map(([category, items]) => (
          <section className="vm-catalog-group" key={category}>
            <h3>{categoryLabels[category]}</h3>
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
        <p className="vm-catalog-empty">Không tìm thấy ký hiệu phù hợp.</p>
      ) : null}
    </Panel>
  );
}
