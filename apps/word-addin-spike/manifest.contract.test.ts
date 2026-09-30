import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const manifestPath = fileURLToPath(new URL("./manifest.xml", import.meta.url));
const taskpanePath = fileURLToPath(new URL("./taskpane.js", import.meta.url));

describe("Word Phase 0 sideload harness", () => {
  it("has a task pane manifest targeting Word localhost", () => {
    const manifest = existsSync(manifestPath) ? readFileSync(manifestPath, "utf8") : "";

    expect(manifest).toContain('xsi:type="TaskPaneApp"');
    expect(manifest).toContain('<Host Name="Document"');
    expect(manifest).toContain('https://localhost:3000/apps/word-addin-spike/taskpane.html');
    expect(manifest).toContain("<Permissions>ReadWriteDocument</Permissions>");
  });

  it("exercises insert, recover, and update lifecycle actions", () => {
    const source = readFileSync(taskpanePath, "utf8");

    expect(source).toContain("Word.run");
    expect(source).toContain("insertOoxml");
    expect(source).toContain("contentControls");
    expect(source).toContain("recover");
    expect(source).toContain("update");
  });
});
