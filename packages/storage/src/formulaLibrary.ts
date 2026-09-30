import type { EquationDocument } from "@vietmath/equation-model";

import type { FormulaTemplate, StoredEquation } from "./ports";

function cloneDocument(document: EquationDocument): EquationDocument {
  return JSON.parse(JSON.stringify(document)) as EquationDocument;
}

export const BUILTIN_TEMPLATES: FormulaTemplate[] = [
  {
    id: "quadratic",
    title: "Phương trình bậc hai",
    document: {
      schemaVersion: 1,
      latex: String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`,
      displayMode: "block",
      style: {},
    },
  },
  {
    id: "pythagorean",
    title: "Định lý Pythagore",
    document: {
      schemaVersion: 1,
      latex: String.raw`a^2+b^2=c^2`,
      displayMode: "block",
      style: {},
    },
  },
  {
    id: "basic-integral",
    title: "Tích phân cơ bản",
    document: {
      schemaVersion: 1,
      latex: String.raw`\int_0^1 x^2\,dx`,
      displayMode: "block",
      style: {},
    },
  },
  {
    id: "matrix-2x2",
    title: "Ma trận 2×2",
    document: {
      schemaVersion: 1,
      latex: String.raw`\begin{bmatrix}a&b\\c&d\end{bmatrix}`,
      displayMode: "block",
      style: {},
    },
  },
  {
    id: "system-2",
    title: "Hệ phương trình",
    document: {
      schemaVersion: 1,
      latex: String.raw`\begin{cases}x+y=1\\x-y=0\end{cases}`,
      displayMode: "block",
      style: {},
    },
  },
];

export function cloneTemplate(
  template: FormulaTemplate,
  id: string,
  now = Date.now(),
): StoredEquation {
  return {
    id,
    document: cloneDocument(template.document),
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
  };
}
