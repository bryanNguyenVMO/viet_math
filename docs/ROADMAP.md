# VietMath — Development Roadmap

> Status: Planning v0.2  
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

Implementation detail được tách theo phase để tránh over-plan:

- [Phase 0 — Technical Validation](phases/PHASE_0_TECHNICAL_VALIDATION.md)
- [Phase 1 — Desktop Alpha](phases/PHASE_1_DESKTOP_ALPHA.md)
- [Phase 2 — Word Beta](phases/PHASE_2_WORD_BETA.md)
- [Phase 3 — PowerPoint + Document Productivity](phases/PHASE_3_POWERPOINT.md)
- [Phase 4 — 1.0 Stabilization](phases/PHASE_4_STABILIZATION.md)

Phase 0 được viết thành implementation plan chi tiết ngay. Phase 1–4 chỉ là brief và sẽ được mở rộng sau khi phase trước cung cấp bằng chứng kỹ thuật mới.

## 2. Phase 0 — Technical Validation

Estimated: 2–3 tuần với team nhỏ full-time.

### Mục tiêu

Xác minh các rủi ro kiến trúc lớn trước khi scaffold sản phẩm đầy đủ.

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

Chi tiết: [PHASE_0_TECHNICAL_VALIDATION.md](phases/PHASE_0_TECHNICAL_VALIDATION.md)

## 3. Phase 1 — Desktop Alpha

Estimated: 4–6 tuần sau Phase 0.

### Scope

- production desktop shell;
- production editor wrapper;
- compact/full toolbar;
- symbol/template search;
- Vietnamese + English;
- recent/favorites/templates;
- settings;
- autosave/history;
- LaTeX/SVG/PNG/MathML;
- light/dark/system theme.

### Quality gates

- 100+ equation corpus;
- IME regression coverage;
- crash recovery;
- no known data-loss bug;
- typing/startup/memory metrics measured.

Chi tiết: [PHASE_1_DESKTOP_ALPHA.md](phases/PHASE_1_DESKTOP_ALPHA.md)

## 4. Phase 2 — Word Beta

Estimated: 5–8 tuần.

### Scope

- Office add-in shell;
- shared editor package;
- Word insert/edit/update;
- native/fallback capability check;
- metadata source persistence;
- conflict detection;
- save/reopen lifecycle;
- transfer/copy tests.

### Exit criteria

Một tester có thể soạn file Word gồm các công thức supported, đóng/mở lại, chuyển sang môi trường supported khác và tiếp tục edit mà không mất source.

Chi tiết: [PHASE_2_WORD_BETA.md](phases/PHASE_2_WORD_BETA.md)

## 5. Phase 3 — PowerPoint + Document Productivity

Estimated: 3–5 tuần.

### Scope

- insert vector;
- source metadata;
- edit/update;
- preserve geometry;
- duplicate slide/shape handling;
- optional document productivity only after reliability is green.

Chi tiết: [PHASE_3_POWERPOINT.md](phases/PHASE_3_POWERPOINT.md)

## 6. Phase 4 — 1.0 Stabilization

Estimated: 3–5 tuần.

### Scope

- expand equation corpus lên 500+;
- bug burn-down;
- accessibility baseline;
- installer/updater;
- signing/notarization;
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

Chi tiết: [PHASE_4_STABILIZATION.md](phases/PHASE_4_STABILIZATION.md)

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

Không tạo `develop` chỉ vì convention nếu chưa có nhu cầu thực tế.

Suggested branches được phase plan định nghĩa theo từng subsystem để spike/feature có thể review độc lập.

## 9. Definition of Done chung

Một feature không Done chỉ vì UI hoạt động.

Cần:

- requirements/acceptance criteria;
- tests phù hợp;
- supported platform test;
- error path;
- i18n string nếu có UI;
- keyboard/accessibility consideration;
- docs update nếu behavior public;
- no known silent data loss.

## 10. Project documentation workflow

Trước implementation lớn:

1. Update product/architecture spec nếu requirement đổi.
2. Nếu là quyết định kiến trúc: thêm ADR.
3. Mở rộng phase brief thành implementation plan chi tiết.
4. Implement trên feature branch.
5. PR.
6. Tests/benchmark.
7. Merge.
8. Update roadmap/phase status.

Repository docs là source-of-truth cho AI agent và developer; tránh duplicate requirement dài ở nhiều hệ thống nếu không cần.

## 11. Current next step

Review [Phase 0 implementation plan](phases/PHASE_0_TECHNICAL_VALIDATION.md). Sau khi plan được approve, bắt đầu branch/spike đầu tiên thay vì scaffold toàn bộ production app.
