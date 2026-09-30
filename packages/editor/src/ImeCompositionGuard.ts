export class ImeCompositionGuard {
  startComposition(): void {}
  endComposition(): void {}
  isComposing(): boolean { return false; }
  shouldHandleKeyboardCommand(_eventIsComposing: boolean): boolean { return true; }
}
