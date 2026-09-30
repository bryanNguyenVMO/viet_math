import { describe, expect, it, vi } from "vitest";

import type { EquationDocument } from "@vietmath/equation-model";

describe("production storage behavior", () => {
  it("stores equations, settings, and invalid drafts without losing draft source", async () => {
    const storageModule = await import("../../packages/storage/src/index");
    expect(storageModule.MemoryStorage).toBeTypeOf("function");

    const storage = new storageModule.MemoryStorage();
    const document: EquationDocument = {
      schemaVersion: 1,
      latex: String.raw`\frac{a}{b}`,
      draftLatex: String.raw`\frac{`,
      displayMode: "block",
      style: {},
    };

    await storage.save("current", document);
    expect(await storage.load("current")).toEqual(document);

    await storage.set("locale", "vi");
    expect(await storage.get("locale")).toBe("vi");

    await storage.saveEquation({
      id: "eq-1",
      document,
      createdAt: 10,
      updatedAt: 20,
      lastOpenedAt: 30,
    });
    expect((await storage.listRecent(10))[0]?.document.draftLatex).toBe(String.raw`\frac{`);

    await storage.clear("current");
    expect(await storage.load("current")).toBeNull();
  });

  it("debounces draft writes and flushes the latest document", async () => {
    vi.useFakeTimers();
    try {
      const storageModule = await import("../../packages/storage/src/index");
      expect(storageModule.createDraftAutosave).toBeTypeOf("function");

      const storage = new storageModule.MemoryStorage();
      const autosave = storageModule.createDraftAutosave(storage, "current", 250);

      const first: EquationDocument = {
        schemaVersion: 1,
        latex: "x",
        draftLatex: String.raw`\frac{`,
        displayMode: "block",
        style: {},
      };
      const second: EquationDocument = {
        ...first,
        draftLatex: String.raw`\frac{a}{`,
      };

      autosave.schedule(first);
      autosave.schedule(second);

      expect(await storage.load("current")).toBeNull();

      await vi.advanceTimersByTimeAsync(249);
      expect(await storage.load("current")).toBeNull();

      await vi.advanceTimersByTimeAsync(1);
      expect(await storage.load("current")).toEqual(second);

      autosave.schedule(first);
      await autosave.flush();
      expect(await storage.load("current")).toEqual(first);

      autosave.cancel();
    } finally {
      vi.useRealTimers();
    }
  });
});
