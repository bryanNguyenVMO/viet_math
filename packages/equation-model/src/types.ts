export type EquationDisplayMode = "inline" | "block";

export type EquationStyle = {
  fontSize?: number;
  color?: string;
};

export type EquationDocument = {
  schemaVersion: 1;
  latex: string;
  draftLatex?: string;
  displayMode: EquationDisplayMode;
  style: EquationStyle;
};
