export const STRUCTURE_TEMPLATES = {
  fraction: String.raw`\frac{#0}{#?}`,
  squareRoot: String.raw`\sqrt{#0}`,
  nthRoot: String.raw`\sqrt[#?]{#0}`,
  superscript: String.raw`#@^{#?}`,
  subscript: String.raw`#@_{#?}`,
  integral: String.raw`\int_{#?}^{#?} #0\,d#?`,
  summation: String.raw`\sum_{#?}^{#?} #0`,
  product: String.raw`\prod_{#?}^{#?} #0`,
  limit: String.raw`\lim_{#?\to #?} #0`,
  derivative: String.raw`\frac{d}{d#?}#0`,
  partialDerivative: String.raw`\frac{\partial #0}{\partial #?}`,
  matrix: String.raw`\begin{bmatrix}#0&#?\\#?&#?\end{bmatrix}`,
  determinant: String.raw`\begin{vmatrix}#0&#?\\#?&#?\end{vmatrix}`,
  cases: String.raw`\begin{cases}#0 & #?\\#? & #?\end{cases}`,
  binomial: String.raw`\binom{#0}{#?}`,
  vector: String.raw`\vec{#0}`,
  text: String.raw`\text{#0}`,
} as const;

export type StructureTemplateName = keyof typeof STRUCTURE_TEMPLATES;
