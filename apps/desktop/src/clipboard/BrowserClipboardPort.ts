import type { ClipboardPort } from "@vietmath/shared";

export class BrowserClipboardPort implements ClipboardPort {
  async writeText(text: string): Promise<void> {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Text clipboard is unavailable");
    }

    await navigator.clipboard.writeText(text);
  }

  async writeBlob(mimeType: string, data: Uint8Array | string): Promise<void> {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      throw new Error("Rich clipboard is unavailable");
    }

    const payload =
      typeof data === "string"
        ? data
        : new Uint8Array(data).buffer;

    await navigator.clipboard.write([
      new ClipboardItem({
        [mimeType]: new Blob([payload], { type: mimeType }),
      }),
    ]);
  }
}
