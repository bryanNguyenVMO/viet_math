import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const componentPath = fileURLToPath(
  new URL("./MathEditorSpike.tsx", import.meta.url),
);
const appPath = fileURLToPath(new URL("./App.tsx", import.meta.url));

describe("MathLive desktop integration contract", () => {
  it("uses the local MathLive package behind the VietMath adapter", () => {
    const source = existsSync(componentPath)
      ? readFileSync(componentPath, "utf8")
      : "";

    expect(source).toContain('from "mathlive"');
    expect(source).toContain('import "mathlive/fonts.css"');
    expect(source).toContain("new MathLiveAdapter");
  });

  it("mounts the real editor and routes structure buttons through insertLatex", () => {
    const app = readFileSync(appPath, "utf8");

    expect(app).toContain("<MathEditorSpike");
    expect(app).toContain("insertLatex");
  });

  it("tracks IME composition at the MathLive boundary", () => {
    const source = readFileSync(componentPath, "utf8");

    expect(source).toContain("ImeCompositionGuard");
    expect(source).toContain('"compositionstart"');
    expect(source).toContain('"compositionend"');
  });
});
