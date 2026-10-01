import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const settingsPath = fileURLToPath(
  new URL("../../apps/desktop/src/settings/SettingsDialog.tsx", import.meta.url),
);
const workspacePath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/DesktopWorkspace.tsx", import.meta.url),
);

describe("Phase 1 settings and theme UI", () => {
  it("provides a production settings dialog with persisted theme and export preferences", () => {
    const source = existsSync(settingsPath) ? readFileSync(settingsPath, "utf8") : "";

    expect(source).toContain("SettingsDialog");
    expect(source).toContain('theme');
    expect(source).toContain('exportScale');
    expect(source).toContain('exportBackground');
    expect(source).toContain("editorFontSize");
    expect(source).toContain("autosaveDelay");
    expect(source).toContain("recentLimit");
    expect(source).toContain("storage.set");
  });

  it("applies semantic theme state at the desktop root", () => {
    const source = readFileSync(workspacePath, "utf8");

    expect(source).toContain("resolveTheme");
    expect(source).toContain("document.documentElement.dataset.theme");
    expect(source).toContain("<SettingsDialog");
    expect(source).toContain("--vm-editor-font-size");
    expect(source).toContain("settings.autosaveDelay");
    expect(source).toContain("settings.recentLimit");
  });
});
