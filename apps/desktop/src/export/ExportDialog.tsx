import type { VietMathEditor } from "@vietmath/editor";
import type { EquationDocument } from "@vietmath/equation-model";
import { exportMathMl, exportPng, exportSvg } from "@vietmath/exporters";
import { createTranslator, type Locale } from "@vietmath/i18n";
import type { AppSettings } from "@vietmath/shared";
import { Button } from "@vietmath/ui";
import { invoke } from "@tauri-apps/api/core";
import { FileCode2, FileImage, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { MathLiveExportBackend } from "./MathLiveExportBackend";

type ExportFormat = "png" | "svg" | "mathml";

type ExportDialogProps = {
  open: boolean;
  editor: VietMathEditor | null;
  settings: AppSettings;
  locale: Locale;
  onClose: () => void;
};

function filename(format: ExportFormat) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `vietmath-${stamp}.${format === "mathml" ? "mml" : format}`;
}

async function saveExportFile(name: string, data: Uint8Array) {
  return invoke<string>("save_export_file", {
    filename: name,
    bytes: Array.from(data),
  });
}

function textBytes(value: string) {
  return new TextEncoder().encode(value);
}

export function ExportDialog({
  open,
  editor,
  settings,
  locale,
  onClose,
}: ExportDialogProps) {
  const { t } = createTranslator(locale);
  const backend = useMemo(() => new MathLiveExportBackend(), []);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!open) return;
    setStatus("");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const runExport = async (format: ExportFormat) => {
    if (!editor) return;

    setBusy(format);
    setStatus("");

    const equation: EquationDocument = {
      schemaVersion: 1,
      latex: editor.getLatex(),
      displayMode: "block",
      style: {},
    };

    try {
      let data: Uint8Array;

      if (format === "png") {
        const result = await exportPng(equation, backend, {
          scale: settings.exportScale,
          background: settings.exportBackground,
          color: "#000000",
        });
        if (!result.ok) throw new Error(result.message);
        data = result.data;
      } else if (format === "svg") {
        const result = exportSvg(equation, backend, {
          background: settings.exportBackground,
          color: "#000000",
        });
        if (!result.ok) throw new Error(result.message);
        data = textBytes(result.data);
      } else {
        const result = exportMathMl(equation, backend);
        if (!result.ok) throw new Error(result.message);
        data = textBytes(result.data);
      }

      const path = await saveExportFile(filename(format), data);
      setStatus(`${t("export.saved")} ${path}`);
    } catch {
      setStatus(t("export.failed"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="vm-settings-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="vm-settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("export.title")}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="vm-settings-header">
          <h2>{t("export.title")}</h2>
          <button type="button" aria-label={t("export.close")} onClick={onClose}>×</button>
        </header>

        <div className="vm-export-content">
          <p>{t("export.description")}</p>
          <div className="vm-export-grid">
            <Button
              variant="primary"
              disabled={!editor || busy !== null}
              onClick={() => void runExport("png")}
            >
              <ImageIcon size={16} /> PNG
            </Button>
            <Button
              disabled={!editor || busy !== null}
              onClick={() => void runExport("svg")}
            >
              <FileImage size={16} /> SVG
            </Button>
            <Button
              disabled={!editor || busy !== null}
              onClick={() => void runExport("mathml")}
            >
              <FileCode2 size={16} /> MathML
            </Button>
          </div>
          <p className="vm-export-hint">
            {t("export.options")} {settings.exportScale}x · {settings.exportBackground}
          </p>
          {status ? <p className="vm-export-status" role="status">{status}</p> : null}
        </div>

        <footer className="vm-settings-footer">
          <button type="button" onClick={onClose}>{t("export.close")}</button>
        </footer>
      </section>
    </div>
  );
}
