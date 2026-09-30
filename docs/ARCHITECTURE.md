# VietMath — Architecture

> Status: Phase 0 provisional architecture v0.2  
> Updated: 2026-09-30  
> Các lựa chọn dependency phải được xác minh trong Phase 0 trước khi coi là locked.

## 1. Mục tiêu kiến trúc

Kiến trúc cần đáp ứng đồng thời:

- Windows + macOS;
- UI hiện đại;
- core editor dùng chung giữa desktop và Office add-in;
- offline-first desktop;
- hỗ trợ LaTeX;
- export SVG/PNG/MathML;
- tích hợp Word/PowerPoint;
- đa ngôn ngữ;
- codebase dễ test và dễ giao cho AI agent/dev tiếp tục phát triển.

## 2. Proposed stack

### Desktop shell

**Tauri 2** là desktop shell được **chấp nhận tạm thời sau Phase 0 automated validation**.

Bằng chứng hiện có:

- Tauri debug binary build thành công trên GitHub-hosted Windows và macOS runners;
- desktop web assets, unit/integration tests và Rust shell build cùng một workflow;
- chưa có build-level blocker buộc phải chuyển sang Electron.

Runtime startup/RAM/IME/clipboard trên máy thật vẫn là manual gate trước khi coi quyết định này fully locked.

Lý do:

- native desktop shell;
- bundle nhẹ hơn hướng Chromium-bundled thông thường;
- có thể viết native integration bằng Rust khi cần;
- dùng web UI chung với Office add-in.

Fallback:

- Electron chỉ được cân nhắc nếu WebView behavior trên Windows/macOS tạo lỗi editor/IME/clipboard quan trọng và chi phí workaround lớn hơn lợi ích về kích thước.

### UI

Frontend/UI stack đã thống nhất ở mức thiết kế:

- React + TypeScript;
- Tailwind CSS;
- shadcn/ui trên nền Radix UI primitives;
- Lucide React cho application icons;
- MathLive cho math symbols/templates trong toolbar và editor;
- Sonner cho toast;
- cmdk cho command/search palette;
- react-resizable-panels cho resizable workspace;
- Zustand cho UI/application state nhẹ;
- react-hook-form + Zod cho settings/forms;
- CSS variables/design tokens cho VietMath Design System;
- i18next hoặc abstraction tương đương cho localization.

Chi tiết visual direction và component rules nằm tại [UI_DESIGN.md](UI_DESIGN.md).

Không dùng PNG/SVG tĩnh để mô phỏng ký hiệu toán học trong toolbar nếu có thể render bằng math engine. Application icon và math symbol là hai hệ riêng.

Animation mặc định dùng CSS transition ngắn; chỉ thêm animation library khi có use case thực sự cần.

### Math editor

**MathLive** được **chấp nhận tạm thời** cho structured interactive editing sau Phase 0 automated validation.

Đã có VietMath adapter cho get/set/insert/focus/undo/redo, structure templates và IME composition guard. Real Windows/macOS Vietnamese IME behavior vẫn phải được chạy qua manual matrix trước Desktop Alpha.

Không wrap trực tiếp MathLive khắp app. Phải tạo adapter:

```
VietMathEditor API
        ↓
 MathLive adapter
```

Mục đích: giảm coupling và cho phép thay/chỉnh engine sau này.

### Rendering/export

Phase 0 findings:

- MathLive cho interactive editor.
- MathLive SSR MathML conversion đã được validate bằng automated tests.
- LaTeX export giữ canonical source.
- MathLive static markup không được coi là self-contained production SVG.
- Generic SVG `foreignObject` chỉ là boundary spike, **không phải production Office SVG strategy**.
- MathJax vẫn là candidate chính để validate self-contained SVG/PNG source khi editor engine không đáp ứng đủ.
- Custom export pipeline giữ renderer-independent interfaces để có thể thay backend.

Không render MathJax sau mỗi keystroke; nếu được chọn, chỉ lazy-load khi export cần nó.

### Storage

Desktop:

