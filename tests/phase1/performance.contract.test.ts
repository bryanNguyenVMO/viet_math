import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appPath = fileURLToPath(new URL("../../apps/desktop/src/App.tsx", import.meta.url));
const vitePath = fileURLToPath(new URL("../../apps/desktop/vite.config.ts", import.meta.url));

describe("Phase 1 performance boundaries", () => {
  it("lazy-loads full and quick desktop surfaces", () => {
    const source = readFileSync(appPath, "utf8");

    expect(source).toContain("lazy(");
    expect(source).toContain('import("./quick/QuickEditor")');
    expect(source).toContain('import("./layout/DesktopWorkspace")');
    expect(source).toContain("<Suspense");
  });

  it("isolates MathLive into a dedicated Vite chunk", () => {
    const source = readFileSync(vitePath, "utf8");

    expect(source).toContain("manualChunks");
    expect(source).toContain("mathlive");
  });
});
