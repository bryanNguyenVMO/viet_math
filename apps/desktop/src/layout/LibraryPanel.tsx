import { EquationCard, Panel, SearchInput } from "@vietmath/ui";
import { BookOpen, Search } from "lucide-react";

const recent = [
  { title: "Phương trình bậc hai", preview: "x = (-b ± √Δ) / 2a" },
  { title: "Định lý Pythagore", preview: "a² + b² = c²" },
  { title: "Tích phân cơ bản", preview: "∫₀¹ x² dx" },
];

export function LibraryPanel() {
  return (
    <Panel className="vm-side-panel" aria-label="Formula library">
      <div className="vm-panel-heading">
        <div>
          <p className="vm-panel-eyebrow">Thư viện</p>
          <h2>Gần đây</h2>
        </div>
        <BookOpen size={17} />
      </div>
      <SearchInput aria-label="Tìm công thức" placeholder="Tìm công thức..." icon={<Search size={15} />} />
      <div className="vm-formula-list">
        {recent.map((item) => (
          <EquationCard key={item.title} title={item.title} preview={item.preview} />
        ))}
      </div>
    </Panel>
  );
}
