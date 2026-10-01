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

  it("keeps a bounded version history when an equation changes", async () => {
    const storageModule = await import("../../packages/storage/src/index");
    const storage = new storageModule.MemoryStorage();
    const base: EquationDocument = {
      schemaVersion: 1,
      latex: "x",
      displayMode: "block",
      style: {},
    };

    await storage.saveEquation({
      id: "history-1",
      document: base,
      createdAt: 1,
      updatedAt: 10,
      lastOpenedAt: 10,
    });
    await storage.saveEquation({
      id: "history-1",
      document: { ...base, latex: "x+1" },
      createdAt: 1,
      updatedAt: 20,
      lastOpenedAt: 20,
    });
    await storage.saveEquation({
      id: "history-1",
      document: { ...base, latex: "x+2" },
      createdAt: 1,
      updatedAt: 30,
      lastOpenedAt: 30,
    });

    const revisions = await storage.listRevisions("history-1", 10);
    expect(revisions.map((revision) => revision.document.latex)).toEqual([
      "x+1",
      "x",
    ]);
  });

  it("organizes equations into persistent collections", async () => {
    const storageModule = await import("../../packages/storage/src/index");
    const storage = new storageModule.MemoryStorage();
    const document: EquationDocument = {
      schemaVersion: 1,
      latex: "x^2+y^2=z^2",
      displayMode: "block",
      style: {},
    };

    await storage.saveEquation({
      id: "collection-eq",
      document,
      createdAt: 1,
      updatedAt: 1,
      lastOpenedAt: 1,
    });
    await storage.createCollection({
      id: "geometry",
      name: "Hình học",
      createdAt: 2,
    });
    await storage.addEquationToCollection("geometry", "collection-eq");
    await storage.addEquationToCollection("geometry", "collection-eq");

    expect(await storage.listCollections()).toEqual([
      { id: "geometry", name: "Hình học", createdAt: 2 },
    ]);
    expect(
      (await storage.listCollectionEquations("geometry")).map(
        (equation) => equation.id,
      ),
    ).toEqual(["collection-eq"]);

    await storage.removeEquationFromCollection("geometry", "collection-eq");
    expect(await storage.listCollectionEquations("geometry")).toEqual([]);

    await storage.deleteCollection("geometry");
    expect(await storage.listCollections()).toEqual([]);
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
