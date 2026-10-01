import type { VietMathEditor } from "@vietmath/editor";
import { ClipboardService } from "@vietmath/shared";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BrowserClipboardPort } from "../clipboard/BrowserClipboardPort";
import { MathEditorSurface } from "../editor/MathEditorSurface";

const initialLatex = String.raw`x^2+y^2=z^2`;

export function QuickEditor() {
  const editorRef = useRef<VietMathEditor | null>(null);
  const [latex, setLatex] = useState(initialLatex);
  const [status, setStatus] = useState("");
  const clipboard = useMemo(
    () => new ClipboardService(new BrowserClipboardPort()),
    [],
  );

  const handleReady = useCallback((editor: VietMathEditor | null) => {
    editorRef.current = editor;
    editor?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      void invoke("hide_quick_window");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const copy = useCallback(async () => {
    const result = await clipboard.copyLatex(latex);
    setStatus(result.ok ? "Đã sao chép LaTeX" : result.message);
  }, [clipboard, latex]);

  const openFull = useCallback(async () => {
    await invoke("show_main_window");
    await invoke("hide_quick_window");
  }, []);

  return (
    <main className="vm-quick-editor" aria-label="Quick Editor">
      <header className="vm-quick-header">
        <h1>VietMath Quick Editor</h1>
        <span>Escape để đóng</span>
      </header>

      <section className="vm-quick-surface">
        <MathEditorSurface
          initialLatex={initialLatex}
          onReady={handleReady}
          onLatexChange={setLatex}
        />
      </section>

      <footer className="vm-quick-actions">
        <span role="status">{status}</span>
        <button type="button" onClick={() => void copy()}>Copy LaTeX</button>
        <button type="button" onClick={() => void openFull()}>Mở VietMath</button>
      </footer>
    </main>
  );
}
