export type ExportResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export interface MathExportBackend {
  toMathMl(latex: string): string;
  toMarkup(latex: string): string;
}

export interface SvgRasterizer {
  rasterize(svg: string): Promise<Uint8Array>;
}

export type SvgSize = {
  width: number;
  height: number;
};
