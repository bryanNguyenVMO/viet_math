export type ShortcutAction =
  | "undo"
  | "redo"
  | "cut"
  | "copy"
  | "paste"
  | "symbol-search";

export type ShortcutInput = {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  isComposing: boolean;
};
