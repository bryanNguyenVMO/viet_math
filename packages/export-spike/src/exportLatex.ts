import type { ExportResult } from "./types";

export function exportLatex(latex: string): ExportResult<string> {
  return { ok: true, data: latex };
}