- SQLite cho history, favorites, templates, settings metadata.
- File/cache layer cho thumbnail/export cache khi cần.

### Office

- Office.js.
- Word adapter riêng.
- PowerPoint adapter riêng.
- MathML/OMML conversion module riêng.
- Phase 0 Word: OMML primitive + OOXML package + source metadata round-trip đã pass automated tests; Word desktop round-trip vẫn pending manual host validation.
- Phase 0 PowerPoint: bound geometric shape + image fill + tag strategy đã pass automated contracts; actual PowerPoint save/reopen/update remains a manual host gate.

## 3. Monorepo structure dự kiến

```text
viet_math/
├── apps/
│   ├── desktop/
│   ├── word-addin/
│   └── powerpoint-addin/
├── packages/
│   ├── editor/
│   ├── equation-model/
│   ├── renderer/
│   ├── exporters/
│   ├── office-converter/
│   ├── ui/
│   ├── i18n/
│   └── shared/
├── docs/
├── tests/
│   ├── corpus/
│   ├── integration/
│   └── fixtures/
└── tooling/
```

Structure cuối cùng chỉ được scaffold sau Phase 0 design validation.

## 4. Module boundaries

### 4.1. equation-model

Trách nhiệm:

- canonical equation source representation;
- versioning;
- metadata;
- validation state;
- serialization/deserialization.

Không phụ thuộc UI.

Ví dụ logical shape:

```ts
type EquationDocument = {
  schemaVersion: number;
  latex: string;
  draftLatex?: string;
  displayMode: "inline" | "block";
  style: {
    fontSize?: number;
    color?: string;
  };
  engineVersion?: string;
};
```

Đây chỉ là conceptual model; schema chính thức sẽ được chốt khi spike xong.

### 4.2. editor

Trách nhiệm:

- editor lifecycle;
- command API;
- selection/navigation;
- insert template;
- keyboard behavior;
- IME-safe handling;
- undo/redo integration;
- convert editor state ↔ equation model.

Public API không expose quá nhiều implementation detail của MathLive.

### 4.3. renderer

Trách nhiệm:

- preview/output rendering khi cần;
- SVG;
- measurement;
- font/resource handling.

### 4.4. exporters

Trách nhiệm:

- LaTeX;
- SVG;
- PNG;
- MathML;
- clipboard payload preparation.

Mỗi exporter phải có explicit capability/error result.

Không silently drop unsupported content.

### 4.5. office-converter

Trách nhiệm:

- MathML/structured representation → OMML;
- Word OOXML construction;
- Office metadata/source packaging;
- capability checks.

Không đặt Office conversion logic trong React component.

### 4.6. ui

Trách nhiệm:

- toolbar;
- symbol palette;
- dialogs;
- settings UI;
- library UI;
- shared design system.

Không chứa domain conversion.

UI package nên export VietMath-owned components thay vì để feature code import trực tiếp toàn bộ primitive vendor ở nhiều nơi. Mục tiêu là có thể thay đổi implementation mà ít ảnh hưởng feature code.

### 4.7. i18n

Trách nhiệm:

- locale resources;
- term/search aliases;
- formatting rules;
- fallback locale.

UI locale và mathematical notation preference phải là hai setting riêng.

## 5. Data model philosophy

### 5.1. Source first

Không coi PNG/SVG là nguồn chính.

Canonical source phải đủ để:

- mở lại;
- chỉnh sửa;
- migrate schema;
- export lại.

### 5.2. Draft-safe

Người dùng có thể đang nhập công thức chưa hoàn chỉnh.

Do đó cần phân biệt:

- valid canonical source;
- current draft/editor state.

Auto-save không được làm mất draft vì parser/exporter chưa accept.

### 5.3. Derived artifacts

Các output như:

- SVG;
- PNG;
- MathML;
- OMML;

là derived artifacts và có thể cache.

Cache phải invalidated khi source/style thay đổi.

## 6. Desktop data flow

