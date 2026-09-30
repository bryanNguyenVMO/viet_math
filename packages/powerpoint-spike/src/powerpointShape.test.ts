import { describe, expect, it, vi } from "vitest";

import {
  POWERPOINT_SOURCE_TAG,
  buildBindingId,
  decodePowerPointMetadata,
  duplicateEquationMetadata,
  encodePowerPointMetadata,
  updateEquationShape,
  type PowerPointEquationMetadata,
  type PowerPointShapePort,
  type ShapeGeometry,
} from "./index";

const geometry: ShapeGeometry = {
  left: 30,
  top: 100,
  width: 240,
  height: 80,
  rotation: 12,
};

const metadata: PowerPointEquationMetadata = {
  id: "eq-001",
  schemaVersion: 1,
  latex: String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`,
  revision: 1,
};

function createShapePort(): PowerPointShapePort {
  return {
    getGeometry: vi.fn(async () => geometry),
    setImage: vi.fn(async () => undefined),
    setTag: vi.fn(async () => undefined),
  };
}

describe("PowerPoint Phase 0 shape strategy", () => {
  it("encodes and decodes VietMath equation metadata for a shape tag", () => {
    const value = encodePowerPointMetadata(metadata);

    expect(value.startsWith("v1:")).toBe(true);
    expect(decodePowerPointMetadata(value)).toEqual(metadata);
  });

  it("uses a stable binding id derived from the VietMath object id", () => {
    expect(buildBindingId("eq-001")).toBe("vietmath:eq-001");
  });

  it("updates only the image and metadata, preserving existing geometry", async () => {
    const port = createShapePort();
    const next = { ...metadata, latex: String.raw`x^2+y^2=z^2`, revision: 2 };

    const result = await updateEquationShape(
      port,
      "BASE64_IMAGE",
      next,
    );

    expect(result).toEqual({ ok: true, geometry });
    expect(port.getGeometry).toHaveBeenCalledOnce();
    expect(port.setImage).toHaveBeenCalledWith("BASE64_IMAGE");
    expect(port.setTag).toHaveBeenCalledWith(
      POWERPOINT_SOURCE_TAG,
      encodePowerPointMetadata(next),
    );
  });

  it("assigns a new VietMath id when an equation shape is duplicated", () => {
    const copy = duplicateEquationMetadata(metadata, "eq-002");

    expect(copy).toEqual({
      ...metadata,
      id: "eq-002",
      revision: 1,
    });
    expect(buildBindingId(copy.id)).not.toBe(buildBindingId(metadata.id));
  });

  it("returns a typed failure without changing metadata revision in memory", async () => {
    const port: PowerPointShapePort = {
      getGeometry: vi.fn(async () => geometry),
      setImage: vi.fn(async () => {
        throw new Error("shape deleted");
      }),
      setTag: vi.fn(async () => undefined),
    };
    const next = { ...metadata, revision: 2 };

    const result = await updateEquationShape(port, "BASE64_IMAGE", next);

    expect(result).toEqual({
      ok: false,
      code: "POWERPOINT_UPDATE_FAILED",
      message: "shape deleted",
    });
    expect(next.revision).toBe(2);
    expect(port.setTag).not.toHaveBeenCalled();
  });
});
