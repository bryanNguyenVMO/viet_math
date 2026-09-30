import { invoke } from "@tauri-apps/api/core";
import {
  deserializeEquation,
  serializeEquation,
  type EquationDocument,
} from "@vietmath/equation-model";
import type {
  DraftRepository,
  SettingsRepository,
} from "@vietmath/storage";

export class TauriStorage implements DraftRepository, SettingsRepository {
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
}
