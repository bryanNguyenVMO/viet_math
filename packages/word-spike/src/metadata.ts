import type { WordEquationMetadata } from "./types";

const TAG_PREFIX = "vietmath:";

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function encodeWordMetadataTag(metadata: WordEquationMetadata): string {
  return TAG_PREFIX + toBase64Url(JSON.stringify(metadata));
}

export function decodeWordMetadataTag(tag: string): WordEquationMetadata {
  if (!tag.startsWith(TAG_PREFIX)) {
    throw new Error("Not a VietMath Word metadata tag");
  }

  const metadata = JSON.parse(
    fromBase64Url(tag.slice(TAG_PREFIX.length)),
  ) as WordEquationMetadata;

  if (metadata.schemaVersion !== 1 || !metadata.id || !metadata.latex) {
    throw new Error("Invalid VietMath Word metadata");
  }

  return metadata;
}
