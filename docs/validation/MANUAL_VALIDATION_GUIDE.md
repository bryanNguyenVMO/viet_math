# Phase 0 — Manual Validation Guide

> Dùng cùng màn **Phase 0 Validation** trong desktop spike.  
> Mỗi máy xuất một JSON kết quả và lưu cùng thông tin phiên bản OS/Office.

## 1. Chuẩn bị

1. Tải artifact tương ứng từ GitHub Actions:
   - `phase0-windows-validation`
   - `phase0-macos-validation`
2. Chạy VietMath validation binary.
3. Mở **Phase 0 Validation**.
4. Với mỗi gate, chọn Đạt/Lỗi/Chờ và ghi rõ cách test.
5. Bấm **Export JSON** khi hoàn tất.

## 2. Vietnamese IME

### Windows

Test tối thiểu:
- UniKey Telex;
- UniKey VNI.

Chuỗi:
- `tiếng Việt`
- `phương trình`
- `nếu`
- `với mọi`
- `điều kiện`
- `nghiệm`
- `tích phân`

Thao tác:
- gõ chậm và nhanh;
- backspace khi đang ghép dấu;
- undo sau khi nhập;
- chuyển Math/Text;
- nhập trong cases;
- nhập ở search field.

**PASS:** không mất dấu, không nhảy selection bất thường, shortcut không chạy trong lúc IME compose.

### macOS

Lặp lại cùng checklist với Vietnamese Telex input source của macOS.

## 3. SVG/PNG fidelity

Dùng các công thức:
- nested fraction + radical;
- integral/summation;
- matrix;
- cases có tiếng Việt;
- dấu mũ/vector/accent.

Kiểm tra:
- không crop;
- nền trong suốt khi yêu cầu;
- scale 1x/2x/4x không vỡ;
- tiếng Việt đúng;
- paste/import vào Word/PowerPoint vẫn nhìn đúng.

## 4. Clipboard

Test:
- Copy LaTeX → text field.
- Copy image → Word.
- Copy image → PowerPoint.
- Copy image → image editor.

Ghi rõ format nào hoạt động trên từng OS.

## 5. Word lifecycle

Luồng bắt buộc:

```text
Insert → Save → Close → Reopen → Recover → Edit → Update
```

Test thêm:
- fraction;
- matrix;
- cases có tiếng Việt;
- sửa native equation ngoài VietMath rồi mở lại;
- copy sang document khác;
- nếu có máy/profile thứ hai: mở và recover source.

**PASS:** supported equation không mất source hoặc bị ghi đè âm thầm.

## 6. PowerPoint lifecycle

Luồng:

```text
Insert → Move/Resize/Rotate → Save → Close → Reopen → Recover → Update
```

Test:
- duplicate shape;
- duplicate slide;
- z-order;
- group/animation nếu có.

**PASS:** update đúng shape và giữ geometry cơ bản theo capability đã document.

## 7. Runtime benchmark

Ghi tối thiểu:
- OS + hardware;
- cold start (3 lần);
- warm reopen/show (3 lần);
- RAM idle;
- RAM khi edit công thức phức tạp;
- cảm nhận typing latency;
- 10x10 matrix stress.

Target tham chiếu nằm trong `docs/PRODUCT.md`; số đo Phase 0 dùng để quyết định có cần đổi kiến trúc hay chỉ tối ưu Phase 1.

## 8. Kết quả

Mỗi platform cần một JSON từ màn validation.

Phase 0 chỉ được đóng khi mọi gate có disposition:
- PASS;
- hoặc FAIL nhưng đã có fix + regression test;
- hoặc scoped limitation + fallback;
- hoặc ADR thay kiến trúc.


## 9. Sideload Office spikes

The repository includes:

- \`apps/word-addin-spike/manifest.xml\`
- \`apps/powerpoint-addin-spike/manifest.xml\`

Both manifests point to \`https://localhost:3000\`.

Serve the repository root through a **trusted HTTPS localhost server** on port 3000, then sideload the relevant manifest into Word/PowerPoint.

Generic static-server shape:

\`\`\`bash
npx http-server -S -C <trusted-localhost-cert.pem> -K <trusted-localhost-key.pem> -p 3000 .
\`\`\`

Use a locally trusted development certificate. Do not bypass certificate warnings inside Office.

### Word

1. Sideload \`apps/word-addin-spike/manifest.xml\`.
2. Open the task pane.
3. Insert sample equation.
4. Save, close, reopen.
5. Recover source.
6. Update sample equation.
7. Record whether the content control/source survived.

### PowerPoint

1. Sideload \`apps/powerpoint-addin-spike/manifest.xml\`.
2. Insert sample shape.
3. Move, resize and rotate it.
4. Save, close, reopen.
5. Update bound shape.
6. Confirm the same shape is updated and geometry is preserved.

These are validation harnesses, not production add-ins.
