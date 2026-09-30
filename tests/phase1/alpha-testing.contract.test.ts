import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const scriptPath = fileURLToPath(
  new URL("../../docs/testing/PHASE_1_ALPHA_TEST.md", import.meta.url),
);
const resultPath = fileURLToPath(
  new URL("../../docs/testing/PHASE_1_ALPHA_RESULT_TEMPLATE.md", import.meta.url),
);

describe("Phase 1 alpha user testing kit", () => {
  it("defines task-based testing for 5–10 target users", () => {
    expect(existsSync(scriptPath)).toBe(true);
    const source = readFileSync(scriptPath, "utf8");

    expect(source).toContain("5–10");
    expect(source).toContain("Giáo viên");
    expect(source).toContain("phương trình bậc hai");
    expect(source).toContain("hệ phương trình");
    expect(source).toContain("tiếng Việt");
    expect(source).toContain("Export PNG");
    expect(source).toContain("Task success");
    expect(source).toContain("Time");
  });

  it("provides a repeatable per-tester result template", () => {
    expect(existsSync(resultPath)).toBe(true);
    const source = readFileSync(resultPath, "utf8");

    expect(source).toContain("Tester");
    expect(source).toContain("Task");
    expect(source).toContain("Pass/Fail");
    expect(source).toContain("Thời gian");
    expect(source).toContain("Friction");
  });
});
