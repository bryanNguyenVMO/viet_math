import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

function read(path: string): string {
  const fullPath = join(repoRoot, path);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

describe("Phase 1 production desktop layout", () => {
  it("renders the four primary productivity regions from production components", () => {
    const workspace = read("apps/desktop/src/layout/DesktopWorkspace.tsx");
    const toolbar = read("apps/desktop/src/layout/Toolbar.tsx");
    const library = read("apps/desktop/src/layout/LibraryPanel.tsx");
    const symbols = read("apps/desktop/src/layout/SymbolPanel.tsx");
    const app = read("apps/desktop/src/App.tsx");

    expect(app).toContain("<DesktopWorkspace");
    expect(toolbar).toContain('aria-label="VietMath toolbar"');
    expect(library).toContain('aria-label="Formula library"');
    expect(workspace).toContain('aria-label="Equation editor"');
    expect(symbols).toContain('aria-label="Symbol palette"');
  });

  it("provides collapsible left and right panels with resize handles", () => {
    const workspace = read("apps/desktop/src/layout/DesktopWorkspace.tsx");

    expect(workspace).toContain("leftCollapsed");
    expect(workspace).toContain("rightCollapsed");
    expect(workspace).toContain('data-resize-handle="left"');
    expect(workspace).toContain('data-resize-handle="right"');
  });

  it("uses VietMath-owned UI components instead of spike components", () => {
    const files = [
      "apps/desktop/src/layout/Toolbar.tsx",
      "apps/desktop/src/layout/LibraryPanel.tsx",
      "apps/desktop/src/layout/SymbolPanel.tsx",
    ];

    for (const file of files) {
      const source = read(file);
      expect(source).toContain('@vietmath/ui');
      expect(source).not.toContain("desktop-spike");
    }
  });
});
