import type { EquationDocument } from "@vietmath/equation-model";

export type DraftWriteRepository = {
  save(key: string, document: EquationDocument): Promise<void>;
};

export type DraftAutosave = {
  schedule(document: EquationDocument): void;
  flush(): Promise<void>;
  cancel(): void;
};

export function createDraftAutosave(
  repository: DraftWriteRepository,
  key: string,
  delayMs = 300,
): DraftAutosave {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: EquationDocument | undefined;
  let activeWrite = Promise.resolve();

  const writePending = async () => {
    const document = pending;
    pending = undefined;
    if (!document) return;
    await repository.save(key, document);
  };

  return {
    schedule(document) {
      pending = document;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        activeWrite = activeWrite.then(writePending);
      }, delayMs);
    },

    async flush() {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      activeWrite = activeWrite.then(writePending);
      await activeWrite;
    },

    cancel() {
      if (timer) clearTimeout(timer);
      timer = undefined;
      pending = undefined;
    },
  };
}
