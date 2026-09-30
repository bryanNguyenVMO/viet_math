import type { EquationDocument } from "@vietmath/equation-model";

import type { ExportResult } from "./types";

export function exportLatex(
  equation: EquationDocument,
): ExportResult<string> {
  return { ok: true, data: equation.latex };
}
