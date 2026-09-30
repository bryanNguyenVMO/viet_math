import type { ClipboardPort, ClipboardResult } from "./types";

export class ClipboardService {
  constructor(private readonly port: ClipboardPort) {}

  async copyLatex(latex: string): Promise<ClipboardResult> {
    return this.write(() => this.port.writeText(latex));
  }

  async copyPng(png: Uint8Array): Promise<ClipboardResult> {
    return this.write(() => this.port.writeBlob("image/png", png));
  }

  async copySvg(svg: string): Promise<ClipboardResult> {
    return this.write(() => this.port.writeBlob("image/svg+xml", svg));
  }

  private async write(operation: () => Promise<void>): Promise<ClipboardResult> {
    try {
      await operation();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        code: "CLIPBOARD_WRITE_FAILED",
        message: error instanceof Error ? error.message : "Clipboard write failed",
      };
    }
  }
}
