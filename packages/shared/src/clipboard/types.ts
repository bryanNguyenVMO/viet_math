export type ClipboardResult =
  | { ok: true }
  | { ok: false; code: "CLIPBOARD_WRITE_FAILED"; message: string };

export interface ClipboardPort {
  writeText(text: string): Promise<void>;
  writeBlob(
    mimeType: string,
    data: Uint8Array | string,
  ): Promise<void>;
}
