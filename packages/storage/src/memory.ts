import type { EquationDocument } from "@vietmath/equation-model";

import type { StoredEquation, StoredEquationRevision } from "./ports";

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
}
