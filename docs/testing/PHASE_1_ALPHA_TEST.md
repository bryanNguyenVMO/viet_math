# Phase 1 — Alpha User Test

> Status: Ready for tester sessions  
> Target: **5–10** người dùng thật trước khi đóng Desktop Alpha.

## Nhóm tester đề xuất

- 3–5 **Giáo viên** / người thường xuyên soạn đề, giáo án.
- 2–3 sinh viên.
- 1–2 người đã quen LaTeX.

Ưu tiên có cả Windows và macOS.

## Cách chạy

- Tester dùng VietMath độc lập, người hướng dẫn không thao tác hộ.
- Người hướng dẫn chỉ đọc task, ghi thời gian, lỗi và câu hỏi.
- Không giải thích vị trí button trước khi tester thử.
- Mỗi task ghi **Task success**, **Time**, lỗi và UX friction.

## Tasks

### Task A — Phương trình bậc hai

Yêu cầu:

> Tạo công thức nghiệm của **phương trình bậc hai**.

Expected: tester tìm/chèn được fraction, căn và ± mà không cần biết LaTeX.

### Task B — Hệ phương trình

Yêu cầu:

> Tạo một **hệ phương trình** gồm hai dòng.

Expected: dùng cases/system structure, di chuyển được giữa các slot.

### Task C — Tiếng Việt

Yêu cầu:

> Tạo một biểu thức cases có chữ **“nếu”** và nhập thêm một câu **tiếng Việt**.

Expected: dấu tiếng Việt không lỗi, không bị shortcut làm gián đoạn IME.

### Task D — Search

Yêu cầu:

> Tìm và chèn ký hiệu tích phân mà không dò toàn bộ toolbar.

Tester thử một trong:

- `tích phân`
- `tich phan`
- `integral`
- `int`

Expected: search trả đúng cấu trúc.

### Task E — Export PNG

Yêu cầu:

> **Export PNG** công thức vừa tạo và sử dụng ảnh đó trong một tài liệu.

Kiểm tra:

- không crop;
- nền đúng setting;
- scale đủ sắc nét.

### Task F — Recent/Favorite

Yêu cầu:

> Mở lại một công thức gần đây và đánh dấu Favorite.

Expected: không phải nhập lại công thức.

### Task G — Quick Editor

Yêu cầu:

> Gọi Quick Editor bằng shortcut, nhập một công thức và copy kết quả.

Expected: cửa sổ xuất hiện nhanh, focus sẵn sàng nhập.

### Task H — Recovery

Yêu cầu:

> Đang nhập dở một công thức, đóng app không theo luồng Save, sau đó mở lại.

Expected: draft có thể khôi phục, không mất source.

## Metrics

Mỗi task ghi:

- **Task success**: Pass / Fail / Pass with help.
- **Time**: giây.
- số lần click thử sai;
- user có hỏi trợ giúp không;
- lỗi kỹ thuật;
- **UX friction**: điểm khiến tester dừng, tìm lâu hoặc hiểu sai.

Không dùng câu hỏi “app đẹp không?” làm metric chính.

## Exit criteria

Alpha user testing được coi là đạt khi:

- có ít nhất 5 tester hoàn thành bộ test;
- không phát hiện data-loss blocker;
- Task A–E có tỷ lệ hoàn thành không cần trợ giúp đủ tốt để tiếp tục beta;
- IME không có lỗi chặn sử dụng;
- mọi blocker/critical finding có issue hoặc regression test trước khi đóng Phase 1.

Kết quả từng tester dùng template:
`docs/testing/PHASE_1_ALPHA_RESULT_TEMPLATE.md`.
