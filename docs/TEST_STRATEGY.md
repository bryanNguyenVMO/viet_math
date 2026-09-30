# VietMath — Test Strategy

> Status: Draft v0.1  
> Mục tiêu kiểm thử lớn nhất: không mất hoặc âm thầm thay đổi công thức.

## 1. Testing principles

### 1.1. Semantic correctness > screenshot đẹp

Visual snapshot có giá trị nhưng không đủ.

Cần kiểm tra:

- source;
- structure;
- round-trip;
- editability.

### 1.2. Real platform testing

Các lỗi quan trọng có thể chỉ xuất hiện trên:

- WebView2;
- WKWebView;
- Word desktop;
- PowerPoint desktop;
- Vietnamese IME.

Browser-only CI không thay thế test thật.

### 1.3. Corpus-driven

Dùng fixture equation corpus làm tài sản trung tâm.

Mỗi bug equation nên có regression fixture nếu có thể.

## 2. Test pyramid

### Unit tests

- equation model;
- serializer;
- search normalization;
- capability logic;
- exporters;
- metadata version/migration;
- conversion helpers.

### Component tests

- toolbar;
- palette;
- editor wrapper behavior;
- settings;
- library.

### Integration tests

- editor ↔ equation model;
- model ↔ exporter;
- persistence;
- Office conversion.

### End-to-end

- desktop flows;
- Office add-in flows;
- save/reopen;
- update existing equation.

### Manual exploratory

- IME;
- complex cursor behavior;
- Office host quirks;
- rendering visual quality;
- accessibility.

## 3. Equation corpus

### Phase 0

50+ representative equations.

### Alpha

100–200+.

### 1.0

500+.

Categories:

- arithmetic;
- algebra;
- fraction;
- nested fraction;
- radicals;
- scripts;
- calculus;
- limit;
- sums/products;
- relations;
- Greek;
- sets;
- vectors/accents;
- matrices;
- determinants;
- cases;
- aligned/multiline;
- text;
- Vietnamese text;
- deeply nested expressions;
- edge/invalid drafts.

Fixture fields dự kiến:

```json
{
  "id": "fraction-001",
  "latex": "\\frac{a+b}{c+d}",
  "tags": ["fraction", "basic"],
  "expected": {
    "svg": "supported",
    "mathml": "supported",
    "wordNative": "supported"
  }
}
```

## 4. Editor tests

Phải cover:

- type;
- cursor left/right/up/down;
- enter/exit nested construct;
- selection;
- replace selection;
- backspace boundary;
- delete boundary;
- undo;
- redo;
- paste;
- matrix cell movement;
- add/remove matrix row;
- cases rows;
- text mode;
- invalid draft recovery.

Các tests quan trọng phải assert source/state, không chỉ DOM.

## 5. Vietnamese IME test plan

### Test strings

Ví dụ:

- tiếng Việt;
- phương trình;
- nếu;
- với mọi;
- điều kiện;
- nghiệm;
- tổng;
- tích phân.

### Contexts

- normal text field;
- equation text mode;
- cases condition;
- search box;
- template naming.

### Actions

- type slowly;
- type quickly;
- backspace during composition;
- select/retype;
- undo;
- switch Math/Text mode;
- paste Vietnamese.

### Platforms

Windows:

- UniKey Telex;
- UniKey VNI;
- EVKey as beta coverage where relevant.

macOS:

- built-in Vietnamese Telex;
- other selected input source based on beta users.

Release blocker nếu composition làm mất/đổi text.

## 6. Export tests

### SVG

Assert:

- parseable SVG;
- non-empty bounds;
- expected dimensions range;
- no crop;
- transparency;
- Unicode text.

Golden image comparison có tolerance, không pixel-perfect tuyệt đối giữa platforms nếu font rasterization khác.

### PNG

Assert:

- image dimensions;
- alpha/background;
- scale factor;
- no clip.

### LaTeX

Round-trip supported subset:

```text
source
→ editor
→ exported LaTeX
→ editor
```

So sánh semantic structure, không bắt exact string nếu normalization được chấp nhận.

### MathML

- valid XML;
- supported semantic structure;
- round-trip tests where importer exists.

## 7. Office test matrix

### Word lifecycle

```text
Insert
→ Save
→ Close
→ Reopen
→ Select
→ Edit
→ Update
→ Save
→ Reopen
```

Test:

- one equation;
- 50 equations;
- tables;
- inline/block;
- Vietnamese text;
- copy equation;
- copy between documents;
- send file to second environment;
- external edit conflict.

### PowerPoint lifecycle

```text
Insert
→ resize
→ move
→ save/reopen
→ edit
→ update
```

Test:

- duplicate shape;
- duplicate slide;
- group if supported;
- rotation;
- z-order;
- copy between presentations.

## 8. Compatibility matrix

Initial supported/tested target:

| Platform | App | Priority |
|---|---|---|
| Windows | VietMath Desktop | P0 |
| macOS | VietMath Desktop | P0 |
| Windows | Word Microsoft 365 | P0 |
| macOS | Word Microsoft 365 | P0 |
| Windows | PowerPoint Microsoft 365 | P1 |
| macOS | PowerPoint Microsoft 365 | P1 |

Exact minimum OS/Office versions sẽ được chốt sau telemetry/research/test hardware availability.

## 9. Performance tests

Reference scenarios:

### Startup

- cold start;
- warm reopen;
- quick window show.

### Editing

- simple equation;
- 100-token equation;
- deeply nested equation;
- 10x10 matrix stress case.

### Memory

- idle;
- 10 minutes editing;
- library with 1,000 items;
- repeated open/close.

### Export

- simple SVG;
- complex SVG;
- PNG 1x/2x/4x.

Track p50/p95 where practical.

## 10. Reliability/data-loss tests

High priority:

- kill app during editing;
- crash recovery;
- disk write failure simulation where feasible;
- corrupted local DB recovery;
- invalid draft;
- export failure;
- Office insert failure after edit;
- update conflict;
- schema migration.

Rule:

> Khi output operation fail, current editor source phải vẫn còn.

## 11. Localization tests

- no missing keys;
- Vietnamese/English switching;
- long translated labels;
- Unicode;
- search aliases;
- fallback locale;
- settings persist;
- mathematical notation setting independent from UI language.

## 12. Accessibility checks

- tab order;
- focus visible;
- keyboard-only basic workflow;
- tooltip/aria labels;
- contrast;
- zoom 125/150/200%;
- large system text where relevant.

## 13. CI strategy

CI có thể chạy:

- lint;
- typecheck;
- unit;
- component;
- conversion fixtures;
- exporter tests;
- build smoke tests.

Platform/Office-specific tests:

- scheduled/self-hosted runner nếu cần;
- manual release checklist;
- eventually automated Office E2E where feasible.

Không giả định GitHub-hosted CI có thể validate mọi Office desktop integration.

## 14. Bug severity

### Blocker

- data loss;
- source corruption;
- app không mở;
- IME unusable;
- Office document corruption.

### Critical

- common equation renders/exports sai;
- undo corrupts equation;
- Word edit round-trip broken for supported type.

### Major

- feature broken có workaround;
- layout significant;
- platform-specific regression non-data-loss.

### Minor

- cosmetic;
- low-impact wording;
- edge interaction.

## 15. Release checklist

Trước stable release:

- corpus pass;
- IME checklist pass;
- Office lifecycle pass;
- export golden pass;
- installer/update pass;
- no blocker/critical open;
- migration tested;
- performance regression reviewed;
- supported versions documented;
- known limitations published.
