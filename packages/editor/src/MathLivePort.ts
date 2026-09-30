import type { EditorMode, EditorSelection } from "./VietMathEditor";

export type InsertOptions = {
  selectionMode?: "placeholder" | "after" | "before" | "item";
};

export interface MathLivePort {
  getValue(format?: "latex"): string;
  setValue(value: string): void;
  insert(value: string, options?: InsertOptions): boolean | void;
  focus(): void;
  executeCommand(command: string | readonly [string, ...unknown[]]): boolean | void;
  getSelection(): EditorSelection;
  setMode(mode: EditorMode): void;
  subscribe(listener: () => void): () => void;
}
