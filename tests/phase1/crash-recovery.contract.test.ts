import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

function read(path: string): string {
  const fullPath = join(repoRoot, path);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

describe("Phase 1 crash recovery integration", () => {
  it("provides a Tauri storage adapter over the native commands", () => {
    const source = read("apps/desktop/src/storage/TauriStorage.ts");

    expect(source).toContain('"save_draft"');
    expect(source).toContain('"load_draft"');
    expect(source).toContain('"clear_draft"');
    expect(source).toContain("serializeEquation");
    expect(source).toContain("deserializeEquation");
  });

  it("loads a previous draft before autosaving and offers an explicit recovery choice", () => {
    const workspace = read("apps/desktop/src/editor/EditorWorkspace.tsx");
    const desktop = read("apps/desktop/src/layout/DesktopWorkspace.tsx");

    expect(desktop).toContain("TauriStorage");
    expect(desktop).toContain("storage={storage}");
    expect(workspace).toContain("createDraftAutosave");
    expect(workspace).toContain("recoveredDocument");
    expect(workspace).toContain("recovery.restore");
    expect(workspace).toContain("recovery.discard");
  });
});
