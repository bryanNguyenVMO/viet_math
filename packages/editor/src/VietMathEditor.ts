export type EditorMode = "math" | "text";
export type EditorDirection = "forward" | "backward" | "none";
export type EditorRange = readonly [number, number];

export type EditorSelection = {
  ranges: readonly EditorRange[];
  direction?: EditorDirection;
};

export interface VietMathEditor {
  getLatex(): string;
  setLatex(latex: string): void;
  insertLatex(latex: string): void;
  focus(): void;
  undo(): void;
  redo(): void;
  getSelection(): EditorSelection;
  setMode(mode: EditorMode): void;
  subscribe(listener: (latex: string) => void): () => void;
}
