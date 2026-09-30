import {
  POWERPOINT_SOURCE_TAG,
  encodePowerPointMetadata,
} from "./metadata";
import type {
  PowerPointEquationMetadata,
  PowerPointShapePort,
  PowerPointUpdateResult,
} from "./types";

export async function updateEquationShape(
  shape: PowerPointShapePort,
  base64Image: string,
  metadata: PowerPointEquationMetadata,
): Promise<PowerPointUpdateResult> {
  try {
    const geometry = await shape.getGeometry();

    await shape.setImage(base64Image);
    await shape.setTag(
      POWERPOINT_SOURCE_TAG,
      encodePowerPointMetadata(metadata),
    );

    return { ok: true, geometry };
  } catch (error) {
    return {
      ok: false,
      code: "POWERPOINT_UPDATE_FAILED",
      message:
        error instanceof Error ? error.message : "PowerPoint update failed",
    };
  }
}