```text
User input
   ↓
Editor adapter
   ↓
Equation model
   ↓
Local persistence
   ↓
Exporter / Clipboard / Office handoff
```

Editor không write trực tiếp SQLite.

Dùng application/service layer để giữ boundary.

## 7. Office data flow

```text
Editor
  ↓
EquationDocument
  ↓
Capability check
  ├─ Native-compatible → structured Office output
  └─ Fallback → SVG/image output
  ↓
Office adapter
  ↓
Document metadata stores VietMath source reference/data
```

Khi edit:

```text
Selected Office object
  ↓
Read metadata/source
  ↓
Detect external modification
  ↓
Load into editor
  ↓
Update
```

## 8. Office source metadata

Không lưu source chỉ trong SQLite của máy tạo.

Tài liệu Office phải giữ đủ thông tin để VietMath có thể phục hồi công thức trên máy khác.

Word và PowerPoint có implementation khác nhau.

Thiết kế metadata phải có:

- VietMath object ID;
- schema version;
- canonical source;
- optional style;
- optional integrity/hash field;
- migration path.

Nếu source quá lớn hoặc API có giới hạn, cần design chunking/compression sau khi benchmark.

## 9. Capability model

Không dùng boolean chung kiểu `isSupported`.

Nên có capability theo target:

```ts
type Capability = {
  editor: "full" | "partial" | "none";
  svg: "full" | "partial" | "none";
  mathml: "full" | "partial" | "none";
  wordNative: "full" | "partial" | "none";
  powerpointNative: "full" | "partial" | "none";
};
```

Mục tiêu là không mất dữ liệu âm thầm.

## 10. Error model

Các error category chính:

- parse/input error;
- unsupported construct;
- export failure;
- clipboard failure;
- Office API failure;
- metadata conflict;
- persistence failure;
- font/resource failure.

UI message phải thân thiện nhưng log nội bộ phải có technical cause.

Không hiện raw stack trace cho user.

## 11. Performance architecture

Nguyên tắc:

- một active editor instance khi có thể;
- virtualize library list;
- lazy-load MathJax/export modules;
- debounce persistence, không debounce cursor feedback;
- cache expensive export;
- avoid global state rerender per keystroke;
- background expensive conversion nếu platform cho phép;
- benchmark WebView behavior thực tế;
- import icon/component theo nhu cầu, tránh kéo cả library vào bundle;
- không dùng animation framework nếu CSS đủ đáp ứng.

## 12. Security

Desktop:

- hạn chế Tauri command surface;
- validate input đi qua native boundary;
- không enable arbitrary shell execution;
- CSP phù hợp;
- package/update signing.

Office add-in:

- HTTPS assets;
- tối thiểu permission cần thiết;
- không gửi document content ra server nếu không có feature explicit yêu cầu.

## 13. Dependency policy

Mỗi dependency quan trọng cần ghi:

- purpose;
- license;
- bundle impact;
- maintenance status;
- platform risk;
- replacement strategy.

Đặc biệt kiểm tra license của:

- editor;
- math fonts;
- icon set;
- UI primitives;
- MathML/OMML converter;
- Office helper libraries.

## 14. Architectural quality gates

Trước khi build feature breadth, phải chứng minh:

1. Editor chạy ổn Windows/macOS.
2. Telex/VNI không bị phá trong text mode.
3. Nested equation navigation ổn.
4. SVG/PNG export không bị crop.
5. Word insert-save-open-edit lifecycle hoạt động.
6. PowerPoint insert-save-open-edit lifecycle có path rõ ràng.
7. Canonical source sống cùng document, không chỉ ở máy local.
8. Benchmark startup/memory nằm trong mức có thể tối ưu.

## 15. ADR

Các quyết định lớn sau Phase 0 nên tạo dưới:

```text
docs/adr/
0001-desktop-shell.md
0002-editor-engine.md
0003-equation-source-model.md
0004-word-storage-and-conversion.md
0005-powerpoint-object-strategy.md
...
```

Không biến ARCHITECTURE.md thành lịch sử của mọi thay đổi.
