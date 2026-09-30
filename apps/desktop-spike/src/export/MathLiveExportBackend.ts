import {
  convertLatexToMarkup,
  convertLatexToMathMl,
} from "mathlive/ssr";

import type { MathExportBackend } from "../../../../packages/export-spike/src";

export class MathLiveExportBackend implements MathExportBackend {
  toMathMl(latex: string): string {
    return convertLatexToMathMl(latex);
  }

  toMarkup(latex: string): string {
    return convertLatexToMarkup(latex);
  }
}
