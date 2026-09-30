import type { VietMathEditor } from "../VietMathEditor";
import type { MathLivePort } from "./MathLivePort";

export class MathLiveAdapter implements VietMathEditor {
  constructor(private readonly mathfield: MathLivePort) {}

  getLatex(): string {
    return this.mathfield.getValue("latex");
  }

  setLatex(latex: string): void {
    this.mathfield.setValue(latex);
  }

  insertLatex(latex: string): void {
    this.mathfield.insert(latex, { selectionMode: "placeholder" });
  }

  focus(): void {
    this.mathfield.focus();
  }

  undo(): void {
    this.mathfield.executeCommand("undo");
  }

  redo(): void {
    this.mathfield.executeCommand("redo");
  }
}
