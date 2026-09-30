export type MathCatalogKind = "structure" | "symbol";

export type MathCatalogCategory =
  | "common"
  | "structure"
  | "calculus"
  | "greek"
  | "relation"
  | "set";

export type MathCatalogAliases = {
  vi: readonly string[];
  viAscii: readonly string[];
  en: readonly string[];
  latex: readonly string[];
};

export type MathCatalogItem = {
  id: string;
  kind: MathCatalogKind;
  category: MathCatalogCategory;
  label: string;
  latex: string;
  previewLatex: string;
  aliases: MathCatalogAliases;
};
