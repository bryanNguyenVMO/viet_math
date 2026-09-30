import { useMemo, useState } from "react";

import {
  createManualValidationSession,
  setGateResult,
  summarizeManualValidation,
  type ManualValidationSession,
  type ValidationGate,
  type ValidationPlatform,
  type ValidationStatus,
} from "./validation/ManualValidationSession";

type ValidationPanelProps = {
  onClose: () => void;
};

const gates: Array<{
  id: ValidationGate;
  name: string;
  instruction: string;
}> = [
  { id: "ime", name: "Vietnamese IME", instruction: "Telex/VNI: gõ tiếng Việt, phương trình, nếu, với mọi; kiểm tra backspace và undo." },
  { id: "export", name: "SVG/PNG fidelity", instruction: "Kiểm tra căn, dấu mũ, tích phân, ma trận và tiếng Việt không crop; nền trong suốt." },
  { id: "clipboard", name: "Clipboard", instruction: "Copy LaTeX/ảnh và paste vào Word, PowerPoint, input trình duyệt và image editor." },
  { id: "word", name: "Word lifecycle", instruction: "Insert → Save → Close → Reopen → Recover → Edit → Update." },
  { id: "powerpoint", name: "PowerPoint lifecycle", instruction: "Insert → Move/Resize → Save → Reopen → Recover → Update; kiểm tra geometry." },
  { id: "performance", name: "Runtime benchmark", instruction: "Ghi cold start, warm show, RAM idle/typing và cảm nhận latency." },
];

const platforms: Array<{ id: ValidationPlatform; name: string }> = [
  { id: "windows", name: "Windows" },
  { id: "macos", name: "macOS" },
];

function exportSession(session: ManualValidationSession) {
  const blob = new Blob([JSON.stringify(session, null, 2)], {
    type: "application/json",
  });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `vietmath-phase0-validation-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function ValidationPanel({ onClose }: ValidationPanelProps) {
  const [session, setSession] = useState(() => createManualValidationSession());
  const summary = useMemo(() => summarizeManualValidation(session), [session]);

  const update = (
    platform: ValidationPlatform,
    gate: ValidationGate,
    status: ValidationStatus,
    notes?: string,
  ) => {
    const currentNotes = notes ?? session.platforms[platform][gate].notes;
    setSession((current) =>
      setGateResult(current, platform, gate, status, currentNotes),
    );
  };

  return (
    <div className="validation-overlay" role="dialog" aria-modal="true" aria-label="Phase 0 Validation">
      <section className="validation-panel">
        <header className="validation-header">
          <div>
            <h2>Phase 0 Validation</h2>
            <p>Manual closure gates — chạy trên máy và Office thật.</p>
          </div>
          <button className="validation-close" aria-label="Đóng validation" onClick={onClose}>×</button>
        </header>

        <div className="validation-summary">
          <span className="validation-chip">Đạt: {summary.passed}/{summary.total}</span>
          <span className="validation-chip">Lỗi: {summary.failed}</span>
          <span className="validation-chip">Chờ: {summary.pending}</span>
          <p>{summary.complete ? "Có thể xem xét đóng Phase 0." : "Phase 0 chưa đủ điều kiện đóng."}</p>
        </div>

        <div className="validation-grid">
          {platforms.map((platform) => (
            <section className="validation-platform" key={platform.id}>
              <h3>{platform.name}</h3>
              {gates.map((gate) => {
                const result = session.platforms[platform.id][gate.id];
                return (
                  <div className="validation-gate" key={gate.id}>
                    <strong>{gate.name}</strong>
                    <small>{gate.instruction}</small>
                    <div className="validation-status-actions">
                      {(["pass", "fail", "pending"] as ValidationStatus[]).map((status) => (
                        <button
                          key={status}
                          className={result.status === status ? `active-${status}` : ""}
                          onClick={() => update(platform.id, gate.id, status)}
                        >
                          {status === "pass" ? "Đạt" : status === "fail" ? "Lỗi" : "Chờ"}
                        </button>
                      ))}
                    </div>
                    <textarea
                      aria-label={`Ghi chú ${platform.name} ${gate.name}`}
                      placeholder="Ghi phiên bản app/Office, cách test, lỗi hoặc số đo..."
                      value={result.notes}
                      onChange={(event) =>
                        update(platform.id, gate.id, result.status, event.target.value)
                      }
                    />
                  </div>
                );
              })}
            </section>
          ))}
        </div>

        <footer className="validation-footer">
          <button className="validation-export" onClick={() => exportSession(session)}>
            Export JSON
          </button>
        </footer>
      </section>
    </div>
  );
}
