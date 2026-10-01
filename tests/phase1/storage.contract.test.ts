import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

function read(path: string): string {
  const fullPath = join(repoRoot, path);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

describe("Phase 1 production storage contract", () => {
  it("defines VietMath-owned storage ports and production package", () => {
    const pkg = read("packages/storage/package.json");
    const index = read("packages/storage/src/index.ts");

    expect(pkg).toContain('"name": "@vietmath/storage"');
    expect(index).toContain("EquationRepository");
    expect(index).toContain("DraftRepository");
    expect(index).toContain("SettingsRepository");
  });

  it("provides a native SQLite boundary in the production Tauri app", () => {
    const cargo = read("apps/desktop/src-tauri/Cargo.toml");
    const storage = read("apps/desktop/src-tauri/src/storage/mod.rs");
    const desktopPkg = read("apps/desktop/package.json");

    expect(cargo).toContain("rusqlite");
    expect(storage).toContain("PRAGMA user_version");
    expect(storage).toContain("save_draft");
    expect(storage).toContain("load_draft");
    expect(storage).toContain("clear_draft");
    expect(storage).toContain("set_equation_favorite");
    expect(storage).toContain("list_favorite_equations");
    expect(storage).toContain("favorite INTEGER NOT NULL DEFAULT 0");
    expect(desktopPkg).toContain('"@vietmath/storage"');
  });
});
