import { describe, expect, it } from "vitest";

import { ImeCompositionGuard } from "./ImeCompositionGuard";

describe("ImeCompositionGuard", () => {
  it("blocks application commands during composition", () => {
    const guard = new ImeCompositionGuard();

    expect(guard.shouldHandleKeyboardCommand(false)).toBe(true);
    guard.startComposition();
    expect(guard.isComposing()).toBe(true);
    expect(guard.shouldHandleKeyboardCommand(false)).toBe(false);
    guard.endComposition();
    expect(guard.isComposing()).toBe(false);
    expect(guard.shouldHandleKeyboardCommand(false)).toBe(true);
  });

  it("respects KeyboardEvent.isComposing if compositionstart was missed", () => {
    const guard = new ImeCompositionGuard();
    expect(guard.shouldHandleKeyboardCommand(true)).toBe(false);
  });
});
