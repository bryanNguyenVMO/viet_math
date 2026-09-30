import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const panelPath = fileURLToPath(new URL("./ValidationPanel.tsx", import.meta.url));
const appPath = fileURLToPath(new URL("./App.tsx", import.meta.url));

describe("Phase 0 manual validation UI", () => {
  it("provides the six required closure gates and JSON export", () => {
    const source = existsSync(panelPath) ? readFileSync(panelPath, "utf8") : "";

    expect(source).toContain("Vietnamese IME");
    expect(source).toContain("SVG/PNG fidelity");
    expect(source).toContain("Clipboard");
    expect(source).toContain("Word lifecycle");
    expect(source).toContain("PowerPoint lifecycle");
    expect(source).toContain("Runtime benchmark");
    expect(source).toContain("Export JSON");
  });

  it("is reachable from the desktop shell", () => {
    const app = readFileSync(appPath, "utf8");
    expect(app).toContain("<ValidationPanel");
    expect(app).toContain("Phase 0 Validation");
  });
});
