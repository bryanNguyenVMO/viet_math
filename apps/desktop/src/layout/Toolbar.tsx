import {
  STRUCTURE_TEMPLATES,
  type StructureTemplateName,
  type VietMathEditor,
} from "@vietmath/editor";
import { Button, IconButton } from "@vietmath/ui";
import { Copy, Redo2, Settings, Undo2 } from "lucide-react";

type ToolbarProps = {
  editor: VietMathEditor | null;
};

const structures: Array<{
  name: StructureTemplateName;
  label: string;
  sample: string;
}> = [
  { name: "fraction", label: "Phân số", sample: "a/b" },
  { name: "squareRoot", label: "Căn thức", sample: "√x" },
  { name: "superscript", label: "Mũ", sample: "x²" },
  { name: "subscript", label: "Chỉ số", sample: "x₁" },
  { name: "integral", label: "Tích phân", sample: "∫" },
  { name: "summation", label: "Tổng", sample: "Σ" },
  { name: "limit", label: "Giới hạn", sample: "lim" },
  { name: "matrix", label: "Ma trận", sample: "▦" },
  { name: "cases", label: "Hệ", sample: "{ }" },
];

export function Toolbar({ editor }: ToolbarProps) {
  const insert = (name: StructureTemplateName) => {
    editor?.insertLatex(STRUCTURE_TEMPLATES[name]);
    editor?.focus();
  };

  return (
    <div className="vm-toolbar" aria-label="VietMath toolbar">
      <div className="vm-toolbar__group">
        <IconButton
          aria-label="Hoàn tác"
          icon={<Undo2 size={17} />}
          disabled={!editor}
          onClick={() => editor?.undo()}
        />
        <IconButton
          aria-label="Làm lại"
          icon={<Redo2 size={17} />}
          disabled={!editor}
          onClick={() => editor?.redo()}
        />
      </div>
      <div className="vm-toolbar__divider" />
      <div className="vm-toolbar__group vm-toolbar__group--structures">
        {structures.map((structure) => (
          <Button
            key={structure.name}
            variant="ghost"
            aria-label={`Chèn ${structure.label}`}
            disabled={!editor}
            onClick={() => insert(structure.name)}
          >
            {structure.sample}
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
