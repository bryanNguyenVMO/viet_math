import { describe, expect, it, vi } from "vitest";

import { MathLiveAdapter } from "./index";

function createMathfieldPort() {
  return {
    getValue: vi.fn(() => String.raw`\frac{a}{b}`),
    setValue: vi.fn(),
    insert: vi.fn(() => true),
    focus: vi.fn(),
    executeCommand: vi.fn(() => true),
  };
}

describe("MathLiveAdapter", () => {
  it("reads and writes LaTeX through the port", () => {
    const mathfield = createMathfieldPort();
    const editor = new MathLiveAdapter(mathfield);

    expect(editor.getLatex()).toBe(String.raw`\frac{a}{b}`);

    editor.setLatex(String.raw`x^2`);

    expect(mathfield.getValue).toHaveBeenCalledWith("latex");
    expect(mathfield.setValue).toHaveBeenCalledWith(String.raw`x^2`);
  });

  it("inserts structures and selects the first placeholder", () => {
    const mathfield = createMathfieldPort();
    const editor = new MathLiveAdapter(mathfield);

    editor.insertLatex(String.raw`\frac{#0}{#?}`);

    expect(mathfield.insert).toHaveBeenCalledWith(
      String.raw`\frac{#0}{#?}`,
      { selectionMode: "placeholder" },
    );
  });

  it("delegates focus, undo, and redo without exposing MathLive to callers", () => {
    const mathfield = createMathfieldPort();
    const editor = new MathLiveAdapter(mathfield);

    editor.focus();
    editor.undo();
    editor.redo();

    expect(mathfield.focus).toHaveBeenCalledOnce();
    expect(mathfield.executeCommand).toHaveBeenNthCalledWith(1, "undo");
    expect(mathfield.executeCommand).toHaveBeenNthCalledWith(2, "redo");
  });
});
