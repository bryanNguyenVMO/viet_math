export interface VietMathEditor {
  getLatex(): string;
  setLatex(latex: string): void;
  insertLatex(latex: string): void;
  focus(): void;
  undo(): void;
  redo(): void;
}
