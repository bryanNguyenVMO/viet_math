import {
  STRUCTURE_TEMPLATES,
  type StructureTemplateName,
  type VietMathEditor,
} from "@vietmath/editor";
import {
  createTranslator,
  type Locale,
  type TranslationKey,
} from "@vietmath/i18n";
import { ClipboardService } from "@vietmath/shared";
import { Button, IconButton } from "@vietmath/ui";
import { Copy, Download, HelpCircle, Redo2, Settings, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";

import { BrowserClipboardPort } from "../clipboard/BrowserClipboardPort";

type ToolbarProps = {
  editor: VietMathEditor | null;
  locale: Locale;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenExport: () => void;
};

const structures: Array<{
  name: StructureTemplateName;
  labelKey: TranslationKey;
  sample: string;
}> = [
  { name: "fraction", labelKey: "structures.fraction", sample: "a/b" },
  { name: "squareRoot", labelKey: "structures.squareRoot", sample: "√x" },
  { name: "superscript", labelKey: "structures.superscript", sample: "x²" },
  { name: "subscript", labelKey: "structures.subscript", sample: "x₁" },
  { name: "integral", labelKey: "structures.integral", sample: "∫" },
  { name: "summation", labelKey: "structures.summation", sample: "Σ" },
  { name: "limit", labelKey: "structures.limit", sample: "lim" },
  { name: "matrix", labelKey: "structures.matrix", sample: "▦" },
  { name: "cases", labelKey: "structures.cases", sample: "{ }" },
];

export function Toolbar({
  editor,
  locale,
  onOpenSettings,
  onOpenHelp,
  onOpenExport,
}: ToolbarProps) {
  const { t } = createTranslator(locale);
  const clipboard = useMemo(
    () => new ClipboardService(new BrowserClipboardPort()),
    [],
  );
  const [copyStatus, setCopyStatus] = useState("");

  const insert = (name: StructureTemplateName) => {
    editor?.insertLatex(STRUCTURE_TEMPLATES[name]);
    editor?.focus();
  };

  const copy = async () => {
    if (!editor) return;

    const result = await clipboard.copyLatex(editor.getLatex());
    setCopyStatus(
      result.ok ? t("actions.copySuccess") : t("actions.copyFailed"),
    );
  };

  return (
    <div className="vm-toolbar" aria-label="VietMath toolbar">
      <div className="vm-toolbar__group">
        <IconButton
          aria-label={t("actions.undo")}
          icon={<Undo2 size={17} />}
          disabled={!editor}
          onClick={() => editor?.undo()}
        />
        <IconButton
          aria-label={t("actions.redo")}
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
            aria-label={`${t("actions.insert")} ${t(structure.labelKey)}`}
            disabled={!editor}
            onClick={() => insert(structure.name)}
          >
            {structure.sample}
          </Button>
        ))}
      </div>
      <div className="vm-toolbar__spacer" />
      {copyStatus ? (
        <span className="vm-toolbar__status" role="status">
          {copyStatus}
        </span>
      ) : null}
      <Button variant="ghost" disabled={!editor} onClick={onOpenExport}>
        <Download size={15} /> {t("actions.export")}
      </Button>
      <Button variant="primary" disabled={!editor} onClick={() => void copy()}>
        <Copy size={15} /> {t("actions.copy")}
      </Button>
      <IconButton
        aria-label={t("actions.help")}
        icon={<HelpCircle size={17} />}
        onClick={onOpenHelp}
      />
      <IconButton
        aria-label={t("actions.settings")}
        icon={<Settings size={17} />}
        onClick={onOpenSettings}
      />
    </div>
  );
}
