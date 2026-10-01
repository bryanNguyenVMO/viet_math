import type { VietMathEditor } from "@vietmath/editor";
import { createTranslator, type Locale } from "@vietmath/i18n";
import { normalizeVietnameseSearch } from "@vietmath/shared";
import {
  BUILTIN_TEMPLATES,
  cloneTemplate,
  type EquationRepository,
  type FavoriteRepository,
  type StoredEquation,
} from "@vietmath/storage";
import { EquationCard, Panel, SearchInput } from "@vietmath/ui";
import { BookOpen, Clock3, LayoutTemplate, Search, Star } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type LibraryStorage = EquationRepository & FavoriteRepository;
type LibraryTab = "recent" | "favorites" | "templates";

type LibraryPanelProps = {
  editor: VietMathEditor | null;
  locale: Locale;
  storage: LibraryStorage;
  recentLimit: number;
};

const aliases: Record<string, string[]> = {
  quadratic: ["phuong trinh bac hai", "quadratic", "quadratic formula"],
  pythagorean: ["pythagore", "pythagorean"],
  "basic-integral": ["tich phan", "integral", "int"],
  "matrix-2x2": ["ma tran", "matrix"],
  "system-2": ["he phuong trinh", "system", "cases"],
};

function matchesTemplate(
  template: (typeof BUILTIN_TEMPLATES)[number],
  query: string,
) {
  if (!query) return true;

  const haystack = normalizeVietnameseSearch(
    [
      template.title,
      template.document.latex,
      ...(aliases[template.id] ?? []),
    ].join(" "),
  );

  return haystack.includes(normalizeVietnameseSearch(query));
}

function matchesEquation(equation: StoredEquation, query: string) {
  if (!query) return true;
  return normalizeVietnameseSearch(equation.document.latex).includes(
    normalizeVietnameseSearch(query),
  );
}

function equationTitle(equation: StoredEquation) {
  const latex = equation.document.latex.trim();
  if (!latex) return "LaTeX";
  return latex.length > 34 ? `${latex.slice(0, 34)}…` : latex;
}

