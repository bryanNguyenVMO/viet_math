import type { EquationDocument } from "@vietmath/equation-model";

export type ExportResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export type ExportBackground = "transparent" | "white";

export type SvgExportOptions = {
  color: string;
  background: ExportBackground;
};

export type PngExportOptions = {
  scale: 1 | 2 | 4;
  color: string;
  background: ExportBackground;
};

export interface MathRendererBackend {
  toMathMl(latex: string): string;
  toSvg(latex: string, options: SvgExportOptions): string;
  toPng(
    latex: string,
    options: PngExportOptions,
  ): Promise<Uint8Array>;
}

export type EquationExporter = (
  equation: EquationDocument,
) => ExportResult<string>;
