import { normalizeVietnameseSearch } from "@vietmath/shared/search";

import { MATH_CATALOG } from "./items";
import type { MathCatalogItem } from "./types";

function aliasesFor(item: MathCatalogItem): string[] {
  return [
    item.label,
    ...item.aliases.vi,
    ...item.aliases.viAscii,
    ...item.aliases.en,
    ...item.aliases.latex,
  ].map(normalizeVietnameseSearch);
}

function score(item: MathCatalogItem, query: string): number {
  const aliases = aliasesFor(item);
  if (aliases.some((alias) => alias === query)) return 0;
  if (aliases.some((alias) => alias.startsWith(query))) return 1;
  if (aliases.some((alias) => alias.includes(query))) return 2;
  return Number.POSITIVE_INFINITY;
}

export function searchMathCatalog(query: string): MathCatalogItem[] {
  const normalized = normalizeVietnameseSearch(query);
  if (!normalized) return [...MATH_CATALOG];

  return MATH_CATALOG
    .map((item, index) => ({ item, index, score: score(item, normalized) }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((left, right) => left.score - right.score || left.index - right.index)
    .map((entry) => entry.item);
}
