import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const workflowPath = fileURLToPath(
  new URL("../../.github/workflows/alpha-release.yml", import.meta.url),
);

describe("Phase 1 alpha installer workflow", () => {
  it("builds frontend assets before installable Windows and macOS bundles", () => {
    expect(existsSync(workflowPath)).toBe(true);
    const source = readFileSync(workflowPath, "utf8");

    expect(source).toContain("workflow_dispatch");
    expect(source).toContain("bundle: nsis");
    expect(source).toContain("bundle: dmg");
    expect(source).toContain("pnpm build");
    expect(source).toContain("tauri build --bundles ${{ matrix.bundle }}");
    expect(source).toContain("vietmath-windows-installer");
    expect(source).toContain("vietmath-macos-installer");
  });
});
