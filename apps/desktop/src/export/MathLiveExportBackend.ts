import type {
  MathRendererBackend,
  PngExportOptions,
  SvgExportOptions,
} from "@vietmath/exporters";
import { convertLatexToMathMl } from "mathlive/ssr";

function ensureMathRoot(fragment: string): string {
  if (fragment.trimStart().startsWith("<math")) return fragment;
  return `<math xmlns="http://www.w3.org/1998/Math/MathML">${fragment}</math>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function measureMath(mathml: string) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.visibility = "hidden";
  host.style.display = "inline-block";
  host.style.whiteSpace = "nowrap";
  host.style.fontSize = "32px";
  host.innerHTML = mathml;
  document.body.append(host);

  const rect = host.getBoundingClientRect();
  host.remove();

  return {
    width: Math.max(32, Math.ceil(rect.width) + 20),
    height: Math.max(40, Math.ceil(rect.height) + 20),
  };
}

function imageFromSvg(svg: string): Promise<HTMLImageElement> {
  const image = new Image();
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not rasterize SVG"));
    };
    image.src = url;
  });
}

export class MathLiveExportBackend implements MathRendererBackend {
  toMathMl(latex: string): string {
    return ensureMathRoot(convertLatexToMathMl(latex));
  }

  toSvg(latex: string, options: SvgExportOptions): string {
    const mathml = this.toMathMl(latex);
    const { width, height } = measureMath(mathml);
    const background =
      options.background === "white"
        ? `<rect width="100%" height="100%" fill="#ffffff"/>`
        : "";

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      background,
      `<foreignObject x="0" y="0" width="${width}" height="${height}">`,
      `<div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${escapeXml(options.color)};font-size:32px;">`,
      mathml,
      "</div>",
      "</foreignObject>",
      "</svg>",
    ].join("");
  }

  async toPng(
    latex: string,
    options: PngExportOptions,
  ): Promise<Uint8Array> {
    const svg = this.toSvg(latex, {
      color: options.color,
      background: options.background,
    });
    const image = await imageFromSvg(svg);
    const scale = options.scale;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas rendering is unavailable");

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error("PNG encoding failed"))),
        "image/png",
      );
    });

    return new Uint8Array(await blob.arrayBuffer());
  }
}
