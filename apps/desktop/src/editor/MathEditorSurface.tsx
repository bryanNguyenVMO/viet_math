import {
  ImeCompositionGuard,
  MathLiveAdapter,
  type EditorSelection,
  type MathLivePort,
  type VietMathEditor,
} from "@vietmath/editor";
import { MathfieldElement } from "mathlive";
import "mathlive/fonts.css";
import { useEffect, useRef, useState } from "react";

type MathEditorSurfaceProps = {
  initialLatex: string;
  onReady: (editor: VietMathEditor | null) => void;
};

function createMathLivePort(mathfield: MathfieldElement): MathLivePort {
  return {
    getValue: () => mathfield.getValue("latex"),
    setValue: (value) => mathfield.setValue(value),
    insert: (value, options) => mathfield.insert(value, options),
    focus: () => mathfield.focus(),
    executeCommand: (command) => mathfield.executeCommand(command as never),
    getSelection: (): EditorSelection => ({
      ranges: mathfield.selection.ranges.map(([start, end]) => [start, end] as const),
      direction: mathfield.selection.direction,
    }),
    setMode: (mode) => {
      mathfield.mode = mode;
    },
    subscribe: (listener) => {
      const handleInput = () => listener();
      mathfield.addEventListener("input", handleInput);
      return () => mathfield.removeEventListener("input", handleInput);
    },
  };
}

export function MathEditorSurface({
  initialLatex,
  onReady,
}: MathEditorSurfaceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [latex, setLatex] = useState(initialLatex);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const mathfield = new MathfieldElement();
    const imeGuard = new ImeCompositionGuard();

    mathfield.value = initialLatex;
    mathfield.setAttribute("aria-label", "Nhập công thức toán");
    mathfield.setAttribute("smart-fence", "");

    const editor = new MathLiveAdapter(createMathLivePort(mathfield));
    const unsubscribe = editor.subscribe(setLatex);

    const handleCompositionStart = () => {
      imeGuard.startComposition();
      mathfield.dataset.imeComposing = "true";
    };
    const handleCompositionEnd = () => {
      imeGuard.endComposition();
      mathfield.dataset.imeComposing = "false";
    };

    mathfield.addEventListener("compositionstart", handleCompositionStart);
    mathfield.addEventListener("compositionend", handleCompositionEnd);

    mount.replaceChildren(mathfield);
    onReady(editor);
    setLatex(editor.getLatex());

    return () => {
      unsubscribe();
      mathfield.removeEventListener("compositionstart", handleCompositionStart);
      mathfield.removeEventListener("compositionend", handleCompositionEnd);
      mathfield.remove();
      onReady(null);
    };
  }, [initialLatex, onReady]);

  return (
    <div className="vm-editor-surface">
      <div className="vm-mathfield-shell">
        <div className="vm-mathfield-mount" ref={mountRef} />
      </div>
      <code className="vm-latex-readout">{latex}</code>
    </div>
  );
}
