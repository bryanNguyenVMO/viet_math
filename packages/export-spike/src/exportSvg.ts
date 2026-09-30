import type { SvgSize } from "./types";

export function buildForeignObjectSvg(
  markup: string,
  size: SvgSize,
): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">`,
    `<foreignObject x="0" y="0" width="100%" height="100%">`,
    `<div xmlns="http://www.w3.org/1999/xhtml">${markup}</div>`,
    "</foreignObject>",
    "</svg>",
  ].join("");
}
