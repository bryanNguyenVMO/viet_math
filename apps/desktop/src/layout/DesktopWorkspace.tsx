import type { VietMathEditor } from "@vietmath/editor";
import {
  createTranslator,
  detectInitialLocale,
  type Locale,
} from "@vietmath/i18n";
import {
  DEFAULT_APP_SETTINGS,
  SETTINGS_KEY,
  normalizeAppSettings,
  resolveShortcut,
  resolveTheme,
  type AppSettings,
} from "@vietmath/shared";
import { Settings as SettingsIcon, Sigma } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { EditorWorkspace } from "../editor/EditorWorkspace";
import { ExportDialog } from "../export/ExportDialog";
import { HelpDialog } from "../help/HelpDialog";
import { SettingsDialog } from "../settings/SettingsDialog";
import { TauriStorage } from "../storage/TauriStorage";
import { LibraryPanel } from "./LibraryPanel";
import { SymbolPanel } from "./SymbolPanel";
import { Toolbar } from "./Toolbar";

const MIN_LEFT = 200;
const MAX_LEFT = 420;
const MIN_RIGHT = 220;
const MAX_RIGHT = 420;
const WORKSPACE_LAYOUT_KEY = "workspace-layout-v1";
const initialLatex = String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type WorkspaceLayout = {
  leftWidth: number;
  rightWidth: number;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
};

function parseWorkspaceLayout(raw: string | null): WorkspaceLayout | null {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<WorkspaceLayout>;
    if (
      typeof value.leftWidth !== "number" ||
      typeof value.rightWidth !== "number" ||
      typeof value.leftCollapsed !== "boolean" ||
      typeof value.rightCollapsed !== "boolean"
    ) {
      return null;
    }

    return {
      leftWidth: clamp(value.leftWidth, MIN_LEFT, MAX_LEFT),
      rightWidth: clamp(value.rightWidth, MIN_RIGHT, MAX_RIGHT),
      leftCollapsed: value.leftCollapsed,
      rightCollapsed: value.rightCollapsed,
    };
  } catch {
    return null;
  }
}

