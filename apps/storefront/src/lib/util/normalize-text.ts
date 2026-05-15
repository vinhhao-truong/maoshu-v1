export function normalizeText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
    .toLowerCase()
}

export function scoreMatch(title: string, normalizedQ: string, queryWords: string[]): number {
  const titleNorm = normalizeText(title)
  if (titleNorm.includes(normalizedQ)) return 1
  const matched = queryWords.filter((w) => titleNorm.includes(w)).length
  return matched / queryWords.length
}
