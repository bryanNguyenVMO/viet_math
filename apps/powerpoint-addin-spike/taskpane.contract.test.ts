import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const taskpanePath = fileURLToPath(
  new URL("./taskpane.js", import.meta.url),
);

describe("PowerPoint host spike contract", () => {
  it("uses a geometric shape with image fill, binding, and VietMath tags", () => {
    const source = existsSync(taskpanePath)
      ? readFileSync(taskpanePath, "utf8")
      : "";

    expect(source).toContain("addGeometricShape");
    expect(source).toContain(".fill.setImage");
    expect(source).toContain(".bindings.add");
    expect(source).toContain(".tags.add");
    expect(source).not.toContain(".shapes.addPicture");
  });

  it("updates an existing bound shape instead of replacing it", () => {
    const source = existsSync(taskpanePath)
      ? readFileSync(taskpanePath, "utf8")
      : "";

    expect(source).toContain(".bindings.getItem");
    expect(source).toContain(".getShape()");
    expect(source).toContain("shape.fill.setImage");
  });
});
