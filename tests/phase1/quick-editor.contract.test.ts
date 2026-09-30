import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);
const appPath = fileURLToPath(new URL("apps/desktop/src/App.tsx", root));
const quickPath = fileURLToPath(new URL("apps/desktop/src/quick/QuickEditor.tsx", root));
const configPath = fileURLToPath(new URL("apps/desktop/src-tauri/tauri.conf.json", root));
const cargoPath = fileURLToPath(new URL("apps/desktop/src-tauri/Cargo.toml", root));
const rustPath = fileURLToPath(new URL("apps/desktop/src-tauri/src/main.rs", root));

describe("Phase 1 quick editor contract", () => {
  it("routes the quick window to a dedicated lightweight editor surface", () => {
    const app = readFileSync(appPath, "utf8");
    const quick = existsSync(quickPath) ? readFileSync(quickPath, "utf8") : "";

    expect(app).toContain('mode === "quick"');
    expect(app).toContain("<QuickEditor");
    expect(quick).toContain("Quick Editor");
    expect(quick).toContain("Escape");
  });

  it("defines a hidden quick Tauri window and a native global shortcut", () => {
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    const cargo = readFileSync(cargoPath, "utf8");
    const rust = readFileSync(rustPath, "utf8");

    expect(config.app.windows.some((window: { label?: string; visible?: boolean }) =>
      window.label === "quick" && window.visible === false,
    )).toBe(true);
    expect(cargo).toContain("tauri-plugin-global-shortcut");
    expect(rust).toContain("CmdOrCtrl+Shift+M");
    expect(rust).toContain('get_webview_window("quick")');
  });
});
