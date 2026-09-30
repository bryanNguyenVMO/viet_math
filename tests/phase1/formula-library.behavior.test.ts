import { describe, expect, it } from "vitest";

import type { EquationDocument } from "@vietmath/equation-model";

const baseDocument: EquationDocument = {
  schemaVersion: 1,
  latex: String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`,
  displayMode: "block",
  style: {},
};

describe("Phase 1 formula library behavior", () => {
  it("orders recent equations by last opened time", async () => {
    const module = (await import("../../packages/storage/src/index")) as Record<string, any>;
    const storage = new module.MemoryStorage();

    await storage.saveEquation({
      id: "older",
      document: baseDocument,
      createdAt: 1,
      updatedAt: 2,
      lastOpenedAt: 10,
    });
    await storage.saveEquation({
      id: "newer",
      document: { ...baseDocument, latex: "a^2+b^2=c^2" },
      createdAt: 3,
      updatedAt: 4,
      lastOpenedAt: 20,
    });

    expect((await storage.listRecent(10)).map((item: { id: string }) => item.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("toggles favorites idempotently", async () => {
    const module = (await import("../../packages/storage/src/index")) as Record<string, any>;
    const storage = new module.MemoryStorage();

    expect(storage.setFavorite).toBeTypeOf("function");
    expect(storage.listFavorites).toBeTypeOf("function");

    await storage.saveEquation({
      id: "eq-1",
      document: baseDocument,
      createdAt: 1,
      updatedAt: 1,
      lastOpenedAt: 1,
    });
    await storage.setFavorite("eq-1", true);
    await storage.setFavorite("eq-1", true);

    expect((await storage.listFavorites()).map((item: { id: string }) => item.id)).toEqual(["eq-1"]);

    await storage.setFavorite("eq-1", false);
    expect(await storage.listFavorites()).toEqual([]);
  });

  it("clones a template into an independent editable equation", async () => {
    const module = (await import("../../packages/storage/src/index")) as Record<string, any>;

    expect(module.cloneTemplate).toBeTypeOf("function");

    const template = {
      id: "quadratic",
      title: "Phương trình bậc hai",
      document: baseDocument,
    };
    const cloned = module.cloneTemplate(template, "new-id", 100);

    expect(cloned.id).toBe("new-id");
    expect(cloned.document).toEqual(template.document);
    expect(cloned.document).not.toBe(template.document);
    expect(cloned.createdAt).toBe(100);
    expect(cloned.lastOpenedAt).toBe(100);

    cloned.document.style.color = "#ff0000";
    expect(template.document.style.color).toBeUndefined();
  });
});
