import { invoke } from "@tauri-apps/api/core";
import {
  deserializeEquation,
  serializeEquation,
  type EquationDocument,
} from "@vietmath/equation-model";
import type {
  DraftRepository,
  EquationRepository,
  FavoriteRepository,
  HistoryRepository,
  SettingsRepository,
  StoredEquation,
  StoredEquationRevision,
} from "@vietmath/storage";

type StoredEquationRow = [string, string, number, number, number];
type RevisionRow = [number, string, number];

function fromRow(row: StoredEquationRow): StoredEquation {
  const [id, documentJson, createdAt, updatedAt, lastOpenedAt] = row;
  return {
    id,
    document: deserializeEquation(documentJson),
    createdAt,
    updatedAt,
    lastOpenedAt,
  };
}

export class TauriStorage
  implements
    DraftRepository,
    SettingsRepository,
    EquationRepository,
    FavoriteRepository,
    HistoryRepository
{
  async save(key: string, document: EquationDocument): Promise<void> {
    await invoke("save_draft", {
      key,
      documentJson: serializeEquation(document),
    });
  }

  async load(key: string): Promise<EquationDocument | null> {
    const raw = await invoke<string | null>("load_draft", { key });
    return raw ? deserializeEquation(raw) : null;
  }

  async clear(key: string): Promise<void> {
    await invoke("clear_draft", { key });
  }

  async set(key: string, value: string): Promise<void> {
    await invoke("save_setting", { key, value });
  }

  async get(key: string): Promise<string | null> {
    return invoke<string | null>("load_setting", { key });
  }

  async saveEquation(equation: StoredEquation): Promise<void> {
    await invoke("save_equation", {
      id: equation.id,
      documentJson: serializeEquation(equation.document),
      createdAt: equation.createdAt,
      updatedAt: equation.updatedAt,
      lastOpenedAt: equation.lastOpenedAt,
    });
  }

  async getEquation(id: string): Promise<StoredEquation | null> {
    const row = await invoke<[string, number, number, number] | null>(
      "load_equation",
      { id },
    );
    if (!row) return null;

    const [documentJson, createdAt, updatedAt, lastOpenedAt] = row;
    return fromRow([id, documentJson, createdAt, updatedAt, lastOpenedAt]);
  }

  async listRecent(limit: number): Promise<StoredEquation[]> {
    const rows = await invoke<StoredEquationRow[]>("list_recent_equations", {
      limit,
    });
    return rows.map(fromRow);
  }

  async setFavorite(id: string, favorite: boolean): Promise<void> {
    await invoke("set_equation_favorite", { id, favorite });
  }

  async listFavorites(): Promise<StoredEquation[]> {
    const rows = await invoke<StoredEquationRow[]>("list_favorite_equations");
    return rows.map(fromRow);
  }

  async listRevisions(
    equationId: string,
    limit: number,
  ): Promise<StoredEquationRevision[]> {
    const rows = await invoke<RevisionRow[]>("list_equation_revisions", {
      equationId,
      limit,
    });
    return rows.map(([id, documentJson, createdAt]) => ({
      id,
      equationId,
      document: deserializeEquation(documentJson),
      createdAt,
    }));
  }
}
