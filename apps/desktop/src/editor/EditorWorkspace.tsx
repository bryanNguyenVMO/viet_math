import {
  commitEquationLatex,
  stageEquationDraft,
  type EquationDocument,
} from "@vietmath/equation-model";
import type { VietMathEditor } from "@vietmath/editor";
import { useCallback, useState } from "react";

import { LatexSourcePanel } from "./LatexSourcePanel";
import { MathEditorSurface } from "./MathEditorSurface";

type EditorWorkspaceProps = {
  initialLatex: string;
  onEditorReady: (editor: VietMathEditor | null) => void;
};

type EditorViewMode = "visual" | "latex";

function bracesAreBalanced(value: string): boolean {
  let depth = 0;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const escaped = index > 0 && value[index - 1] === "\\";
    if (escaped) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth < 0) return false;
  }

  return depth === 0;
}

export function EditorWorkspace({
  initialLatex,
  onEditorReady,
}: EditorWorkspaceProps) {
  const [mode, setMode] = useState<EditorViewMode>("visual");
  const [editor, setEditor] = useState<VietMathEditor | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [document, setDocument] = useState<EquationDocument>({
    schemaVersion: 1,
    latex: initialLatex,
    displayMode: "block",
    style: {},
  });

  const handleReady = useCallback(
    (next: VietMathEditor | null) => {
      setEditor(next);
      onEditorReady(next);
    },
    [onEditorReady],
  );

  const handleVisualLatexChange = useCallback((latex: string) => {
    setDocument((current) => commitEquationLatex(current, latex));
    setSourceError(null);
  }, []);

  const handleDraftChange = useCallback((draftLatex: string) => {
    setDocument((current) => stageEquationDraft(current, draftLatex));
    setSourceError(null);
  }, []);

  const applyDraft = useCallback(() => {
    const candidate = document.draftLatex ?? document.latex;

    if (!bracesAreBalanced(candidate)) {
      setSourceError("LaTeX chưa hoàn chỉnh. Nội dung nháp vẫn được giữ nguyên.");
      return;
    }

    if (!editor) {
      setSourceError("Editor chưa sẵn sàng. Hãy thử lại sau.");
      return;
    }

    editor.setLatex(candidate);
    const canonical = editor.getLatex();
    setDocument((current) => commitEquationLatex(current, canonical));
    setSourceError(null);
  }, [document.draftLatex, document.latex, editor]);

  const sourceValue = document.draftLatex ?? document.latex;

  return (
    <div className="vm-editor-workspace">
      <div className="vm-editor-tabs" role="tablist" aria-label="Chế độ soạn thảo">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "visual"}
          className={mode === "visual" ? "is-active" : undefined}
          onClick={() => setMode("visual")}
        >
          Soạn thảo
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "latex"}
          className={mode === "latex" ? "is-active" : undefined}
          onClick={() => setMode("latex")}
        >
          LaTeX
        </button>
      </div>

      <div hidden={mode !== "visual"} className="vm-editor-mode-panel">
        <MathEditorSurface
          initialLatex={initialLatex}
          onReady={handleReady}
          onLatexChange={handleVisualLatexChange}
        />
      </div>

      <div hidden={mode !== "latex"} className="vm-editor-mode-panel">
        <LatexSourcePanel
          value={sourceValue}
          error={sourceError}
          onChange={handleDraftChange}
          onApply={applyDraft}
        />
      </div>
    </div>
  );
}
