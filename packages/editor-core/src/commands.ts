export const STRUCTURE_TEMPLATES = {
  fraction: String.raw`\\frac{#0}{#?}`,
  squareRoot: String.raw`\\sqrt{#0}`,
  superscript: String.raw`#@^{#?}`,
  integral: String.raw`\\int_{#?}^{#?} #0\\,d#?`,
  summation: String.raw`\\sum_{#?}^{#?} #0`,
  limit: String.raw`\\lim_{#?\\to #?} #0`,
  matrix: String.raw`\\begin{bmatrix}#0&#?\\\\#?&#?\\end{bmatrix}`,
  cases: String.raw`\\begin{cases}#0 & #?\\\\#? & #?\\end{cases}`,
} as const;

export type StructureTemplateName = keyof typeof STRUCTURE_TEMPLATES;
