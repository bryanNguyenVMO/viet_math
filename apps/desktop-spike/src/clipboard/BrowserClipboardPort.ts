import type { ClipboardPort } from "../../../../packages/clipboard-spike/src";

export class BrowserClipboardPort implements ClipboardPort {
  async writeText(text: string): Promise<void> {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Text clipboard is not available in this WebView");
    }

    await navigator.clipboard.writeText(text);
  }

  async writeBlob(mimeType: string, data: Uint8Array | string): Promise<void> {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      throw new Error("Rich clipboard is not available in this WebView");
    }

    let blobData: BlobPart;
    if (typeof data === "string") {
      blobData = data;
    } else {
      const copy = new Uint8Array(data.byteLength);
      copy.set(data);
      blobData = copy.buffer;
    }

    const blob = new Blob([blobData], { type: mimeType });
    const item = new ClipboardItem({ [mimeType]: blob });

    await navigator.clipboard.write([item]);
  }
}
