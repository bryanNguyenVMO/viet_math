import type { EquationDocument } from "@vietmath/equation-model";

import { exportFailure } from "./error";
import type { ExportResult, MathRendererBackend } from "./types";

export function exportMathMl(
  equation: EquationDocument,
  backend: MathRendererBackend,
): ExportResult<string> {
  try {
    return { ok: true, data: backend.toMathMl(equation.latex) };
  } catch (error) {
    return exportFailure(
      "MATHML_EXPORT_FAILED",
      "MathML export failed",
      error,
    );
  }
}
