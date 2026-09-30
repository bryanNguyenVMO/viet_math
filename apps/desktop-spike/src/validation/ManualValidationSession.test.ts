import { describe, expect, it } from "vitest";

import {
  createManualValidationSession,
  setGateResult,
  summarizeManualValidation,
} from "./ManualValidationSession";

describe("manual Phase 0 validation session", () => {
  it("starts with every required manual gate pending on both platforms", () => {
    const session = createManualValidationSession();

    expect(session.schemaVersion).toBe(1);
    expect(session.platforms.windows.ime.status).toBe("pending");
    expect(session.platforms.windows.word.status).toBe("pending");
    expect(session.platforms.macos.powerpoint.status).toBe("pending");
    expect(summarizeManualValidation(session)).toEqual({
      total: 12,
      passed: 0,
      failed: 0,
      pending: 12,
      complete: false,
    });
  });

  it("records a gate result without mutating the previous session", () => {
    const original = createManualValidationSession();
    const updated = setGateResult(original, "windows", "ime", "pass", "UniKey Telex OK");

    expect(original.platforms.windows.ime.status).toBe("pending");
    expect(updated.platforms.windows.ime).toMatchObject({
      status: "pass",
      notes: "UniKey Telex OK",
    });
    expect(summarizeManualValidation(updated).passed).toBe(1);
  });
});
