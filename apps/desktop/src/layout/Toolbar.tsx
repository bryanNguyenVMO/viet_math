import { Button, IconButton } from "@vietmath/ui";
import { Copy, Redo2, Settings, Undo2 } from "lucide-react";

const structures = ["a/b", "√x", "x²", "∫", "Σ", "lim", "▦", "{ }"];

export function Toolbar() {
  return (
    <div className="vm-toolbar" aria-label="VietMath toolbar">
      <div className="vm-toolbar__group">
        <IconButton aria-label="Hoàn tác" icon={<Undo2 size={17} />} />
        <IconButton aria-label="Làm lại" icon={<Redo2 size={17} />} />
      </div>
      <div className="vm-toolbar__divider" />
      <div className="vm-toolbar__group vm-toolbar__group--structures">
        {structures.map((structure) => (
          <Button key={structure} variant="ghost" aria-label={`Chèn ${structure}`}>
            {structure}
          </Button>
        ))}
      </div>
      <div className="vm-toolbar__spacer" />
      <Button variant="primary">
        <Copy size={15} /> Sao chép
      </Button>
      <IconButton aria-label="Cài đặt" icon={<Settings size={17} />} />
    </div>
  );
}
