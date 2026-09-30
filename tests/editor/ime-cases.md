# Phase 0 Vietnamese IME manual cases

Run these cases on the actual desktop app. Automated tests only validate VietMath's composition guard; they cannot prove the OS IME and embedded WebView behavior.

## Input methods

### Windows

- UniKey — Telex
- UniKey — VNI
- EVKey — optional but recommended for beta coverage

### macOS

- Vietnamese — Telex
- Vietnamese — Simple Telex or the additional Vietnamese source used by testers

## Strings

Type each string normally, quickly, with correction/backspace, and after selecting/replacing text:

- tiếng Việt
- phương trình
- nếu
- với mọi
- điều kiện
- nghiệm
- tích phân

## Contexts

1. MathLive text mode inside an equation.
2. Condition/text column inside a cases expression.
3. Formula search field.
4. Symbol/template search field.
5. Normal settings text field.

## Behaviors to verify

- No lost diacritics.
- Cursor does not jump during composition.
- Backspace during composition behaves like the native IME.
- Undo after composition removes the completed text in a sensible transaction.
- App shortcuts do not fire while composition is active.
- Switching Math/Text mode after composition does not corrupt the text.
- Paste of Vietnamese Unicode is preserved.

## Result format

Record per OS + IME:

| OS | IME | Context | Result | Notes |
|---|---|---|---|---|
| Windows | UniKey Telex | equation text | PASS/FAIL | |
