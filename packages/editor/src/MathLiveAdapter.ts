import type { EditorMode, EditorSelection, VietMathEditor } from "./VietMathEditor";
import type { MathLivePort } from "./MathLivePort";

export class MathLiveAdapter implements VietMathEditor {
  constructor(private readonly port: MathLivePort) {}

  getLatex(): string {
    return this.port.getValue("latex");
  }

  setLatex(latex: string): void {
    this.port.setValue(latex);
  }

  insertLatex(latex: string): void {
    this.port.insert(latex, { selectionMode: "placeholder" });
  }

  focus(): void {
    this.port.focus();
  }

  undo(): void {
    this.port.executeCommand("undo");
  }

  redo(): void {
    this.port.executeCommand("redo");
  }

  getSelection(): EditorSelection {
    return this.port.getSelection();
  }

  setMode(mode: EditorMode): void {
    this.port.setMode(mode);
  }

  subscribe(listener: (latex: string) => void): () => void {
    return this.port.subscribe(() => listener(this.getLatex()));
  }
}
