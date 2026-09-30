import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const workflowPath = fileURLToPath(
  new URL("../../.github/workflows/alpha-release.yml", import.meta.url),
);

describe("Phase 1 alpha installer workflow", () => {
  it("builds installable Windows and macOS artifacts on demand", () => {
    expect(existsSync(workflowPath)).toBe(true);
    const source = readFileSync(workflowPath, "utf8");

    expect(source).toContain("workflow_dispatch");
    expect(source).toContain("--bundles nsis");
    expect(source).toContain("--bundles dmg");
    expect(source).toContain("vietmath-windows-installer");
    expect(source).toContain("vietmath-macos-installer");
  });
});
