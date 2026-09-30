import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const desktopRoot = join(repoRoot, "apps", "desktop");

function collectSourceFiles(root: string): string[] {
  if (!existsSync(root)) return [];

  const files: string[] = [];
  for (const entry of readdirSync(root)) {
    const fullPath = join(root, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/u.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("Phase 1 production desktop structure", () => {
  it("creates a dedicated @vietmath/desktop production app", () => {
    const packagePath = join(desktopRoot, "package.json");

    expect(existsSync(packagePath)).toBe(true);

    const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
    expect(pkg.name).toBe("@vietmath/desktop");
    expect(pkg.scripts).toMatchObject({
      dev: "vite",
      build: expect.any(String),
      tauri: "tauri",
    });
  });

  it("contains the production Tauri and React entry points", () => {
    for (const relativePath of [
      "index.html",
      "src/main.tsx",
      "src/App.tsx",
      "src-tauri/Cargo.toml",
      "src-tauri/build.rs",
      "src-tauri/tauri.conf.json",
      "src-tauri/src/main.rs",
    ]) {
      expect(existsSync(join(desktopRoot, relativePath))).toBe(true);
    }
  });

  it("does not import Phase 0 desktop-spike code from production source", () => {
    const files = collectSourceFiles(join(desktopRoot, "src"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      expect(readFileSync(file, "utf8")).not.toContain("desktop-spike");
    }
  });
});
