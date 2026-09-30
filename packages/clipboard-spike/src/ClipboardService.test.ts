import { describe, expect, it, vi } from "vitest";

import { ClipboardService, type ClipboardPort } from "./index";

function createPort(): ClipboardPort {
  return {
    writeText: vi.fn(async () => undefined),
    writeBlob: vi.fn(async () => undefined),
  };
}

describe("ClipboardService", () => {
  it("copies raw LaTeX as explicit text", async () => {
    const port = createPort();
    const service = new ClipboardService(port);

    const result = await service.copyLatex(String.raw`\frac{a}{b}`);

    expect(result).toEqual({ ok: true });
    expect(port.writeText).toHaveBeenCalledWith(String.raw`\frac{a}{b}`);
  });

  it("copies PNG bytes with an image/png MIME type", async () => {
    const port = createPort();
    const service = new ClipboardService(port);
    const png = new Uint8Array([137, 80, 78, 71]);

    const result = await service.copyPng(png);

    expect(result).toEqual({ ok: true });
    expect(port.writeBlob).toHaveBeenCalledWith("image/png", png);
  });

  it("keeps SVG as an explicit MIME payload", async () => {
    const port = createPort();
    const service = new ClipboardService(port);

    const result = await service.copySvg("<svg />");

    expect(result).toEqual({ ok: true });
    expect(port.writeBlob).toHaveBeenCalledWith("image/svg+xml", "<svg />");
  });

  it("returns a typed error when the platform clipboard rejects a format", async () => {
    const port: ClipboardPort = {
      writeText: vi.fn(async () => undefined),
      writeBlob: vi.fn(async () => {
        throw new Error("format not supported");
      }),
    };
    const service = new ClipboardService(port);

    expect(await service.copySvg("<svg />")).toEqual({
      ok: false,
      code: "CLIPBOARD_WRITE_FAILED",
      message: "format not supported",
    });
  });
});
