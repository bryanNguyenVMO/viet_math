import type { PowerPointEquationMetadata } from "./types";

export const POWERPOINT_SOURCE_TAG = "VIETMATH_SOURCE";

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

export function encodePowerPointMetadata(
  metadata: PowerPointEquationMetadata,
): string {
  return "v1:" + toBase64Url(JSON.stringify(metadata));
}

export function decodePowerPointMetadata(
  value: string,
): PowerPointEquationMetadata {
  if (!value.startsWith("v1:")) {
    throw new Error("Unsupported VietMath PowerPoint metadata version");
  }

  const metadata = JSON.parse(
    fromBase64Url(value.slice(3)),
  ) as PowerPointEquationMetadata;

  if (
    metadata.schemaVersion !== 1 ||
    !metadata.id ||
    !metadata.latex ||
    !Number.isInteger(metadata.revision) ||
    metadata.revision < 1
  ) {
    throw new Error("Invalid VietMath PowerPoint metadata");
  }

  return metadata;
}

export function buildBindingId(id: string): string {
  return `vietmath:${id}`;
}

export function duplicateEquationMetadata(
  metadata: PowerPointEquationMetadata,
  newId: string,
): PowerPointEquationMetadata {
  return {
    ...metadata,
    id: newId,
    revision: 1,
  };
}
