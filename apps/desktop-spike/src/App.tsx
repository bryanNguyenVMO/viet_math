import {
  BookOpen,
  Braces,
  ChevronDown,
  Copy,
  Grid3X3,
  MoreHorizontal,
  Redo2,
  Search,
  Settings,
  Sigma,
  Star,
  Undo2,
} from "lucide-react";

const recentFormulas = [
  { title: "Phương trình bậc hai", formula: "x = (-b ± √Δ) / 2a" },
  { title: "Định lý Pythagore", formula: "a² + b² = c²" },
  { title: "Tích phân cơ bản", formula: "∫₀¹ x² dx" },
];

const symbols = ["π", "∞", "∑", "√", "α", "β", "θ", "≈", "≠", "≤", "≥", "∈"];

const structures = [
  { label: "Phân số", sample: "a/b" },
  { label: "Căn thức", sample: "√x" },
  { label: "Mũ", sample: "x²" },
  { label: "Tích phân", sample: "∫" },
  { label: "Tổng", sample: "∑" },
  { label: "Giới hạn", sample: "lim" },
];

export function App() {
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
          <button className="icon-button" aria-label="Cài đặt"><Settings size={18} /></button>
        </div>
      </header>

      <nav className="menu-bar" aria-label="Main menu">
        <button>Tệp</button>
        <button>Chỉnh sửa</button>
        <button>Chèn</button>
        <button>Định dạng</button>
        <button>Trợ giúp</button>
      </nav>

      <section className="toolbar" aria-label="VietMath toolbar">
        <div className="tool-group history-tools">
          <button className="tool-icon" aria-label="Hoàn tác"><Undo2 size={18} /></button>
          <button className="tool-icon" aria-label="Làm lại"><Redo2 size={18} /></button>
        </div>

        <div className="tool-divider" />

        <div className="structure-tools">
          {structures.map((item) => (
            <button className="structure-button" key={item.label}>
              <span className="structure-sample">{item.sample}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <button className="structure-button">
            <Grid3X3 size={21} />
            <span>Ma trận</span>
          </button>
          <button className="structure-button">
            <Braces size={21} />
            <span>Hệ</span>
          </button>
          <button className="structure-button">
            <MoreHorizontal size={21} />
            <span>Thêm</span>
          </button>
        </div>

        <div className="tool-spacer" />

        <button className="primary-button">
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
              <button className="formula-card" key={item.title}>
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
            <span className="spike-badge">Phase 0 shell</span>
          </div>

          <div className="editor-canvas">
            <div className="equation-placeholder" aria-label="Công thức mẫu">
              <span className="equation-line">x =</span>
              <span className="fraction">
                <span>-b ± √(b² - 4ac)</span>
                <span className="fraction-rule" />
                <span>2a</span>
              </span>
            </div>
            <p className="editor-hint">
              MathLive sẽ được tích hợp ở bước editor spike tiếp theo.
            </p>
          </div>

          <footer className="editor-status">
            <span>Visual editor</span>
            <span>Offline-first</span>
            <span>Tiếng Việt</span>
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
              <button key={symbol} className="symbol-button" aria-label={`Ký hiệu ${symbol}`}>
                {symbol}
              </button>
            ))}
          </div>

          <p className="panel-note">
            Ký hiệu hiện chỉ là placeholder của shell. Math symbols production sẽ render bằng math engine.
          </p>
        </aside>
      </main>
    </div>
  );
}
