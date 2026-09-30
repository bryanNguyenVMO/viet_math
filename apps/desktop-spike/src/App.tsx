import { STRUCTURE_TEMPLATES, type VietMathEditor } from "@vietmath/editor-core";
import {
  BookOpen,
  ChevronDown,
  Copy,
  MoreHorizontal,
  Redo2,
  Search,
  Settings,
  Sigma,
  Star,
  Undo2,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { MathEditorSpike } from "./MathEditorSpike";
import { ValidationPanel } from "./ValidationPanel";

const initialLatex = String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`;

const recentFormulas = [
  {
    title: "Phương trình bậc hai",
    formula: "x = (-b ± √Δ) / 2a",
    latex: initialLatex,
  },
  {
    title: "Định lý Pythagore",
    formula: "a² + b² = c²",
    latex: String.raw`a^2+b^2=c^2`,
  },
  {
    title: "Tích phân cơ bản",
    formula: "∫₀¹ x² dx",
    latex: String.raw`\int_0^1 x^2\,dx`,
  },
];

const structures = [
  { label: "Phân số", sample: "a/b", latex: STRUCTURE_TEMPLATES.fraction },
  { label: "Căn thức", sample: "√x", latex: STRUCTURE_TEMPLATES.squareRoot },
  { label: "Mũ", sample: "x²", latex: STRUCTURE_TEMPLATES.superscript },
  { label: "Tích phân", sample: "∫", latex: STRUCTURE_TEMPLATES.integral },
  { label: "Tổng", sample: "∑", latex: STRUCTURE_TEMPLATES.summation },
  { label: "Giới hạn", sample: "lim", latex: STRUCTURE_TEMPLATES.limit },
  { label: "Ma trận", sample: "▦", latex: STRUCTURE_TEMPLATES.matrix },
  { label: "Hệ", sample: "{", latex: STRUCTURE_TEMPLATES.cases },
];

const symbols = [
  { label: "π", latex: String.raw`\pi` },
  { label: "∞", latex: String.raw`\infty` },
  { label: "∑", latex: String.raw`\sum` },
  { label: "√", latex: String.raw`\sqrt{}` },
  { label: "α", latex: String.raw`\alpha` },
  { label: "β", latex: String.raw`\beta` },
  { label: "θ", latex: String.raw`\theta` },
  { label: "≈", latex: String.raw`\approx` },
  { label: "≠", latex: String.raw`\ne` },
  { label: "≤", latex: String.raw`\le` },
  { label: "≥", latex: String.raw`\ge` },
  { label: "∈", latex: String.raw`\in` },
];

export function App() {
  const editorRef = useRef<VietMathEditor | null>(null);
  const [latex, setLatex] = useState(initialLatex);
  const [validationOpen, setValidationOpen] = useState(false);

  const handleEditorReady = useCallback((editor: VietMathEditor | null) => {
    editorRef.current = editor;
  }, []);

  const handleLatexChange = useCallback((value: string) => {
    setLatex(value);
  }, []);

  const insertLatex = useCallback((value: string) => {
    editorRef.current?.insertLatex(value);
    editorRef.current?.focus();
  }, []);

  const setEquation = useCallback((value: string) => {
    editorRef.current?.setLatex(value);
    editorRef.current?.focus();
    setLatex(value);
  }, []);

  return (
    <div className="app-shell">
      <header className="titlebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">V</div>
          <div>
            <h1>VietMath</h1>
            <p>Trình soạn công thức toán</p>
          </div>
        </div>
        <div className="title-actions">
          <button className="validation-launch" onClick={() => setValidationOpen(true)}>Phase 0 Validation</button>
          <button className="icon-button" aria-label="Cài đặt"><Settings size={18} /></button>
        </div>
      </header>

      {validationOpen ? <ValidationPanel onClose={() => setValidationOpen(false)} /> : null}

      <nav className="menu-bar" aria-label="Main menu">
        <button>Tệp</button>
        <button>Chỉnh sửa</button>
        <button>Chèn</button>
        <button>Định dạng</button>
        <button>Trợ giúp</button>
      </nav>

      <section className="toolbar" aria-label="VietMath toolbar">
        <div className="tool-group history-tools">
          <button
            className="tool-icon"
            aria-label="Hoàn tác"
            onClick={() => editorRef.current?.undo()}
          >
            <Undo2 size={18} />
          </button>
          <button
            className="tool-icon"
            aria-label="Làm lại"
            onClick={() => editorRef.current?.redo()}
          >
            <Redo2 size={18} />
          </button>
        </div>

        <div className="tool-divider" />

        <div className="structure-tools">
          {structures.map((item) => (
            <button
              className="structure-button"
              key={item.label}
              onClick={() => insertLatex(item.latex)}
            >
              <span className="structure-sample">{item.sample}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <button className="structure-button" aria-label="Thêm cấu trúc">
            <MoreHorizontal size={21} />
            <span>Thêm</span>
          </button>
        </div>

        <div className="tool-spacer" />

        <button className="primary-button" title="Clipboard được triển khai ở Task 6">
          <Copy size={16} />
          Sao chép
          <ChevronDown size={14} />
        </button>
      </section>

      <main className="workspace">
        <aside className="library-panel" aria-label="Formula library">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Thư viện</p>
              <h2>Công thức gần đây</h2>
            </div>
            <BookOpen size={18} />
          </div>

          <label className="search-box">
            <Search size={16} />
            <input aria-label="Tìm công thức" placeholder="Tìm công thức..." />
          </label>

          <div className="formula-list">
            {recentFormulas.map((item) => (
              <button
                className="formula-card"
                key={item.title}
                onClick={() => setEquation(item.latex)}
              >
                <span className="formula-card-title">{item.title}</span>
                <span className="formula-preview">{item.formula}</span>
              </button>
            ))}
          </div>

          <button className="library-link">
            <Star size={16} />
            Yêu thích
          </button>
        </aside>

        <section className="editor-panel" aria-label="Equation editor">
          <div className="editor-topline">
            <div className="segmented-control" aria-label="Chế độ soạn thảo">
              <button className="active">Soạn thảo</button>
              <button>LaTeX</button>
            </div>
            <span className="spike-badge">MathLive spike</span>
          </div>

          <div className="editor-canvas">
            <MathEditorSpike
              initialLatex={initialLatex}
              onReady={handleEditorReady}
              onLatexChange={handleLatexChange}
            />
            <code className="latex-readout">{latex}</code>
          </div>

          <footer className="editor-status">
            <span>MathLive 0.110.0</span>
            <span>Offline bundle</span>
            <span>VietMath adapter</span>
          </footer>
        </section>

        <aside className="symbol-panel" aria-label="Symbol palette">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Ký hiệu</p>
              <h2>Phổ biến</h2>
            </div>
            <Sigma size={18} />
          </div>

          <label className="search-box">
            <Search size={16} />
            <input aria-label="Tìm ký hiệu" placeholder="Tìm ký hiệu..." />
          </label>

          <div className="symbol-grid">
            {symbols.map((symbol) => (
              <button
                key={symbol.label}
                className="symbol-button"
                aria-label={`Ký hiệu ${symbol.label}`}
                onClick={() => insertLatex(symbol.latex)}
              >
                {symbol.label}
              </button>
            ))}
          </div>

          <p className="panel-note">
            Phase 0 dùng glyph label cho panel; structure/editor được render bằng MathLive.
          </p>
        </aside>
      </main>
    </div>
  );
}
