import type { EquationDocument } from "./types";

export function stageEquationDraft(
  document: EquationDocument,
  draftLatex: string,
): EquationDocument {
  return {
    ...document,
    draftLatex,
  };
}

export function commitEquationLatex(
  document: EquationDocument,
  latex: string,
): EquationDocument {
  const next: EquationDocument = {
    ...document,
    latex,
  };
  delete next.draftLatex;
  return next;
}
