import type { EquationDocument } from "@vietmath/equation-model";

export type StoredEquation = {
  id: string;
  document: EquationDocument;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
};

export type StoredEquationRevision = {
  id: number;
  equationId: string;
  document: EquationDocument;
  createdAt: number;
};

export type StoredCollection = {
  id: string;
  name: string;
  createdAt: number;
};

export interface EquationRepository {
  saveEquation(equation: StoredEquation): Promise<void>;
  getEquation(id: string): Promise<StoredEquation | null>;
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

export interface HistoryRepository {
  listRevisions(
    equationId: string,
    limit: number,
  ): Promise<StoredEquationRevision[]>;
}

export interface CollectionRepository {
  createCollection(collection: StoredCollection): Promise<void>;
  listCollections(): Promise<StoredCollection[]>;
  deleteCollection(id: string): Promise<void>;
  addEquationToCollection(collectionId: string, equationId: string): Promise<void>;
  removeEquationFromCollection(
    collectionId: string,
    equationId: string,
  ): Promise<void>;
  listCollectionEquations(collectionId: string): Promise<StoredEquation[]>;
}

export type FormulaTemplate = {
  id: string;
  title: string;
  document: EquationDocument;
};
