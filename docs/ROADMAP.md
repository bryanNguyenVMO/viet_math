# VietMath — Development Roadmap

> Status: Planning v0.1  
> Roadmap này dùng exit criteria thay vì chỉ dùng deadline.

## 1. Nguyên tắc triển khai

Không bắt đầu bằng việc clone toàn bộ toolbar của MathType.

Thứ tự ưu tiên:

1. Technical feasibility.
2. Editor correctness.
3. Vietnamese input.
4. Export.
5. Word lifecycle.
6. PowerPoint lifecycle.
7. UX polish.
8. Feature breadth.

## 2. Phase 0 — Technical Validation

Estimated: 2–3 tuần với team nhỏ full-time.

### Mục tiêu

Xác minh các rủi ro kiến trúc lớn trước khi scaffold sản phẩm đầy đủ.

### Tasks

#### Desktop shell

- Prototype Tauri 2.
- React + TypeScript.
- Windows build.
- macOS build.
- Measure startup/RAM baseline.

#### Editor

- Integrate MathLive candidate.
- Create thin adapter.
- Fraction/root/script/matrix/cases.
- Undo/redo.
- Paste LaTeX.
- Extract LaTeX.

#### Vietnamese IME

- Telex.
- VNI.
- Text inside equation.
- Composition event handling.

#### Export

- SVG.
- PNG.
- MathML.
- Bounding box tests.

#### Word spike

- Insert native equation candidate.
- Store source metadata.
- Save/reopen.
- Edit/update.

#### PowerPoint spike

- Insert vector equation.
- Store source identity.
- Save/reopen.
- Edit/replace.

### Exit criteria

Phase 0 pass khi:

- editor basic ổn trên Windows/macOS;
- IME không có blocker;
- export không crop;
- Word round-trip có viable path;
- PowerPoint round-trip có viable path;
- performance baseline không cho thấy kiến trúc cần đổi ngay.

### Deliverables

- spike code;
- benchmark report;
- ADR cho stack;
- supported/unsupported notes;
- decision: proceed / modify architecture.

## 3. Phase 1 — Desktop Alpha

Estimated: 4–6 tuần sau Phase 0.

### Scope

- application shell;
- production editor wrapper;
- toolbar compact;
- symbol/template search;
- Vietnamese + English;
- recent equations;
- favorites;
- templates;
- settings;
- autosave;
- history;
- LaTeX import/export;
- SVG/PNG/MathML export;
- basic keyboard shortcuts;
- light/dark mode.

### Quality gates

- 100+ equation corpus.
- IME regression suite/manual checklist.
- Crash recovery draft.
- No known data-loss bug.
- p95 typing target measured.

### Alpha audience

- internal;
- 5–10 giáo viên/người soạn tài liệu thử nghiệm.

## 4. Phase 2 — Word Beta

Estimated: 5–8 tuần.

### Scope

- Office add-in shell.
- Shared editor package.
- Word insert.
- Word edit existing VietMath equation.
- Native/fallback capability check.
- Metadata source persistence.
- Conflict detection.
- Save/reopen lifecycle.
- Copy/document transfer tests.

### Exit criteria

Một tester có thể soạn một file Word gồm nhiều loại công thức, đóng/mở lại, gửi sang máy test thứ hai và tiếp tục edit mà không mất source ở các case supported.

## 5. Phase 3 — PowerPoint + Document Tools

Estimated: 3–5 tuần.

### PowerPoint

- insert vector;
- source metadata;
- edit/update;
- preserve geometry;
- duplicate slide handling.

### Document productivity

Sau khi Office lifecycle ổn mới cân nhắc:

- equation numbering;
- cross-reference helper;
- style presets;
- batch style update;
- recent/template integration trong add-in.

Không để document utilities làm chậm core reliability.

## 6. Phase 4 — 1.0 Stabilization

Estimated: 3–5 tuần.

### Scope

- expand equation corpus lên 500+;
- bug burn-down;
- accessibility baseline;
- installer polish;
- updater;
- code signing;
- macOS notarization;
- crash/log strategy;
- language review;
- performance tuning;
- public documentation.

### Release gates

- không có known critical data-loss bug;
- no release-blocking IME bug;
- Office round-trip pass trên supported matrix;
- export golden tests pass;
- install/update pass;
- privacy behavior documented.

## 7. Post-1.0 candidates

Không cam kết thứ tự cho đến khi có user data:

- OCR formula image.
- Handwriting.
- AI text/image → equation.
- Google Docs.
- WPS Office.
- LibreOffice.
- Cloud sync optional.
- Team template library.
- MathType legacy object import.
- Windows deep integration.
- Native PowerPoint equation path nếu feasible.
- Mobile companion.

## 8. Branch strategy

Giai đoạn đầu:

```text
main
└── feature/*
```

Khi project có release cadence/team lớn hơn có thể thêm release branches nếu cần.

Không tạo `develop` chỉ vì convention nếu chưa có nhu cầu thực tế.

### Suggested branches

```text
feature/phase-0-desktop-spike
feature/phase-0-office-spike
feature/editor-core
feature/export
feature/word-addin
feature/powerpoint-addin
```

PR phải nhỏ đủ để review.

## 9. Definition of Done chung

Một feature không Done chỉ vì UI hoạt động.

Cần:

- requirements/acceptance criteria;
- unit/integration tests phù hợp;
- supported platform test;
- error path;
- i18n string;
- keyboard/accessibility consideration;
- docs update nếu behavior public;
- no known silent data loss.

## 10. Project documentation workflow

Trước implementation lớn:

1. Update product/architecture spec nếu requirement đổi.
2. Nếu là quyết định kiến trúc: thêm ADR.
3. Tạo implementation plan/ticket.
4. Implement trên feature branch.
5. PR.
6. Tests/benchmark.
7. Merge.
8. Update roadmap status.

Repository docs là source-of-truth cho AI agent và developer; không duplicate requirement dài ở nhiều hệ thống nếu không cần.

## 11. Initial next step

Sau commit tài liệu này, việc tiếp theo không phải làm toàn bộ app.

Việc tiếp theo là lập implementation plan chi tiết cho **Phase 0 — Technical Validation**, sau đó tạo branch và thực hiện từng spike có benchmark/exit criteria.
