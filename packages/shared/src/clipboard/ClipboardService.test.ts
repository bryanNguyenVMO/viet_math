import { describe, expect, it } from "vitest";

import {
  ClipboardService,
  type ClipboardPort,
} from "./index";

function createPort() {
  const calls: Array<{ kind: "text" | "blob"; type?: string; value: unknown }> = [];

  const port: ClipboardPort = {
    async writeText(text) {
      calls.push({ kind: "text", value: text });
    },
    async writeBlob(mimeType, data) {
      calls.push({ kind: "blob", type: mimeType, value: data });
    },
  };

  return { port, calls };
}

describe("production ClipboardService", () => {
  it("copies LaTeX explicitly as plain text", async () => {
    const { port, calls } = createPort();
    const service = new ClipboardService(port);

    expect(await service.copyLatex(String.raw`\\frac{a}{b}`)).toEqual({ ok: true });
    expect(calls).toEqual([
      { kind: "text", value: String.raw`\\frac{a}{b}` },
    ]);
  });

  it("copies MathML with an explicit MathML mime type", async () => {
    const { port, calls } = createPort();
    const service = new ClipboardService(port);

    const mathml = "<math><mi>x</mi></math>";
    expect(await service.copyMathMl(mathml)).toEqual({ ok: true });
    expect(calls[0]).toMatchObject({
      kind: "blob",
      type: "application/mathml+xml",
      value: mathml,
    });
  });

  it("copies PNG bytes with image/png", async () => {
    const { port, calls } = createPort();
    const service = new ClipboardService(port);
    const png = new Uint8Array([137, 80, 78, 71]);

    expect(await service.copyImage(png)).toEqual({ ok: true });
    expect(calls[0]).toMatchObject({
      kind: "blob",
      type: "image/png",
    });
  });

  it("returns a recoverable error instead of throwing clipboard failures", async () => {
    const port: ClipboardPort = {
      async writeText() {
        throw new Error("clipboard denied");
      },
      async writeBlob() {
        throw new Error("clipboard denied");
      },
    };
    const service = new ClipboardService(port);

    expect(await service.copyLatex("x")).toEqual({
      ok: false,
      code: "CLIPBOARD_WRITE_FAILED",
      message: "clipboard denied",
    });
  });
});
