export type ValidationPlatform = "windows" | "macos";
export type ValidationGate =
  | "ime"
  | "export"
  | "clipboard"
  | "word"
  | "powerpoint"
  | "performance";
export type ValidationStatus = "pending" | "pass" | "fail";

export type ValidationGateResult = {
  status: ValidationStatus;
  notes: string;
};

export type PlatformValidation = Record<ValidationGate, ValidationGateResult>;

export type ManualValidationSession = {
  schemaVersion: 1;
  createdAt: string;
  updatedAt: string;
  platforms: Record<ValidationPlatform, PlatformValidation>;
};

const gateNames: ValidationGate[] = [
  "ime",
  "export",
  "clipboard",
  "word",
  "powerpoint",
  "performance",
];

function emptyPlatform(): PlatformValidation {
  return Object.fromEntries(
    gateNames.map((gate) => [gate, { status: "pending", notes: "" }]),
  ) as PlatformValidation;
}

export function createManualValidationSession(now = new Date()): ManualValidationSession {
  const timestamp = now.toISOString();
  return {
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    platforms: {
      windows: emptyPlatform(),
      macos: emptyPlatform(),
    },
  };
}

export function setGateResult(
  session: ManualValidationSession,
  platform: ValidationPlatform,
  gate: ValidationGate,
  status: ValidationStatus,
  notes: string,
  now = new Date(),
): ManualValidationSession {
  return {
    ...session,
    updatedAt: now.toISOString(),
    platforms: {
      ...session.platforms,
      [platform]: {
        ...session.platforms[platform],
        [gate]: { status, notes },
      },
    },
  };
}

export function summarizeManualValidation(session: ManualValidationSession) {
  const results = Object.values(session.platforms).flatMap((platform) =>
    Object.values(platform),
  );
  const passed = results.filter((result) => result.status === "pass").length;
  const failed = results.filter((result) => result.status === "fail").length;
  const pending = results.filter((result) => result.status === "pending").length;

  return {
    total: results.length,
    passed,
    failed,
    pending,
    complete: pending === 0 && failed === 0,
  };
}
