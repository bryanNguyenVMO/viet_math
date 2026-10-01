import {
  commitEquationLatex,
  stageEquationDraft,
  type EquationDocument,
} from "@vietmath/equation-model";
import type { VietMathEditor } from "@vietmath/editor";
import { createTranslator, type Locale } from "@vietmath/i18n";
import {
  createDraftAutosave,
  type DraftRepository,
} from "@vietmath/storage";
import {
  createUserError,
  type UserError,
} from "@vietmath/shared";
import { Button } from "@vietmath/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorNotice } from "../errors/ErrorNotice";
import { LatexSourcePanel } from "./LatexSourcePanel";
import { MathEditorSurface } from "./MathEditorSurface";

type EditorWorkspaceProps = {
  initialLatex: string;
  locale: Locale;
  storage: DraftRepository;
  autosaveDelay: number;
  onEditorReady: (editor: VietMathEditor | null) => void;
};

type EditorViewMode = "visual" | "latex";

const DRAFT_KEY = "current";

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
  locale,
  storage,
  autosaveDelay,
  onEditorReady,
}: EditorWorkspaceProps) {
  const [mode, setMode] = useState<EditorViewMode>("visual");
  const [editor, setEditor] = useState<VietMathEditor | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [userError, setUserError] = useState<UserError | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [recoveredDocument, setRecoveredDocument] =
    useState<EquationDocument | null>(null);
  const [document, setDocument] = useState<EquationDocument>({
    schemaVersion: 1,
    latex: initialLatex,
    displayMode: "block",
    style: {},
  });
  const autosave = useMemo(
    () => createDraftAutosave(storage, DRAFT_KEY, autosaveDelay),
    [autosaveDelay, storage],
  );
  const { t } = createTranslator(locale);

  useEffect(() => {
    let disposed = false;

    storage
      .load(DRAFT_KEY)
      .then((recovered) => {
        if (disposed) return;
        if (recovered) setRecoveredDocument(recovered);
        else setStorageReady(true);
      })
      .catch((error) => {
        if (!disposed) {
          setUserError(createUserError("RECOVERY_FAILED", error));
          setStorageReady(true);
        }
      });

    return () => {
      disposed = true;
    };
  }, [storage]);

  useEffect(() => {
    if (storageReady) autosave.schedule(document);
  }, [autosave, document, storageReady]);

  useEffect(
    () => () => {
      void autosave.flush();
    },
    [autosave],
  );

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

  const restoreRecovered = useCallback(() => {
    if (!recoveredDocument) return;

    setDocument(recoveredDocument);
    editor?.setLatex(recoveredDocument.latex);
    if (recoveredDocument.draftLatex) setMode("latex");
    setRecoveredDocument(null);
    setStorageReady(true);
  }, [editor, recoveredDocument]);

  const discardRecovered = useCallback(async () => {
    try {
      await storage.clear(DRAFT_KEY);
      setRecoveredDocument(null);
      setStorageReady(true);
      setUserError(null);
    } catch (error) {
      setUserError(createUserError("STORAGE_FAILED", error));
    }
  }, [storage]);

  const sourceValue = document.draftLatex ?? document.latex;

  return (
    <div className="vm-editor-workspace">
      <ErrorNotice
        error={userError}
        locale={locale}
        onDismiss={() => setUserError(null)}
      />
      {recoveredDocument ? (
        <div className="vm-recovery-banner" role="status">
          <span>{t("recovery.message")}</span>
          <div className="vm-recovery-actions">
            <Button variant="primary" onClick={restoreRecovered}>
              {t("recovery.restore")}
            </Button>
            <Button variant="ghost" onClick={() => void discardRecovered()}>
              {t("recovery.discard")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="vm-editor-tabs" role="tablist" aria-label="Chế độ soạn thảo">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "visual"}
          className={mode === "visual" ? "is-active" : undefined}
          onClick={() => setMode("visual")}
        >
          {t("editor.visual")}
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
