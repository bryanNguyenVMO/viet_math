import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const workspacePath = fileURLToPath(
  new URL("../../apps/desktop/src/layout/DesktopWorkspace.tsx", import.meta.url),
);

describe("workspace layout persistence", () => {
  it("loads and persists panel width and collapse state", () => {
    const source = readFileSync(workspacePath, "utf8");

    expect(source).toContain('WORKSPACE_LAYOUT_KEY = "workspace-layout-v1"');
    expect(source).toContain("parseWorkspaceLayout");
    expect(source).toContain("storage.get(WORKSPACE_LAYOUT_KEY)");
    expect(source).toContain("storage.set(WORKSPACE_LAYOUT_KEY");
    expect(source).toContain("leftWidth");
    expect(source).toContain("rightWidth");
    expect(source).toContain("leftCollapsed");
    expect(source).toContain("rightCollapsed");
  });

  it("clamps restored widths to safe desktop bounds", () => {
    const source = readFileSync(workspacePath, "utf8");

    expect(source).toContain("clamp(value.leftWidth, MIN_LEFT, MAX_LEFT)");
    expect(source).toContain("clamp(value.rightWidth, MIN_RIGHT, MAX_RIGHT)");
  });
});
