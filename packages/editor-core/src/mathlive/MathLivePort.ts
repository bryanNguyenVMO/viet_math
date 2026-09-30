export type MathLiveSelectionMode =
  | "placeholder"
  | "after"
  | "before"
  | "item";

export type MathLiveInsertOptions = {
  selectionMode?: MathLiveSelectionMode;
};

export interface MathLivePort {
  getValue(format?: "latex"): string;
  setValue(value: string): void;
  insert(value: string, options?: MathLiveInsertOptions): boolean;
  focus(): void;
  executeCommand(command: string): boolean;
}
