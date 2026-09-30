import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const noticePath = fileURLToPath(
  new URL("../../apps/desktop/src/errors/ErrorNotice.tsx", import.meta.url),
);
const editorPath = fileURLToPath(
  new URL("../../apps/desktop/src/editor/EditorWorkspace.tsx", import.meta.url),
);

describe("Phase 1 error and recovery UX", () => {
  it("renders a reusable user-safe error notice", () => {
    const source = existsSync(noticePath) ? readFileSync(noticePath, "utf8") : "";

    expect(source).toContain("ErrorNotice");
    expect(source).toContain("errorMessage");
    expect(source).toContain('role="status"');
  });

  it("keeps editor source while reporting storage and recovery failures", () => {
    const source = readFileSync(editorPath, "utf8");

    expect(source).toContain("STORAGE_FAILED");
    expect(source).toContain("RECOVERY_FAILED");
    expect(source).toContain("<ErrorNotice");
    expect(source).toContain("setDocument");
  });
});
