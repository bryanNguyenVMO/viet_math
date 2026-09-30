function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function asOmml(value: string): string {
  return value.trimStart().startsWith("<m:") ? value : ommlRun(value);
}

export function ommlRun(text: string): string {
  return `<m:r><m:t>${escapeXml(text)}</m:t></m:r>`;
}

export function buildFractionOmml(
  numerator: string,
  denominator: string,
): string {
  return [
    "<m:f>",
    `<m:num><m:e>${asOmml(numerator)}</m:e></m:num>`,
    `<m:den><m:e>${asOmml(denominator)}</m:e></m:den>`,
    "</m:f>",
  ].join("");
}

export function buildRadicalOmml(content: string): string {
  return [
    "<m:rad>",
    '<m:radPr><m:degHide m:val="1"/></m:radPr>',
    "<m:deg/>",
    `<m:e>${asOmml(content)}</m:e>`,
    "</m:rad>",
  ].join("");
}

export function buildMatrixOmml(rows: string[][]): string {
  if (rows.length === 0 || rows.some((row) => row.length === 0)) {
    throw new Error("Matrix must contain at least one cell");
  }

  const width = rows[0].length;
  if (rows.some((row) => row.length !== width)) {
    throw new Error("Matrix rows must have equal length");
  }

  const body = rows
    .map(
      (row) =>
        "<m:mr>" +
        row.map((cell) => `<m:e>${asOmml(cell)}</m:e>`).join("") +
        "</m:mr>",
    )
    .join("");

  return `<m:m>${body}</m:m>`;
}
