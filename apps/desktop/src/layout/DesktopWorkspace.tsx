import type { VietMathEditor } from "@vietmath/editor";
import { Sigma } from "lucide-react";
import {
  useCallback,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { EditorWorkspace } from "../editor/EditorWorkspace";
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
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(280);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

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

  const handleKey = (side: "left" | "right") => (event: KeyboardEvent<HTMLButtonElement>) => {
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
          <span>VietMath</span>
        </div>
        <span className="vm-panel-eyebrow">Desktop Alpha</span>
      </header>

      <Toolbar editor={editor} />

      <section className="vm-main-grid" style={{ gridTemplateColumns: columns }}>
        <div className="vm-panel-column" data-collapsed={leftCollapsed}>
          <LibraryPanel />
        </div>
        <button
          type="button"
          className="vm-resize-handle"
          data-resize-handle="left"
          aria-label={leftCollapsed ? "Mở thư viện" : "Kéo để đổi kích thước thư viện; Enter để thu gọn"}
          onPointerDown={startResize("left")}
          onKeyDown={handleKey("left")}
        />

        <div className="vm-panel-column">
          <section className="vm-editor-panel" aria-label="Equation editor">
            <EditorWorkspace
              initialLatex={initialLatex}
              onEditorReady={handleEditorReady}
            />
          </section>
        </div>

        <button
          type="button"
          className="vm-resize-handle"
          data-resize-handle="right"
          aria-label={rightCollapsed ? "Mở bảng ký hiệu" : "Kéo để đổi kích thước ký hiệu; Enter để thu gọn"}
          onPointerDown={startResize("right")}
          onKeyDown={handleKey("right")}
        />
        <div className="vm-panel-column" data-collapsed={rightCollapsed}>
          <SymbolPanel />
        </div>
      </section>
    </main>
  );
}
