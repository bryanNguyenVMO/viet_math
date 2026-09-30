import { describe, expect, it } from "vitest";

import { resolveShortcut } from "./index";

describe("resolveShortcut", () => {
  it("maps Command/Ctrl+K to symbol search on both platforms", () => {
    expect(resolveShortcut({
      key: "k",
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      isComposing: false,
    })).toBe("symbol-search");

    expect(resolveShortcut({
      key: "K",
      ctrlKey: false,
      metaKey: true,
      shiftKey: false,
      isComposing: false,
    })).toBe("symbol-search");
  });

  it("maps undo and redo without inventing custom math shortcuts", () => {
    expect(resolveShortcut({
      key: "z",
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      isComposing: false,
    })).toBe("undo");

    expect(resolveShortcut({
      key: "z",
      ctrlKey: true,
      metaKey: false,
      shiftKey: true,
      isComposing: false,
    })).toBe("redo");
  });

  it("suppresses app shortcuts while IME composition is active", () => {
    expect(resolveShortcut({
      key: "k",
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      isComposing: true,
    })).toBeNull();
  });

  it("does not intercept ordinary typing", () => {
    expect(resolveShortcut({
      key: "x",
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      isComposing: false,
    })).toBeNull();
  });
});
