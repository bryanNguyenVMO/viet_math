import type { EquationDocument } from "@vietmath/equation-model";

import { exportFailure } from "./error";
import type {
  ExportResult,
  MathRendererBackend,
  PngExportOptions,
} from "./types";

export async function exportPng(
  equation: EquationDocument,
  backend: MathRendererBackend,
  options: PngExportOptions,
): Promise<ExportResult<Uint8Array>> {
  try {
    return { ok: true, data: await backend.toPng(equation.latex, options) };
  } catch (error) {
    return exportFailure("PNG_EXPORT_FAILED", "PNG export failed", error);
  }
}
