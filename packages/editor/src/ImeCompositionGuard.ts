export class ImeCompositionGuard {
  private composing = false;

  startComposition(): void {
    this.composing = true;
  }

  endComposition(): void {
    this.composing = false;
  }

  isComposing(): boolean {
    return this.composing;
  }

  shouldHandleKeyboardCommand(eventIsComposing: boolean): boolean {
    return !this.composing && !eventIsComposing;
  }
}
