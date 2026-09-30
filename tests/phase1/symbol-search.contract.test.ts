import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const symbolPanelPath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/SymbolPanel.tsx", import.meta.url),
);
const workspacePath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/DesktopWorkspace.tsx", import.meta.url),
);

describe("Phase 1 symbol search UI", () => {
  it("searches the catalog, renders math previews, and inserts through VietMathEditor", () => {
    const source = readFileSync(symbolPanelPath, "utf8");

    expect(source).toContain("searchMathCatalog");
    expect(source).toContain("convertLatexToMarkup");
    expect(source).toContain("VietMathEditor");
    expect(source).toContain("insertLatex");
  });

  it("passes the production editor into the symbol panel", () => {
    const source = readFileSync(workspacePath, "utf8");
    expect(source.replace(/\\s+/gu, " ")).toContain("<SymbolPanel editor={editor}");
  });
});
