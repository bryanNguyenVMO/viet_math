import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const desktopRoot = join(repoRoot, "apps", "desktop");

function read(path: string): string {
  const fullPath = join(repoRoot, path);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

function collectSourceFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];

  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return collectSourceFiles(path);
    return /\.(ts|tsx|js|jsx)$/u.test(name) ? [path] : [];
  });
}

describe("Phase 1 production desktop structure", () => {
  it("creates a standalone production desktop app", () => {
    expect(existsSync(join(desktopRoot, "package.json"))).toBe(true);
    expect(existsSync(join(desktopRoot, "src", "main.tsx"))).toBe(true);
    expect(existsSync(join(desktopRoot, "src-tauri", "tauri.conf.json"))).toBe(true);

    const packageJson = JSON.parse(read("apps/desktop/package.json"));
    expect(packageJson.name).toBe("@vietmath/desktop");
    expect(packageJson.scripts).toMatchObject({
      dev: "vite",
      build: expect.any(String),
      tauri: "tauri",
    });
  });

  it("does not make production source depend on Phase 0 spike apps", () => {
    const sourceFiles = collectSourceFiles(join(desktopRoot, "src"));
    const combined = sourceFiles.map((path) => readFileSync(path, "utf8")).join("\n");

    expect(combined).not.toContain("desktop-spike");
    expect(combined).not.toContain("word-addin-spike");
    expect(combined).not.toContain("powerpoint-addin-spike");
  });

  it("gives the root workspace production desktop commands", () => {
    const rootPackage = JSON.parse(read("package.json"));

    expect(rootPackage.scripts).toMatchObject({
      dev: "pnpm --filter @vietmath/desktop dev",
      build: "pnpm --filter @vietmath/desktop build",
      "tauri:build": "pnpm --filter @vietmath/desktop tauri build --debug",
    });
  });
});
