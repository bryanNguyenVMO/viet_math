import type { ClipboardPort, ClipboardResult } from "./types";

function failure(error: unknown): ClipboardResult {
  return {
    ok: false,
    code: "CLIPBOARD_WRITE_FAILED",
    message: error instanceof Error ? error.message : "Clipboard write failed",
  };
}

export class ClipboardService {
  constructor(private readonly port: ClipboardPort) {}

  async copyLatex(latex: string): Promise<ClipboardResult> {
    try {
      await this.port.writeText(latex);
      return { ok: true };
    } catch (error) {
      return failure(error);
    }
  }

  async copyMathMl(mathml: string): Promise<ClipboardResult> {
    try {
      await this.port.writeBlob("application/mathml+xml", mathml);
      return { ok: true };
    } catch (error) {
      return failure(error);
    }
  }

  async copyImage(png: Uint8Array): Promise<ClipboardResult> {
    try {
      await this.port.writeBlob("image/png", png);
      return { ok: true };
    } catch (error) {
      return failure(error);
    }
  }
}
