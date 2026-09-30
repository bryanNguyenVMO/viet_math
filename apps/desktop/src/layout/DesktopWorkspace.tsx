import type { VietMathEditor } from "@vietmath/editor";
import {
  createTranslator,
  detectInitialLocale,
  type Locale,
} from "@vietmath/i18n";
import { resolveShortcut } from "@vietmath/shared";
import { Sigma } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { EditorWorkspace } from "../editor/EditorWorkspace";
import { TauriStorage } from "../storage/TauriStorage";
import { LibraryPanel } from "./LibraryPanel";
import { SymbolPanel } from "./SymbolPanel";
import { Toolbar } from "./Toolbar";

const MIN_LEFT = 200;
const MAX_LEFT = 420;
const MIN_RIGHT = 220;
const MAX_RIGHT = 420;
const initialLatex = String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function DesktopWorkspace() {
  const [editor, setEditor] = useState<VietMathEditor | null>(null);
  const storage = useMemo(() => new TauriStorage(), []);
  const [locale, setLocale] = useState<Locale>(() => detectInitialLocale());
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(280);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [searchRequestKey, setSearchRequestKey] = useState(0);
  const { t } = createTranslator(locale);

  const handleEditorReady = useCallback((next: VietMathEditor | null) => {
    setEditor(next);
  }, []);

  const startResize = useCallback(
    (side: "left" | "right") => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = side === "left" ? leftWidth : rightWidth;

      const move = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX;
        if (side === "left") {
          setLeftCollapsed(false);
          setLeftWidth(clamp(startWidth + delta, MIN_LEFT, MAX_LEFT));
        } else {
          setRightCollapsed(false);
          setRightWidth(clamp(startWidth - delta, MIN_RIGHT, MAX_RIGHT));
        }
      };

      const stop = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", stop);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop);
    },
    [leftWidth, rightWidth],
  );

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      const action = resolveShortcut({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        isComposing: event.isComposing,
      });

      if (action !== "symbol-search") return;

      event.preventDefault();
      setRightCollapsed(false);
      setSearchRequestKey((value) => value + 1);
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleKey = (side: "left" | "right") => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (side === "left") setLeftCollapsed((value) => !value);
      else setRightCollapsed((value) => !value);
      return;
    }

    const amount = event.shiftKey ? 30 : 10;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      if (side === "left") {
        setLeftCollapsed(false);
        setLeftWidth((value) => clamp(value + direction * amount, MIN_LEFT, MAX_LEFT));
      } else {
        setRightCollapsed(false);
        setRightWidth((value) => clamp(value - direction * amount, MIN_RIGHT, MAX_RIGHT));
      }
    }
  };

  const columns = [
    leftCollapsed ? "0px" : `${leftWidth}px`,
    "12px",
    "minmax(360px, 1fr)",
    "12px",
    rightCollapsed ? "0px" : `${rightWidth}px`,
  ].join(" ");

  return (
    <main className="desktop-workspace">
      <header className="vm-titlebar">
        <div className="vm-brand">
          <span className="vm-brand-mark" aria-hidden="true"><Sigma size={19} /></span>
          <span>{t("app.title")}</span>
        </div>
        <div className="vm-titlebar-actions">
          <div className="vm-locale-switch" aria-label="Language">
            <button
              type="button"
              className={locale === "vi" ? "is-active" : undefined}
              aria-pressed={locale === "vi"}
              onClick={() => setLocale("vi")}
            >
              {t("locale.vi")}
            </button>
            <button
              type="button"
              className={locale === "en" ? "is-active" : undefined}
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
            >
              {t("locale.en")}
            </button>
          </div>
          <span className="vm-panel-eyebrow">{t("app.alpha")}</span>
        </div>
      </header>

      <Toolbar editor={editor} locale={locale} />

      <section className="vm-main-grid" style={{ gridTemplateColumns: columns }}>
        <div className="vm-panel-column" data-collapsed={leftCollapsed}>
          <LibraryPanel />
        </div>
        <button
          type="button"
          className="vm-resize-handle"
          data-resize-handle="left"
          aria-label={leftCollapsed ? t("layout.openLibrary") : t("layout.resizeLibrary")}
          onPointerDown={startResize("left")}
          onKeyDown={handleKey("left")}
        />

        <div className="vm-panel-column">
          <section className="vm-editor-panel" aria-label={t("layout.editor")}>
            <EditorWorkspace
              initialLatex={initialLatex}
              locale={locale}
              storage={storage}
              onEditorReady={handleEditorReady}
            />
          </section>
        </div>

        <button
          type="button"
          className="vm-resize-handle"
          data-resize-handle="right"
          aria-label={rightCollapsed ? t("layout.openSymbols") : t("layout.resizeSymbols")}
          onPointerDown={startResize("right")}
          onKeyDown={handleKey("right")}
        />
        <div className="vm-panel-column" data-collapsed={rightCollapsed}>
          <SymbolPanel
            editor={editor}
            locale={locale}
            searchRequestKey={searchRequestKey}
          />
        </div>
      </section>
    </main>
  );
}
