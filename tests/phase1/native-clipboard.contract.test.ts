import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const portPath = fileURLToPath(
  new URL("../../apps/desktop/src/clipboard/BrowserClipboardPort.ts", import.meta.url),
);
const quickPath = fileURLToPath(
  new URL("../../apps/desktop/src/quick/QuickEditor.tsx", import.meta.url),
);
const cargoPath = fileURLToPath(
  new URL("../../apps/desktop/src-tauri/Cargo.toml", import.meta.url),
);
const mainPath = fileURLToPath(
  new URL("../../apps/desktop/src-tauri/src/main.rs", import.meta.url),
);

describe("native desktop clipboard", () => {
  it("writes text through a Tauri command instead of navigator.clipboard", () => {
    const port = readFileSync(portPath, "utf8");

    expect(port).toContain('from "@tauri-apps/api/core"');
    expect(port).toContain('invoke("write_clipboard_text"');
    expect(port).not.toContain("navigator.clipboard?.writeText");
  });

  it("registers the native clipboard command in the Tauri backend", () => {
    const cargo = readFileSync(cargoPath, "utf8");
    const main = readFileSync(mainPath, "utf8");

    expect(cargo).toContain("arboard");
    expect(cargo).toContain('image = { version = "0.25"');
    expect(main).toContain("fn write_clipboard_text");
    expect(main).toContain("fn write_clipboard_image");
    expect(main).toContain("set_image");
    expect(main).toContain("write_clipboard_text,");
    expect(main).toContain("write_clipboard_image,");
  });

  it("routes PNG and MathML through deterministic desktop clipboard paths", () => {
    const port = readFileSync(portPath, "utf8");

    expect(port).toContain('mimeType === "image/png"');
    expect(port).toContain('invoke("write_clipboard_image"');
    expect(port).toContain('mimeType === "application/mathml+xml"');
    expect(port).toContain('invoke("write_clipboard_text"');
  });

  it("uses the same native clipboard port in Quick Editor", () => {
    const quick = readFileSync(quickPath, "utf8");

    expect(quick).toContain("BrowserClipboardPort");
    expect(quick).not.toContain("class BrowserTextClipboardPort");
  });
});
