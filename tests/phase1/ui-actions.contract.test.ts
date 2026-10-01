import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const toolbarPath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/Toolbar.tsx", import.meta.url),
);
const libraryPath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/LibraryPanel.tsx", import.meta.url),
);
const workspacePath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/DesktopWorkspace.tsx", import.meta.url),
);
const helpPath = fileURLToPath(
  new URL("../../apps/desktop/src/help/HelpDialog.tsx", import.meta.url),
);

describe("Phase 1 primary UI actions", () => {
  it("wires copy, settings, and help actions in the toolbar", () => {
    const source = readFileSync(toolbarPath, "utf8");

    expect(source).toContain("ClipboardService");
    expect(source).toContain("copyLatex");
    expect(source).toContain("onOpenSettings");
    expect(source).toContain("onOpenHelp");
    expect(source).toMatch(/onClick=.*copy/u);
  });

  it("makes formula-library search and equation cards interactive", () => {
    const source = readFileSync(libraryPath, "utf8");

    expect(source).toContain("useState");
    expect(source).toContain("normalizeVietnameseSearch");
    expect(source).toContain("value={query}");
    expect(source).toContain("onChange=");
    expect(source).toContain("editor?.setLatex");
    expect(source).toContain("onClick=");
  });

  it("provides an actual Help dialog and opens it from the workspace", () => {
    expect(existsSync(helpPath)).toBe(true);

    const workspace = readFileSync(workspacePath, "utf8");
    expect(workspace).toContain("HelpDialog");
    expect(workspace).toContain("helpOpen");
    expect(workspace).toContain("onOpenHelp");
  });

  it("persists titlebar locale changes through the settings repository", () => {
    const workspace = readFileSync(workspacePath, "utf8");

    expect(workspace).toContain("changeLocale");
    expect(workspace).toContain("storage.set(SETTINGS_KEY");
    expect(workspace).toMatch(/onClick=.*changeLocale/u);
  });
});
