import type { ExportResult, MathExportBackend } from "./types";

export function exportMathMl(
  latex: string,
  backend: MathExportBackend,
): ExportResult<string> {
  try {
    return { ok: true, data: backend.toMathMl(latex) };
  } catch (error) {
    return {
      ok: false,
      code: "MATHML_EXPORT_FAILED",
      message: error instanceof Error ? error.message : "MathML export failed",
    };
  }
}
