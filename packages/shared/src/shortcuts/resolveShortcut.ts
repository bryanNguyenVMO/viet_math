import type { ShortcutAction, ShortcutInput } from "./types";

export function resolveShortcut(input: ShortcutInput): ShortcutAction | null {
  if (input.isComposing) return null;

  const command = input.ctrlKey || input.metaKey;
  if (!command) return null;

  const key = input.key.toLowerCase();

  if (key === "k") return "symbol-search";
  if (key === "z") return input.shiftKey ? "redo" : "undo";
  if (key === "x") return "cut";
  if (key === "c") return "copy";
  if (key === "v") return "paste";

  return null;
}
