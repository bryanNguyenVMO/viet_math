import type { EquationDocument, EquationStyle } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStyle(value: unknown): EquationStyle {
  if (!isRecord(value)) {
    throw new Error("Invalid equation style");
  }

  if (value.fontSize !== undefined && typeof value.fontSize !== "number") {
    throw new Error("Invalid equation font size");
  }

  if (value.color !== undefined && typeof value.color !== "string") {
    throw new Error("Invalid equation color");
  }

  return {
    ...(value.fontSize === undefined ? {} : { fontSize: value.fontSize }),
    ...(value.color === undefined ? {} : { color: value.color }),
  };
}

export function serializeEquation(doc: EquationDocument): string {
  return JSON.stringify(doc);
}

export function deserializeEquation(raw: string): EquationDocument {
  const value: unknown = JSON.parse(raw);

  if (!isRecord(value)) {
    throw new Error("Invalid equation document");
  }

  if (value.schemaVersion !== 1) {
    throw new Error("Unsupported equation schema version");
  }

  if (typeof value.latex !== "string") {
    throw new Error("Invalid equation LaTeX");
  }

  if (
    value.draftLatex !== undefined &&
    typeof value.draftLatex !== "string"
  ) {
    throw new Error("Invalid equation draft LaTeX");
  }

  if (value.displayMode !== "inline" && value.displayMode !== "block") {
    throw new Error("Invalid equation display mode");
  }

  return {
    schemaVersion: 1,
    latex: value.latex,
    ...(value.draftLatex === undefined
      ? {}
      : { draftLatex: value.draftLatex }),
    displayMode: value.displayMode,
    style: parseStyle(value.style),
  };
}
