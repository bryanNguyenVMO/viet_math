import type { VietMathEditor } from "@vietmath/editor";
import { createTranslator, type Locale } from "@vietmath/i18n";
import { normalizeVietnameseSearch } from "@vietmath/shared";
import {
  BUILTIN_TEMPLATES,
  cloneTemplate,
  type CollectionRepository,
  type EquationRepository,
  type FavoriteRepository,
  type HistoryRepository,
  type StoredCollection,
  type StoredEquation,
  type StoredEquationRevision,
} from "@vietmath/storage";
import { EquationCard, Panel, SearchInput } from "@vietmath/ui";
import {
  BookOpen,
  Clock3,
  Folder,
  FolderPlus,
  History,
  LayoutTemplate,
  Pencil,
  RotateCcw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type LibraryStorage =
  & EquationRepository
  & FavoriteRepository
  & HistoryRepository
  & CollectionRepository;

type LibraryTab = "recent" | "favorites" | "templates" | "collections";

type LibraryPanelProps = {
  editor: VietMathEditor | null;
  locale: Locale;
  storage: LibraryStorage;
  recentLimit: number;
  newEquationRequestKey: number;
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
  const haystack = [equation.title ?? "", equation.document.latex].join(" ");
  return normalizeVietnameseSearch(haystack).includes(
    normalizeVietnameseSearch(query),
  );
}

function equationTitle(equation: StoredEquation) {
  if (equation.title?.trim()) return equation.title.trim();
  const latex = equation.document.latex.trim();
  if (!latex) return "LaTeX";
  return latex.length > 34 ? `${latex.slice(0, 34)}…` : latex;
}

function revisionPreview(revision: StoredEquationRevision) {
  const latex = revision.document.latex.trim();
  if (!latex) return "LaTeX";
  return latex.length > 42 ? `${latex.slice(0, 42)}…` : latex;
}

function formatHistoryTime(value: number, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function LibraryPanel({
  editor,
  locale,
  storage,
  recentLimit,
  newEquationRequestKey,
}: LibraryPanelProps) {
  const { t } = createTranslator(locale);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<LibraryTab>("recent");
  const [recent, setRecent] = useState<StoredEquation[]>([]);
  const [favorites, setFavorites] = useState<StoredEquation[]>([]);
  const [historyEquationId, setHistoryEquationId] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<StoredEquationRevision[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [collections, setCollections] = useState<StoredCollection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [collectionEquations, setCollectionEquations] = useState<StoredEquation[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [collectionStatus, setCollectionStatus] = useState("");
  const [editingEquationId, setEditingEquationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
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
  const filteredCollectionEquations = collectionEquations;
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

  const refreshCollections = useCallback(async () => {
    const nextCollections = await storage.listCollections();
    setCollections(nextCollections);
    setSelectedCollectionId((current) => {
      if (current && nextCollections.some((collection) => collection.id === current)) {
        return current;
      }
      return nextCollections[0]?.id ?? null;
    });
  }, [storage]);

  const refreshCollectionEquations = useCallback(async () => {
    if (!selectedCollectionId) {
      setCollectionEquations([]);
      return;
    }
    setCollectionEquations(
      await storage.listCollectionEquations(selectedCollectionId),
    );
  }, [selectedCollectionId, storage]);

  useEffect(() => {
    void refreshLibrary();
  }, [refreshKey, refreshLibrary]);

  useEffect(() => {
    void refreshCollections();
  }, [refreshCollections]);

  useEffect(() => {
    void refreshCollectionEquations();
  }, [refreshCollectionEquations, refreshKey]);

  useEffect(() => {
    if (!editor) return;

    if (!activeEquationRef.current) {
      const now = Date.now();
      const initial: StoredEquation = {
        id: createId("session"),
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


  useEffect(() => {
    if (!editor || newEquationRequestKey <= 0) return;

    const createNew = async () => {
      const current = activeEquationRef.current;
      if (current) await storage.saveEquation(current);

      const now = Date.now();
      const next: StoredEquation = {
        id: createId("session"),
        document: {
          schemaVersion: 1,
          latex: "",
          displayMode: "block",
          style: {},
        },
        createdAt: now,
        updatedAt: now,
        lastOpenedAt: now,
      };

      activeEquationRef.current = next;
      editor.setLatex("");
      editor.focus();
      await storage.saveEquation(next);
      setTab("recent");
      setHistoryEquationId(null);
      setRevisions([]);
      setRefreshKey((value) => value + 1);
    };

    void createNew();
  }, [editor, newEquationRequestKey, storage]);

  const openStored = async (equation: StoredEquation) => {
    const next = { ...equation, lastOpenedAt: Date.now() };
    activeEquationRef.current = next;
    await storage.saveEquation(next);
    editor?.setLatex(next.document.latex);
    editor?.focus();
    setRefreshKey((value) => value + 1);
  };

  const openTemplate = async (template: (typeof BUILTIN_TEMPLATES)[number]) => {
    const equation = cloneTemplate(template, createId(template.id), Date.now());
    activeEquationRef.current = equation;
    await storage.saveEquation(equation);
    editor?.setLatex(equation.document.latex);
    editor?.focus();
    setTab("recent");
    setRefreshKey((value) => value + 1);
  };

  const beginRename = (equation: StoredEquation) => {
    setEditingEquationId(equation.id);
    setEditingTitle(equation.title ?? "");
  };

  const saveRename = async (equation: StoredEquation) => {
    const title = editingTitle.trim();
    await storage.renameEquation(equation.id, title || null);
    if (activeEquationRef.current?.id === equation.id) {
      activeEquationRef.current = {
        ...activeEquationRef.current,
        title: title || undefined,
      };
    }
    setEditingEquationId(null);
    setEditingTitle("");
    setRefreshKey((value) => value + 1);
  };

  const deleteEquation = async (equation: StoredEquation) => {
    if (!window.confirm(t("library.deleteConfirm"))) return;

    await storage.deleteEquation(equation.id);
    if (activeEquationRef.current?.id === equation.id) {
      const now = Date.now();
      activeEquationRef.current = {
        ...equation,
        id: createId("session"),
        title: undefined,
        createdAt: now,
        updatedAt: now,
        lastOpenedAt: now,
      };
    }
    if (historyEquationId === equation.id) {
      setHistoryEquationId(null);
      setRevisions([]);
    }
    setRefreshKey((value) => value + 1);
  };

  const toggleFavorite = async (equation: StoredEquation) => {
    await storage.setFavorite(equation.id, !favoriteIds.has(equation.id));
    setRefreshKey((value) => value + 1);
  };

  const toggleHistory = async (equation: StoredEquation) => {
    if (historyEquationId === equation.id) {
      setHistoryEquationId(null);
      setRevisions([]);
      return;
    }

    setHistoryEquationId(equation.id);
    setHistoryLoading(true);
    try {
      setRevisions(await storage.listRevisions(equation.id, 12));
    } finally {
      setHistoryLoading(false);
    }
  };

  const restoreRevision = async (
    equation: StoredEquation,
    revision: StoredEquationRevision,
  ) => {
    const now = Date.now();
    const restored: StoredEquation = {
      ...equation,
      document: revision.document,
      updatedAt: now,
      lastOpenedAt: now,
    };
    activeEquationRef.current = restored;
    await storage.saveEquation(restored);
    editor?.setLatex(restored.document.latex);
    editor?.focus();
    setHistoryEquationId(null);
    setRevisions([]);
    setRefreshKey((value) => value + 1);
  };

  const createCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) return;

    const collection: StoredCollection = {
      id: createId("collection"),
      name,
      createdAt: Date.now(),
    };
    await storage.createCollection(collection);
    setNewCollectionName("");
    setCollectionStatus(t("library.collectionCreated"));
    await refreshCollections();
    setSelectedCollectionId(collection.id);
  };

  const deleteSelectedCollection = async () => {
    if (!selectedCollectionId) return;
    await storage.deleteCollection(selectedCollectionId);
    setCollectionStatus(t("library.collectionDeleted"));
    setSelectedCollectionId(null);
    setCollectionEquations([]);
    await refreshCollections();
  };

  const addCurrentToCollection = async () => {
    const current = activeEquationRef.current;
    if (!current || !selectedCollectionId) return;

    await storage.saveEquation(current);
    await storage.addEquationToCollection(selectedCollectionId, current.id);
    setCollectionStatus(t("library.collectionAdded"));
    await refreshCollectionEquations();
  };

  const removeFromCollection = async (equationId: string) => {
    if (!selectedCollectionId) return;
    await storage.removeEquationFromCollection(selectedCollectionId, equationId);
    setCollectionStatus(t("library.collectionRemoved"));
    await refreshCollectionEquations();
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
                : tab === "templates"
                  ? t("library.templates")
                  : t("library.collections")}
          </h2>
        </div>
        <BookOpen size={17} />
      </div>

      <div className="vm-library-tabs" role="tablist" aria-label={t("library.eyebrow")}>
        <button type="button" role="tab" aria-selected={tab === "recent"} className={tab === "recent" ? "is-active" : undefined} onClick={() => setTab("recent")}>
          <Clock3 size={13} /> {t("library.recent")}
        </button>
        <button type="button" role="tab" aria-selected={tab === "favorites"} className={tab === "favorites" ? "is-active" : undefined} onClick={() => setTab("favorites")}>
          <Star size={13} /> {t("library.favorites")}
        </button>
        <button type="button" role="tab" aria-selected={tab === "templates"} className={tab === "templates" ? "is-active" : undefined} onClick={() => setTab("templates")}>
          <LayoutTemplate size={13} /> {t("library.templates")}
        </button>
        <button type="button" role="tab" aria-selected={tab === "collections"} className={tab === "collections" ? "is-active" : undefined} onClick={() => setTab("collections")}>
          <Folder size={13} /> {t("library.collections")}
        </button>
      </div>

      {tab === "collections" ? (
        <div className="vm-collection-tools">
          <div className="vm-collection-create">
            <input
              value={newCollectionName}
              placeholder={t("library.collectionName")}
              aria-label={t("library.collectionName")}
              onChange={(event) => setNewCollectionName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void createCollection();
              }}
            />
            <button
              type="button"
              aria-label={t("library.createCollection")}
              disabled={!newCollectionName.trim()}
              onClick={() => void createCollection()}
            >
              <FolderPlus size={14} />
            </button>
          </div>

          {collections.length > 0 ? (
            <div className="vm-collection-select-row">
              <select
                aria-label={t("library.collections")}
                value={selectedCollectionId ?? ""}
                onChange={(event) => setSelectedCollectionId(event.target.value || null)}
              >
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label={t("library.addCurrentToCollection")}
                disabled={!editor || !selectedCollectionId}
                onClick={() => void addCurrentToCollection()}
              >
                <FolderPlus size={14} />
              </button>
              <button
                type="button"
                aria-label={t("library.deleteCollection")}
                disabled={!selectedCollectionId}
                onClick={() => void deleteSelectedCollection()}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : null}

          {collectionStatus ? (
            <span className="vm-collection-status" role="status">
              {collectionStatus}
            </span>
          ) : null}
        </div>
      ) : (
        <SearchInput
          aria-label={t("library.searchLabel")}
          placeholder={t("library.searchPlaceholder")}
          icon={<Search size={15} />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      )}

      <div className="vm-formula-list">
        {tab === "templates" ? (
          templates.map((template) => (
            <EquationCard
              key={template.id}
              title={template.title}
              preview={template.document.latex}
              disabled={!editor}
              onClick={() => void openTemplate(template)}
            />
          ))
        ) : tab === "collections" ? (
          filteredCollectionEquations.map((equation) => (
            <div className="vm-library-card-row" key={equation.id}>
              <EquationCard
                title={equationTitle(equation)}
                preview={equation.document.latex}
                disabled={!editor}
                onClick={() => void openStored(equation)}
              />
              <div className="vm-library-card-actions">
                <button
                  type="button"
                  className="vm-library-action-button"
                  aria-label={t("library.removeFromCollection")}
                  onClick={() => void removeFromCollection(equation.id)}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ))
        ) : (
          storedItems.map((equation) => (
            <div className="vm-library-card-row" key={equation.id}>
              <EquationCard
                title={equationTitle(equation)}
                preview={equation.document.latex}
                disabled={!editor}
                onClick={() => void openStored(equation)}
              />
              <div className="vm-library-card-actions">
                <button
                  type="button"
                  className="vm-library-action-button"
                  aria-label={t("library.renameEquation")}
                  onClick={() => beginRename(equation)}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="vm-library-action-button"
                  aria-label={t("library.deleteEquation")}
                  onClick={() => void deleteEquation(equation)}
                >
                  <Trash2 size={15} />
                </button>
                <button
                  type="button"
                  className="vm-library-action-button"
                  aria-label={t("library.history")}
                  aria-expanded={historyEquationId === equation.id}
                  onClick={() => void toggleHistory(equation)}
                >
                  <History size={15} />
                </button>
                <button
                  type="button"
                  className="vm-library-action-button"
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

              {editingEquationId === equation.id ? (
                <div className="vm-equation-rename">
                  <input
                    autoFocus
                    value={editingTitle}
                    placeholder={t("library.renamePlaceholder")}
                    aria-label={t("library.renamePlaceholder")}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void saveRename(equation);
                      if (event.key === "Escape") {
                        setEditingEquationId(null);
                        setEditingTitle("");
                      }
                    }}
                  />
                  <button type="button" onClick={() => void saveRename(equation)}>
                    {t("library.saveRename")}
                  </button>
                </div>
              ) : null}

              {historyEquationId === equation.id ? (
                <div className="vm-history-list">
                  <strong>{t("library.history")}</strong>
                  {historyLoading ? (
                    <span>{t("library.historyLoading")}</span>
                  ) : revisions.length === 0 ? (
                    <span>{t("library.noHistory")}</span>
                  ) : (
                    revisions.map((revision) => (
                      <button
                        type="button"
                        key={revision.id}
                        onClick={() => void restoreRevision(equation, revision)}
                      >
                        <span>
                          <RotateCcw size={13} />
                          {formatHistoryTime(revision.createdAt, locale)}
                        </span>
                        <code>{revisionPreview(revision)}</code>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          ))
        )}

        {tab === "collections" && filteredCollectionEquations.length === 0 ? (
          <p className="vm-catalog-empty">
            {collections.length === 0
              ? t("library.noCollections")
              : t("library.noCollectionEquations")}
          </p>
        ) : null}

        {tab !== "collections" &&
        (tab === "templates" ? templates.length : storedItems.length) === 0 ? (
          <p className="vm-catalog-empty">{emptyMessage}</p>
        ) : null}
      </div>
    </Panel>
  );
}