function createEquationId(prefix = "eq") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function LibraryPanel({
  editor,
  locale,
  storage,
  recentLimit,
}: LibraryPanelProps) {
  const { t } = createTranslator(locale);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<LibraryTab>("recent");
  const [recent, setRecent] = useState<StoredEquation[]>([]);
  const [favorites, setFavorites] = useState<StoredEquation[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const activeEquationRef = useRef<StoredEquation | null>(null);

  const templates = useMemo(
    () => BUILTIN_TEMPLATES.filter((template) => matchesTemplate(template, query)),
    [query],
  );
  const filteredRecent = useMemo(
    () => recent.filter((equation) => matchesEquation(equation, query)),
    [query, recent],
  );
  const filteredFavorites = useMemo(
    () => favorites.filter((equation) => matchesEquation(equation, query)),
    [favorites, query],
  );
  const favoriteIds = useMemo(
    () => new Set(favorites.map((equation) => equation.id)),
    [favorites],
  );

  const refreshLibrary = useCallback(async () => {
    const [nextRecent, nextFavorites] = await Promise.all([
      storage.listRecent(recentLimit),
      storage.listFavorites(),
    ]);
    setRecent(nextRecent);
    setFavorites(nextFavorites);
  }, [recentLimit, storage]);

  useEffect(() => {
    void refreshLibrary();
  }, [refreshKey, refreshLibrary]);

  useEffect(() => {
    if (!editor) return;

    if (!activeEquationRef.current) {
      const now = Date.now();
      const initial: StoredEquation = {
        id: createEquationId("session"),
        document: {
          schemaVersion: 1,
          latex: editor.getLatex(),
          displayMode: "block",
          style: {},
        },
        createdAt: now,
        updatedAt: now,
        lastOpenedAt: now,
      };
      activeEquationRef.current = initial;
      void storage.saveEquation(initial).then(() => setRefreshKey((value) => value + 1));
    }

    let timer: number | undefined;
    const unsubscribe = editor.subscribe((latex) => {
      const current = activeEquationRef.current;
      if (!current) return;

      const now = Date.now();
      const next: StoredEquation = {
        ...current,
        document: {
          ...current.document,
          latex,
          draftLatex: undefined,
        },
        updatedAt: now,
        lastOpenedAt: now,
      };
      activeEquationRef.current = next;

      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void storage.saveEquation(next).then(() => setRefreshKey((value) => value + 1));
      }, 300);
    });

    return () => {
      unsubscribe();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [editor, storage]);

  const openStored = async (equation: StoredEquation) => {
    const next = { ...equation, lastOpenedAt: Date.now() };
    activeEquationRef.current = next;
    await storage.saveEquation(next);
    editor?.setLatex(next.document.latex);
    editor?.focus();
    setRefreshKey((value) => value + 1);
  };

  const openTemplate = async (template: (typeof BUILTIN_TEMPLATES)[number]) => {
    const equation = cloneTemplate(
      template,
      createEquationId(template.id),
      Date.now(),
    );
    activeEquationRef.current = equation;
    await storage.saveEquation(equation);
    editor?.setLatex(equation.document.latex);
    editor?.focus();
    setTab("recent");
    setRefreshKey((value) => value + 1);
  };

  const toggleFavorite = async (equation: StoredEquation) => {
    await storage.setFavorite(equation.id, !favoriteIds.has(equation.id));
    setRefreshKey((value) => value + 1);
  };

  const storedItems = tab === "favorites" ? filteredFavorites : filteredRecent;
  const emptyMessage =
    tab === "favorites"
      ? t("library.noFavorites")
      : tab === "recent"
        ? t("library.noRecent")
        : t("library.noResults");

  return (
    <Panel className="vm-side-panel" aria-label="Formula library">
      <div className="vm-panel-heading">
        <div>
          <p className="vm-panel-eyebrow">{t("library.eyebrow")}</p>
          <h2>
            {tab === "recent"
              ? t("library.recent")
              : tab === "favorites"
                ? t("library.favorites")
                : t("library.templates")}
          </h2>
        </div>
        <BookOpen size={17} />
      </div>

      <div className="vm-library-tabs" role="tablist" aria-label={t("library.eyebrow")}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "recent"}
          className={tab === "recent" ? "is-active" : undefined}
          onClick={() => setTab("recent")}
        >
          <Clock3 size={13} /> {t("library.recent")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "favorites"}
          className={tab === "favorites" ? "is-active" : undefined}
          onClick={() => setTab("favorites")}
        >
          <Star size={13} /> {t("library.favorites")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "templates"}
          className={tab === "templates" ? "is-active" : undefined}
          onClick={() => setTab("templates")}
        >
          <LayoutTemplate size={13} /> {t("library.templates")}
        </button>
      </div>

      <SearchInput
        aria-label={t("library.searchLabel")}
        placeholder={t("library.searchPlaceholder")}
        icon={<Search size={15} />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="vm-formula-list">
        {tab === "templates"
          ? templates.map((template) => (
              <EquationCard
                key={template.id}
                title={template.title}
                preview={template.document.latex}
                disabled={!editor}
                onClick={() => void openTemplate(template)}
              />
            ))
          : storedItems.map((equation) => (
              <div className="vm-library-card-row" key={equation.id}>
                <EquationCard
                  title={equationTitle(equation)}
                  preview={equation.document.latex}
                  disabled={!editor}
                  onClick={() => void openStored(equation)}
                />
                <button
                  type="button"
                  className="vm-favorite-button"
                  aria-label={
                    favoriteIds.has(equation.id)
                      ? t("library.removeFavorite")
                      : t("library.addFavorite")
                  }
                  aria-pressed={favoriteIds.has(equation.id)}
                  onClick={() => void toggleFavorite(equation)}
                >
                  <Star size={15} fill={favoriteIds.has(equation.id) ? "currentColor" : "none"} />
                </button>
              </div>
            ))}

        {(tab === "templates" ? templates.length : storedItems.length) === 0 ? (
          <p className="vm-catalog-empty">{emptyMessage}</p>
        ) : null}
      </div>
    </Panel>
  );
}
