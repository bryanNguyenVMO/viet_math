import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

function read(path: string): string {
  const fullPath = join(repoRoot, path);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

describe("VietMath design system foundation", () => {
  it("defines semantic light and dark design tokens", () => {
    const tokens = read("packages/ui/src/tokens.css");

    for (const token of [
      "--vm-bg",
      "--vm-surface",
      "--vm-surface-hover",
      "--vm-border",
      "--vm-text",
      "--vm-text-secondary",
      "--vm-primary",
      "--vm-danger",
      "--vm-warning",
      "--vm-success",
      "--vm-radius-sm",
      "--vm-radius-md",
      "--vm-radius-lg",
      "--vm-shadow-sm",
      "--vm-shadow-md",
    ]) {
      expect(tokens).toContain(token);
    }

    expect(tokens).toContain('[data-theme="dark"]');
  });

  it("exports the shared components required by the desktop layout", () => {
    const index = read("packages/ui/src/index.ts");

    for (const component of [
      "Button",
      "IconButton",
      "Panel",
      "SearchInput",
      "EquationCard",
      "SymbolButton",
    ]) {
      expect(index).toContain(component);
    }
  });

  it("keeps feature styling behind VietMath-owned component files", () => {
    for (const file of [
      "Button.tsx",
      "IconButton.tsx",
      "Panel.tsx",
      "SearchInput.tsx",
      "EquationCard.tsx",
      "SymbolButton.tsx",
    ]) {
      expect(existsSync(join(repoRoot, "packages", "ui", "src", "components", file))).toBe(true);
    }
  });
});
