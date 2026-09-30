import {
  convertLatexToMarkup,
  convertLatexToMathMl,
} from "mathlive/ssr";

import type { MathExportBackend } from "../../../../packages/export-spike/src";

export class MathLiveExportBackend implements MathExportBackend {
  toMathMl(latex: string): string {
    const fragment = convertLatexToMathMl(latex);

    if (fragment.trimStart().startsWith("<math")) {
      return fragment;
    }

    return `<math xmlns="http://www.w3.org/1998/Math/MathML">${fragment}</math>`;
  }

  toMarkup(latex: string): string {
    return convertLatexToMarkup(latex);
  }
}
