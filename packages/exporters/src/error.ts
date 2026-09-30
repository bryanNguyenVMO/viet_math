import type { ExportResult } from "./types";

export function exportFailure<T>(
  code: string,
  fallbackMessage: string,
  error: unknown,
): ExportResult<T> {
  return {
    ok: false,
    code,
    message: error instanceof Error ? error.message : fallbackMessage,
  };
}
