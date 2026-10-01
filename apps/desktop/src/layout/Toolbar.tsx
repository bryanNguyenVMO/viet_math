import type { EquationDocument } from "@vietmath/equation-model";
import {
  STRUCTURE_TEMPLATES,
  type StructureTemplateName,
  type VietMathEditor,
} from "@vietmath/editor";
import { exportMathMl, exportPng } from "@vietmath/exporters";
import {
  createTranslator,
  type Locale,
  type TranslationKey,
} from "@vietmath/i18n";
import { ClipboardService, type AppSettings } from "@vietmath/shared";
import { Button, IconButton } from "@vietmath/ui";
import {
  Copy,
  Download,
  FileCode2,
  FilePlus2,
  HelpCircle,
  Image as ImageIcon,
  Redo2,
  Settings,
  Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { BrowserClipboardPort } from "../clipboard/BrowserClipboardPort";
import { MathLiveExportBackend } from "../export/MathLiveExportBackend";

type ToolbarProps = {
  editor: VietMathEditor | null;
  locale: Locale;
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenExport: () => void;
  onNewEquation: () => void;
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

function currentEquation(editor: VietMathEditor): EquationDocument {
  return {
    schemaVersion: 1,
    latex: editor.getLatex(),
    displayMode: "block",
    style: {},
  };
}

export function Toolbar({
  editor,
  locale,
  settings,
  onOpenSettings,
  onOpenHelp,
  onOpenExport,
  onNewEquation,
}: ToolbarProps) {
  const { t } = createTranslator(locale);
  const clipboard = useMemo(
    () => new ClipboardService(new BrowserClipboardPort()),
    [],
  );
  const renderer = useMemo(() => new MathLiveExportBackend(), []);
  const [copyStatus, setCopyStatus] = useState("");

  const insert = (name: StructureTemplateName) => {
    editor?.insertLatex(STRUCTURE_TEMPLATES[name]);
    editor?.focus();
  };

  const copyLatex = async () => {
    if (!editor) return;
    const result = await clipboard.copyLatex(editor.getLatex());
    setCopyStatus(
      result.ok ? t("actions.copySuccess") : t("actions.copyFailed"),
    );
  };

  const copyImage = async () => {
    if (!editor) return;

    const exported = await exportPng(currentEquation(editor), renderer, {
      scale: settings.exportScale,
      background: settings.exportBackground,
      color: "#000000",
    });
    if (!exported.ok) {
      setCopyStatus(t("actions.copyFailed"));
      return;
    }

    const result = await clipboard.copyImage(exported.data);
    setCopyStatus(
      result.ok ? t("actions.copyImageSuccess") : t("actions.copyFailed"),
    );
  };

  const copyMathMl = async () => {
    if (!editor) return;

    const exported = exportMathMl(currentEquation(editor), renderer);
    if (!exported.ok) {
      setCopyStatus(t("actions.copyFailed"));
      return;
    }

    const result = await clipboard.copyMathMl(exported.data);
    setCopyStatus(
      result.ok ? t("actions.copyMathMlSuccess") : t("actions.copyFailed"),
    );
  };

  return (
    <div className="vm-toolbar" aria-label="VietMath toolbar">
      <div className="vm-toolbar__group">
        <IconButton
          aria-label={t("actions.newEquation")}
          title={t("actions.newEquation")}
          icon={<FilePlus2 size={17} />}
          disabled={!editor}
          onClick={onNewEquation}
        />
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
      <IconButton
        aria-label={t("actions.copyImage")}
        title={t("actions.copyImage")}
        icon={<ImageIcon size={17} />}
        disabled={!editor}
        onClick={() => void copyImage()}
      />
      <IconButton
        aria-label={t("actions.copyMathMl")}
        title={t("actions.copyMathMl")}
        icon={<FileCode2 size={17} />}
        disabled={!editor}
        onClick={() => void copyMathMl()}
      />
      <Button
        variant="primary"
        disabled={!editor}
        onClick={() => void copyLatex()}
      >
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
