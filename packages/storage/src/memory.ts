import type { EquationDocument } from "@vietmath/equation-model";

import type { StoredEquation } from "./ports";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class MemoryStorage {
  private readonly drafts = new Map<string, EquationDocument>();
  private readonly settings = new Map<string, string>();
  private readonly equations = new Map<string, StoredEquation>();

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
}
