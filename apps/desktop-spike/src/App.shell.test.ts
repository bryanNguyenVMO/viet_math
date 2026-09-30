import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const appPath = fileURLToPath(new URL("./App.tsx", import.meta.url));

describe("VietMath desktop shell", () => {
  it("contains the four primary productivity regions", () => {
    const source = existsSync(appPath) ? readFileSync(appPath, "utf8") : "";

    expect(source).toContain('aria-label="VietMath toolbar"');
    expect(source).toContain('aria-label="Formula library"');
    expect(source).toContain('aria-label="Equation editor"');
    expect(source).toContain('aria-label="Symbol palette"');
  });
});
