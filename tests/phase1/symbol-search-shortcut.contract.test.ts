import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = new URL("../../", import.meta.url);
const workspacePath = fileURLToPath(
  new URL("apps/desktop/src/layout/DesktopWorkspace.tsx", repoRoot),
);
const symbolPath = fileURLToPath(
  new URL("apps/desktop/src/layout/SymbolPanel.tsx", repoRoot),
);
const searchInputPath = fileURLToPath(
  new URL("packages/ui/src/components/SearchInput.tsx", repoRoot),
);

describe("symbol search keyboard workflow", () => {
  it("routes Cmd/Ctrl+K through the shared shortcut resolver", () => {
    const workspace = readFileSync(workspacePath, "utf8");

    expect(workspace).toContain("resolveShortcut");
    expect(workspace).toContain('"symbol-search"');
    expect(workspace).toContain("searchRequestKey");
  });

  it("focuses the symbol search input when requested", () => {
    const symbols = readFileSync(symbolPath, "utf8");
    const searchInput = readFileSync(searchInputPath, "utf8");

    expect(symbols).toContain("searchRequestKey");
    expect(symbols).toContain(".focus()");
    expect(searchInput).toContain("forwardRef");
  });
});
