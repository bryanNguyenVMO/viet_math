import { Panel, SearchInput, SymbolButton } from "@vietmath/ui";
import { Search, Sigma } from "lucide-react";

const symbols = ["π", "∞", "∑", "√", "α", "β", "θ", "≈", "≠", "≤", "≥", "∈"];

export function SymbolPanel() {
  return (
    <Panel className="vm-side-panel" aria-label="Symbol palette">
      <div className="vm-panel-heading">
        <div>
          <p className="vm-panel-eyebrow">Ký hiệu</p>
          <h2>Phổ biến</h2>
        </div>
        <Sigma size={17} />
      </div>
      <SearchInput aria-label="Tìm ký hiệu" placeholder="Tìm ký hiệu..." icon={<Search size={15} />} />
      <div className="vm-symbol-grid">
        {symbols.map((symbol) => (
          <SymbolButton key={symbol} symbol={symbol} label={`Ký hiệu ${symbol}`} />
        ))}
      </div>
    </Panel>
  );
}
