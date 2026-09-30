import type { EquationDocument } from "@vietmath/equation-model";

import { exportFailure } from "./error";
import type {
  ExportResult,
  MathRendererBackend,
  SvgExportOptions,
} from "./types";

export function exportSvg(
  equation: EquationDocument,
  backend: MathRendererBackend,
  options: SvgExportOptions,
): ExportResult<string> {
  try {
    return { ok: true, data: backend.toSvg(equation.latex, options) };
  } catch (error) {
    return exportFailure("SVG_EXPORT_FAILED", "SVG export failed", error);
  }
}
