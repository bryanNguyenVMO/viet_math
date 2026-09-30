export function normalizeVietnameseSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/gu, "d")
    .toLowerCase()
    .trim()
    .replace(/\s+/gu, " ");
}
