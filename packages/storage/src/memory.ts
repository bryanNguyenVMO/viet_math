import type { EquationDocument } from "@vietmath/equation-model";

import type {
  StoredCollection,
  StoredEquation,
  StoredEquationRevision,
} from "./ports";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function documentChanged(
  left: EquationDocument,
  right: EquationDocument,
): boolean {
  return JSON.stringify(left) !== JSON.stringify(right);
}

export class MemoryStorage {
  private readonly drafts = new Map<string, EquationDocument>();
  private readonly settings = new Map<string, string>();
  private readonly equations = new Map<string, StoredEquation>();
  private readonly favorites = new Set<string>();
  private readonly revisions = new Map<string, StoredEquationRevision[]>();
  private readonly collections = new Map<string, StoredCollection>();
  private readonly collectionEquations = new Map<string, Set<string>>();
  private revisionId = 1;

  async save(key: string, document: EquationDocument): Promise<void> {
    this.drafts.set(key, clone(document));
  }

  async load(key: string): Promise<EquationDocument | null> {
    const document = this.drafts.get(key);
    return document ? clone(document) : null;
  }

  async clear(key: string): Promise<void> {
    this.drafts.delete(key);
  }

  async set(key: string, value: string): Promise<void> {
    this.settings.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.settings.get(key) ?? null;
  }

  async saveEquation(equation: StoredEquation): Promise<void> {
    const previous = this.equations.get(equation.id);
    if (previous && documentChanged(previous.document, equation.document)) {
      const revisions = this.revisions.get(equation.id) ?? [];
      revisions.unshift({
        id: this.revisionId,
        equationId: equation.id,
        document: clone(previous.document),
        createdAt: previous.updatedAt,
      });
      this.revisionId += 1;
      this.revisions.set(equation.id, revisions.slice(0, 50));
    }

    this.equations.set(equation.id, clone(equation));
  }

  async getEquation(id: string): Promise<StoredEquation | null> {
    const equation = this.equations.get(id);
    return equation ? clone(equation) : null;
  }

  async listRecent(limit: number): Promise<StoredEquation[]> {
    return [...this.equations.values()]
      .sort((left, right) => right.lastOpenedAt - left.lastOpenedAt)
      .slice(0, Math.max(0, limit))
      .map(clone);
  }

  async renameEquation(id: string, title: string | null): Promise<void> {
    const equation = this.equations.get(id);
    if (!equation) return;
    const trimmed = title?.trim();
    this.equations.set(
      id,
      clone({ ...equation, title: trimmed ? trimmed : undefined }),
    );
  }

  async deleteEquation(id: string): Promise<void> {
    this.equations.delete(id);
    this.favorites.delete(id);
    this.revisions.delete(id);
    for (const equationIds of this.collectionEquations.values()) {
      equationIds.delete(id);
    }
  }

  async setFavorite(id: string, favorite: boolean): Promise<void> {
    if (favorite) this.favorites.add(id);
    else this.favorites.delete(id);
  }

  async listFavorites(): Promise<StoredEquation[]> {
    return [...this.favorites]
      .map((id) => this.equations.get(id))
      .filter((equation): equation is StoredEquation => Boolean(equation))
      .map(clone);
  }

  async listRevisions(
    equationId: string,
    limit: number,
  ): Promise<StoredEquationRevision[]> {
    return (this.revisions.get(equationId) ?? [])
      .slice(0, Math.max(0, limit))
      .map(clone);
  }

  async createCollection(collection: StoredCollection): Promise<void> {
    this.collections.set(collection.id, clone(collection));
    if (!this.collectionEquations.has(collection.id)) {
      this.collectionEquations.set(collection.id, new Set());
    }
  }

  async listCollections(): Promise<StoredCollection[]> {
    return [...this.collections.values()]
      .sort((left, right) => left.createdAt - right.createdAt)
      .map(clone);
  }

  async deleteCollection(id: string): Promise<void> {
    this.collections.delete(id);
    this.collectionEquations.delete(id);
  }

  async addEquationToCollection(
    collectionId: string,
    equationId: string,
  ): Promise<void> {
    if (!this.collections.has(collectionId)) {
      throw new Error("Collection not found");
    }
    const equationIds = this.collectionEquations.get(collectionId) ?? new Set();
    equationIds.add(equationId);
    this.collectionEquations.set(collectionId, equationIds);
  }

  async removeEquationFromCollection(
    collectionId: string,
    equationId: string,
  ): Promise<void> {
    this.collectionEquations.get(collectionId)?.delete(equationId);
  }

  async listCollectionEquations(
    collectionId: string,
  ): Promise<StoredEquation[]> {
    return [...(this.collectionEquations.get(collectionId) ?? new Set())]
      .map((id) => this.equations.get(id))
      .filter((equation): equation is StoredEquation => Boolean(equation))
      .sort((left, right) => right.lastOpenedAt - left.lastOpenedAt)
      .map(clone);
  }
}
