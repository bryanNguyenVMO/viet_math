import {
  MathLiveAdapter,
  type MathLivePort,
  type VietMathEditor,
} from "@vietmath/editor-core";
import { MathfieldElement } from "mathlive";
import "mathlive/fonts.css";
import { useEffect, useRef } from "react";

type MathEditorSpikeProps = {
  initialLatex: string;
  onReady: (editor: VietMathEditor | null) => void;
  onLatexChange: (latex: string) => void;
};

function createMathLivePort(mathfield: MathfieldElement): MathLivePort {
  return {
    getValue: (format) => mathfield.getValue(format),
    setValue: (value) => mathfield.setValue(value),
    insert: (value, options) => mathfield.insert(value, options),
    focus: () => mathfield.focus(),
    executeCommand: (command) => mathfield.executeCommand(command),
  };
}

export function MathEditorSpike({
  initialLatex,
  onReady,
  onLatexChange,
}: MathEditorSpikeProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const mathfield = new MathfieldElement();
    mathfield.value = initialLatex;
    mathfield.setAttribute("aria-label", "Nhập công thức toán");
    mathfield.setAttribute("smart-fence", "");

    const editor = new MathLiveAdapter(createMathLivePort(mathfield));
    const handleInput = () => onLatexChange(editor.getLatex());

    mathfield.addEventListener("input", handleInput);
    mount.replaceChildren(mathfield);
    onReady(editor);
    onLatexChange(editor.getLatex());

    return () => {
      mathfield.removeEventListener("input", handleInput);
      mathfield.remove();
      onReady(null);
    };
  }, [initialLatex, onLatexChange, onReady]);

  return (
    <div className="mathfield-shell">
      <div className="mathfield-mount" ref={mountRef} />
      <p className="editor-hint">
        Editor thật đang chạy bằng MathLive qua VietMath adapter.
      </p>
    </div>
  );
}
