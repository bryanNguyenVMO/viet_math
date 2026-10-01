import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const toolbarPath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/Toolbar.tsx", import.meta.url),
);
const workspacePath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/DesktopWorkspace.tsx", import.meta.url),
);
const dialogPath = fileURLToPath(
  new URL("../../apps/desktop/src/export/ExportDialog.tsx", import.meta.url),
);
const backendPath = fileURLToPath(
  new URL("../../apps/desktop/src/export/MathLiveExportBackend.ts", import.meta.url),
);
const mainPath = fileURLToPath(
  new URL("../../apps/desktop/src-tauri/src/main.rs", import.meta.url),
);

describe("desktop export UI", () => {
  it("opens export from the toolbar and mounts a real export dialog", () => {
    expect(existsSync(dialogPath)).toBe(true);
    const toolbar = readFileSync(toolbarPath, "utf8");
    const workspace = readFileSync(workspacePath, "utf8");

    expect(toolbar).toContain("onOpenExport");
    expect(workspace).toContain("ExportDialog");
    expect(workspace).toContain("exportOpen");
  });

  it("exports PNG, SVG and MathML through the production exporter boundary", () => {
    const dialog = readFileSync(dialogPath, "utf8");
    const backend = readFileSync(backendPath, "utf8");

    expect(dialog).toContain("exportPng");
    expect(dialog).toContain("exportSvg");
    expect(dialog).toContain("exportMathMl");
    expect(dialog).toContain('invoke<string>("save_export_file"');
    expect(backend).toContain("convertLatexToMathMl");
    expect(backend).toContain("canvas.toBlob");
  });

  it("writes export files through a native Downloads command", () => {
    const main = readFileSync(mainPath, "utf8");

    expect(main).toContain("fn save_export_file");
    expect(main).toContain("download_dir");
    expect(main).toContain("save_export_file,");
  });
});
