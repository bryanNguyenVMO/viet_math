import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const manifestPath = fileURLToPath(new URL("./manifest.xml", import.meta.url));

describe("PowerPoint Phase 0 sideload harness", () => {
  it("has a task pane manifest targeting PowerPoint localhost", () => {
    const manifest = existsSync(manifestPath) ? readFileSync(manifestPath, "utf8") : "";

    expect(manifest).toContain('xsi:type="TaskPaneApp"');
    expect(manifest).toContain('<Host Name="Presentation"');
    expect(manifest).toContain('https://localhost:3000/apps/powerpoint-addin-spike/taskpane.html');
    expect(manifest).toContain("<Permissions>ReadWriteDocument</Permissions>");
  });
});
