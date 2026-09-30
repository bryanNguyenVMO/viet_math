export type MathLiveSelectionMode =
  | "placeholder"
  | "after"
  | "before"
  | "item";

export type MathLiveInsertOptions = {
  selectionMode?: MathLiveSelectionMode;
};

export type MathLiveHistoryCommand = "undo" | "redo";

export interface MathLivePort {
  getValue(format?: "latex"): string;
  setValue(value: string): void;
  insert(value: string, options?: MathLiveInsertOptions): boolean;
  focus(): void;
  executeCommand(command: MathLiveHistoryCommand): boolean;
}
