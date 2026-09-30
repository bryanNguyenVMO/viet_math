import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const workspacePath = fileURLToPath(
  new URL("../../apps/desktop/src/editor/EditorWorkspace.tsx", import.meta.url),
);
const sourcePanelPath = fileURLToPath(
  new URL("../../apps/desktop/src/editor/LatexSourcePanel.tsx", import.meta.url),
);
const desktopWorkspacePath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/DesktopWorkspace.tsx", import.meta.url),
);

describe("Phase 1 visual/LaTeX editing contract", () => {
  it("has a dedicated source panel with visual and LaTeX modes", () => {
    const workspace = existsSync(workspacePath)
      ? readFileSync(workspacePath, "utf8")
      : "";
    const sourcePanel = existsSync(sourcePanelPath)
      ? readFileSync(sourcePanelPath, "utf8")
      : "";

    expect(workspace).toContain('t("editor.visual")');
    expect(workspace).toContain("LaTeX");
    expect(workspace).toContain("draftLatex");
    expect(sourcePanel).toContain("textarea");
    expect(sourcePanel).toContain("Áp dụng");
  });

  it("routes the desktop center region through EditorWorkspace", () => {
    const desktop = readFileSync(desktopWorkspacePath, "utf8");
    expect(desktop).toContain("<EditorWorkspace");
  });
});
