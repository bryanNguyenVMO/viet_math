import { describe, expect, it } from "vitest";

import { MathLiveAdapter } from "./MathLiveAdapter";
import type { MathLivePort } from "./MathLivePort";
import type { EditorMode, EditorSelection } from "./VietMathEditor";

function createPort() {
  let value = "x";
  let mode: EditorMode = "math";
  let selection: EditorSelection = { ranges: [[0, 1]], direction: "forward" };
  let focused = 0;
  const commands: Array<string | readonly [string, ...unknown[]]> = [];
  let listener: (() => void) | undefined;

  const port: MathLivePort = {
    getValue: () => value,
    setValue: (next) => { value = next; },
    insert: (latex, options) => {
      value += latex;
      expect(options?.selectionMode).toBe("placeholder");
      return true;
    },
    focus: () => { focused += 1; },
    executeCommand: (command) => { commands.push(command); return true; },
    getSelection: () => selection,
    setMode: (next) => { mode = next; },
    subscribe: (next) => {
      listener = next;
      return () => { listener = undefined; };
    },
  };

  return {
    port,
    state: () => ({ value, mode, selection, focused, commands, listener }),
    changeSelection: (next: EditorSelection) => { selection = next; },
  };
}

describe("MathLiveAdapter", () => {
  it("reads, writes, inserts and focuses through the port", () => {
    const fake = createPort();
    const editor = new MathLiveAdapter(fake.port);

    expect(editor.getLatex()).toBe("x");

    editor.setLatex("y");
    editor.insertLatex(String.raw`\frac{#0}{#?}`);
    editor.focus();

    expect(fake.state().value).toBe(String.raw`y\frac{#0}{#?}`);
    expect(fake.state().focused).toBe(1);
  });

  it("delegates history, mode and selection without exposing vendor types", () => {
    const fake = createPort();
    const editor = new MathLiveAdapter(fake.port);

    const selection: EditorSelection = { ranges: [[2, 4]], direction: "backward" };
    fake.changeSelection(selection);

    editor.undo();
    editor.redo();
    editor.setMode("text");

    expect(fake.state().commands).toEqual(["undo", "redo"]);
    expect(fake.state().mode).toBe("text");
    expect(editor.getSelection()).toEqual(selection);
  });

  it("publishes the latest LaTeX and supports unsubscribe", () => {
    const fake = createPort();
    const editor = new MathLiveAdapter(fake.port);
    const values: string[] = [];

    const unsubscribe = editor.subscribe((latex) => values.push(latex));

    fake.port.setValue("x+1");
    fake.state().listener?.();
    expect(values).toEqual(["x+1"]);

    unsubscribe();
    expect(fake.state().listener).toBeUndefined();
  });
});
