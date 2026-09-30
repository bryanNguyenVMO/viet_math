import type { ExportResult, SvgRasterizer } from "./types";

export async function exportPng(
  svg: string,
  rasterizer: SvgRasterizer,
): Promise<ExportResult<Uint8Array>> {
  try {
    return { ok: true, data: await rasterizer.rasterize(svg) };
  } catch (error) {
    return {
      ok: false,
      code: "PNG_EXPORT_FAILED",
      message: error instanceof Error ? error.message : "PNG export failed",
    };
  }
}
