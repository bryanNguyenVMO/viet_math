import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

function read(path: string): string {
  const fullPath = join(repoRoot, path);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

describe("production MathLive desktop integration", () => {
  it("mounts MathLive behind the production VietMath adapter", () => {
    const surface = read("apps/desktop/src/editor/MathEditorSurface.tsx");

    expect(surface).toContain('from "mathlive"');
    expect(surface).toContain('from "@vietmath/editor"');
    expect(surface).toContain("new MathLiveAdapter");
    expect(surface).toContain("ImeCompositionGuard");
    expect(surface).toContain('"compositionstart"');
    expect(surface).toContain('"compositionend"');
  });

  it("keeps MathLive mounted behind the production editor workspace", () => {
    const desktop = read("apps/desktop/src/layout/DesktopWorkspace.tsx");
    const editorWorkspace = read("apps/desktop/src/editor/EditorWorkspace.tsx");

    expect(desktop).toContain("<EditorWorkspace");
    expect(editorWorkspace).toContain("<MathEditorSurface");
  });

  it("routes structure/history toolbar actions through VietMathEditor", () => {
    const toolbar = read("apps/desktop/src/layout/Toolbar.tsx");

    expect(toolbar).toContain("VietMathEditor");
    expect(toolbar).toContain("STRUCTURE_TEMPLATES");
    expect(toolbar).toContain("insertLatex");
    expect(toolbar).toContain(".undo()");
    expect(toolbar).toContain(".redo()");
  });
});
