import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const workspacePath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/DesktopWorkspace.tsx", import.meta.url),
);
const toolbarPath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/Toolbar.tsx", import.meta.url),
);
const symbolPath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/SymbolPanel.tsx", import.meta.url),
);

describe("Phase 1 production shell i18n contract", () => {
  it("uses the VietMath translator in core production surfaces", () => {
    for (const path of [workspacePath, toolbarPath, symbolPath]) {
      const source = readFileSync(path, "utf8");
      expect(source).toContain("@vietmath/i18n");
      expect(source).toContain("t(");
    }
  });

  it("keeps locale selection independent from equation source", () => {
    const source = readFileSync(workspacePath, "utf8");
    expect(source).toContain("detectInitialLocale");
    expect(source).toContain("setLocale");
  });
});
