import type { EquationDocument } from "@vietmath/equation-model";

export type StoredEquation = {
  id: string;
  document: EquationDocument;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
};

export interface EquationRepository {
  save(equation: StoredEquation): Promise<void>;
  get(id: string): Promise<StoredEquation | null>;
  listRecent(limit: number): Promise<StoredEquation[]>;
}

export interface DraftRepository {
  save(key: string, document: EquationDocument): Promise<void>;
  load(key: string): Promise<EquationDocument | null>;
  clear(key: string): Promise<void>;
}

export interface SettingsRepository {
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
}

export interface FavoriteRepository {
  setFavorite(id: string, favorite: boolean): Promise<void>;
  listFavorites(): Promise<StoredEquation[]>;
}

export type FormulaTemplate = {
  id: string;
  title: string;
  document: EquationDocument;
};
