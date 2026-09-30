import type { VietMathEditor, EditorMode, EditorSelection } from "./VietMathEditor";
import type { MathLivePort } from "./MathLivePort";

export class MathLiveAdapter implements VietMathEditor {
  constructor(private readonly port: MathLivePort) {}

  getLatex(): string { throw new Error("not implemented"); }
  setLatex(_latex: string): void { throw new Error("not implemented"); }
  insertLatex(_latex: string): void { throw new Error("not implemented"); }
  focus(): void { throw new Error("not implemented"); }
  undo(): void { throw new Error("not implemented"); }
  redo(): void { throw new Error("not implemented"); }
  getSelection(): EditorSelection { throw new Error("not implemented"); }
  setMode(_mode: EditorMode): void { throw new Error("not implemented"); }
  subscribe(_listener: (latex: string) => void): () => void { throw new Error("not implemented"); }
}
