import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

function read(path: string): string {
  const fullPath = join(repoRoot, path);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

describe("Phase 1 production editor package contract", () => {
  it("owns a vendor-independent VietMathEditor interface", () => {
    const source = read("packages/editor/src/VietMathEditor.ts");

    for (const method of [
      "getLatex",
      "setLatex",
      "insertLatex",
      "focus",
      "undo",
      "redo",
      "getSelection",
      "setMode",
      "subscribe",
    ]) {
      expect(source).toContain(method);
    }

    expect(source).not.toContain("mathlive");
  });

  it("exports the production adapter, templates, and IME guard", () => {
    const index = read("packages/editor/src/index.ts");

    expect(index).toContain("MathLiveAdapter");
    expect(index).toContain("STRUCTURE_TEMPLATES");
    expect(index).toContain("ImeCompositionGuard");
  });

  it("does not import the Phase 0 editor-core package", () => {
    for (const path of [
      "packages/editor/src/VietMathEditor.ts",
      "packages/editor/src/MathLiveAdapter.ts",
      "packages/editor/src/templates.ts",
      "packages/editor/src/ImeCompositionGuard.ts",
    ]) {
      expect(read(path)).not.toContain("@vietmath/editor-core");
      expect(read(path)).not.toContain("editor-core");
    }
  });
});
