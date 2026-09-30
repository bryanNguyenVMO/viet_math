export type ShapeGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
};

export type PowerPointEquationMetadata = {
  id: string;
  schemaVersion: 1;
  latex: string;
  revision: number;
};

export interface PowerPointShapePort {
  getGeometry(): Promise<ShapeGeometry>;
  setImage(base64Image: string): Promise<void>;
  setTag(key: string, value: string): Promise<void>;
}

export type PowerPointUpdateResult =
  | { ok: true; geometry: ShapeGeometry }
  | {
      ok: false;
      code: "POWERPOINT_UPDATE_FAILED";
      message: string;
    };