export function DesktopWorkspace() {
  const [editor, setEditor] = useState<VietMathEditor | null>(null);
  const storage = useMemo(() => new TauriStorage(), []);
  const [settings, setSettings] = useState<AppSettings>(() => ({
    ...DEFAULT_APP_SETTINGS,
    locale: detectInitialLocale(),
  }));
  const [locale, setLocale] = useState<Locale>(() => settings.locale);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(280);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [searchRequestKey, setSearchRequestKey] = useState(0);
  const resizeMovedRef = useRef<Record<"left" | "right", boolean>>({
    left: false,
    right: false,
  });
  const { t } = createTranslator(locale);

  useEffect(() => {
    let cancelled = false;

    void storage.get(SETTINGS_KEY).then((raw) => {
      if (cancelled) return;
      const loaded = normalizeAppSettings(raw);
      setSettings(loaded);
      setLocale(loaded.locale);
    });

    return () => {
      cancelled = true;
    };
  }, [storage]);

  useEffect(() => {
    let cancelled = false;

    void storage.get(WORKSPACE_LAYOUT_KEY).then((raw) => {
      if (cancelled) return;
      const loaded = parseWorkspaceLayout(raw);
      if (loaded) {
        setLeftWidth(loaded.leftWidth);
        setRightWidth(loaded.rightWidth);
        setLeftCollapsed(loaded.leftCollapsed);
        setRightCollapsed(loaded.rightCollapsed);
      }
      setLayoutLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [storage]);

  useEffect(() => {
    if (!layoutLoaded) return;

    const timer = window.setTimeout(() => {
      const layout: WorkspaceLayout = {
        leftWidth,
        rightWidth,
        leftCollapsed,
        rightCollapsed,
      };
      void storage.set(WORKSPACE_LAYOUT_KEY, JSON.stringify(layout));
    }, 180);

    return () => window.clearTimeout(timer);
  }, [
    layoutLoaded,
    leftCollapsed,
    leftWidth,
    rightCollapsed,
    rightWidth,
    storage,
  ]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(
        settings.theme,
        media.matches,
      );
    };

    apply();
    if (settings.theme !== "system") return;

    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings.theme]);

  const saveSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    setLocale(next.locale);
  }, []);

  const changeLocale = useCallback(
    async (nextLocale: Locale) => {
      const next = { ...settings, locale: nextLocale };
      setSettings(next);
      setLocale(nextLocale);
      await storage.set(SETTINGS_KEY, JSON.stringify(next));
    },
    [settings, storage],
  );

  const handleEditorReady = useCallback((next: VietMathEditor | null) => {
    setEditor(next);
  }, []);

  const startResize = useCallback(
    (side: "left" | "right") => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = side === "left" ? leftWidth : rightWidth;
      resizeMovedRef.current[side] = false;

      const move = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX;
        if (Math.abs(delta) >= 3) resizeMovedRef.current[side] = true;
        if (side === "left") {
          setLeftCollapsed(false);
          setLeftWidth(clamp(startWidth + delta, MIN_LEFT, MAX_LEFT));
        } else {
          setRightCollapsed(false);
          setRightWidth(clamp(startWidth - delta, MIN_RIGHT, MAX_RIGHT));
        }
      };

      const stop = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", stop);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop);
    },
    [leftWidth, rightWidth],
  );

  const handleResizeClick = useCallback((side: "left" | "right") => {
    if (resizeMovedRef.current[side]) {
      resizeMovedRef.current[side] = false;
      return;
    }

    if (side === "left") setLeftCollapsed((value) => !value);
    else setRightCollapsed((value) => !value);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      const action = resolveShortcut({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        isComposing: event.isComposing,
      });

      if (action !== "symbol-search") return;

      event.preventDefault();
      setRightCollapsed(false);
      setSearchRequestKey((value) => value + 1);
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleKey = (side: "left" | "right") => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const amount = event.shiftKey ? 30 : 10;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      if (side === "left") {
        setLeftCollapsed(false);
        setLeftWidth((value) => clamp(value + direction * amount, MIN_LEFT, MAX_LEFT));
      } else {
        setRightCollapsed(false);
        setRightWidth((value) => clamp(value - direction * amount, MIN_RIGHT, MAX_RIGHT));
      }
    }
  };

  const columns = [
    leftCollapsed ? "0px" : `${leftWidth}px`,
    "12px",
    "minmax(360px, 1fr)",
    "12px",
    rightCollapsed ? "0px" : `${rightWidth}px`,
  ].join(" ");

  return (
    <main className="desktop-workspace">
      <header className="vm-titlebar">
        <div className="vm-brand">
          <span className="vm-brand-mark" aria-hidden="true"><Sigma size={19} /></span>
          <span>{t("app.title")}</span>
        </div>
        <div className="vm-titlebar-actions">
          <div className="vm-locale-switch" aria-label="Language">
            <button
              type="button"
              className={locale === "vi" ? "is-active" : undefined}
              aria-pressed={locale === "vi"}
              onClick={() => void changeLocale("vi")}
            >
              {t("locale.vi")}
            </button>
            <button
              type="button"
              className={locale === "en" ? "is-active" : undefined}
              aria-pressed={locale === "en"}
              onClick={() => void changeLocale("en")}
            >
              {t("locale.en")}
            </button>
          </div>
          <button
            type="button"
            className="vm-settings-trigger"
            aria-label={t("actions.settings")}
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon size={16} />
          </button>
          <span className="vm-panel-eyebrow">{t("app.alpha")}</span>
        </div>
      </header>

      <Toolbar
        editor={editor}
        locale={locale}
        settings={settings}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenExport={() => setExportOpen(true)}
      />

      <section className="vm-main-grid" style={{ gridTemplateColumns: columns }}>
        <div className="vm-panel-column" data-collapsed={leftCollapsed}>
          <LibraryPanel editor={editor} locale={locale} storage={storage} />
        </div>
        <button
          type="button"
          className="vm-resize-handle"
          data-resize-handle="left"
          aria-label={leftCollapsed ? t("layout.openLibrary") : t("layout.resizeLibrary")}
          onPointerDown={startResize("left")}
          onClick={() => handleResizeClick("left")}
          onKeyDown={handleKey("left")}
        />

        <div className="vm-panel-column">
          <section className="vm-editor-panel" aria-label={t("layout.editor")}>
            <EditorWorkspace
              initialLatex={initialLatex}
              locale={locale}
              storage={storage}
              onEditorReady={handleEditorReady}
            />
          </section>
        </div>

        <button
          type="button"
          className="vm-resize-handle"
          data-resize-handle="right"
          aria-label={rightCollapsed ? t("layout.openSymbols") : t("layout.resizeSymbols")}
          onPointerDown={startResize("right")}
          onClick={() => handleResizeClick("right")}
          onKeyDown={handleKey("right")}
        />
        <div className="vm-panel-column" data-collapsed={rightCollapsed}>
          <SymbolPanel
            editor={editor}
            locale={locale}
            searchRequestKey={searchRequestKey}
          />
        </div>
      </section>
      <ExportDialog
        open={exportOpen}
        editor={editor}
        settings={settings}
        locale={locale}
        onClose={() => setExportOpen(false)}
      />
      <HelpDialog
        open={helpOpen}
        locale={locale}
        onClose={() => setHelpOpen(false)}
      />
      <SettingsDialog
        open={settingsOpen}
        storage={storage}
        settings={settings}
        locale={locale}
        onClose={() => setSettingsOpen(false)}
        onSaved={saveSettings}
      />
    </main>
  );
}
