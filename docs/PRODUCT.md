# VietMath — Product Specification

> Status: Draft v0.1  
> Updated: 2026-09-30  
> Language: Vietnamese-first, multilingual-ready

## 1. Tổng quan

**VietMath** là phần mềm soạn công thức toán miễn phí dành cho Windows và macOS, hướng đến trải nghiệm trực quan tương tự các công cụ equation editor chuyên nghiệp nhưng ưu tiên:

- dễ sử dụng với người không biết LaTeX;
- hỗ trợ tốt tiếng Việt và bộ gõ tiếng Việt;
- giao diện hiện đại, gọn và dễ học;
- nhẹ, nhanh, offline-first;
- tích hợp tốt với Word và PowerPoint;
- hỗ trợ LaTeX như một input/output format quan trọng;
- miễn phí cho người dùng cuối.

VietMath không đặt mục tiêu chỉ là một "LaTeX previewer". Mục tiêu là một **visual structured math editor** có thể dùng hằng ngày để soạn đề, giáo trình, slide và tài liệu kỹ thuật.

## 2. Product vision

> Người dùng Việt Nam có thể tạo, chèn, chỉnh sửa và tái sử dụng công thức toán một cách tự nhiên mà không cần học LaTeX hoặc phụ thuộc vào phần mềm nặng/phức tạp.

Một phiên làm việc tiêu chuẩn cần đơn giản:

1. Mở VietMath hoặc gọi cửa sổ nhanh.
2. Gõ/chọn cấu trúc công thức.
3. Chỉnh bằng bàn phím hoặc chuột.
4. Copy hoặc chèn vào ứng dụng đích.
5. Mở lại công thức và tiếp tục chỉnh sửa khi cần.

## 3. Nhóm người dùng chính

### 3.1. Giáo viên

Nhu cầu:

- soạn đề kiểm tra;
- soạn giáo án;
- làm tài liệu Word;
- tạo slide PowerPoint;
- dùng nhiều công thức lặp lại;
- không nhất thiết biết LaTeX.

### 3.2. Học sinh, sinh viên

Nhu cầu:

- viết báo cáo;
- làm bài tập;
- chèn công thức vào Word/PowerPoint;
- copy LaTeX vào các nền tảng khác;
- thao tác nhanh bằng bàn phím.

### 3.3. Giảng viên, người viết tài liệu kỹ thuật

Nhu cầu:

- công thức phức tạp;
- ma trận, hệ phương trình, nhiều dòng;
- chất lượng render cao;
- output SVG/MathML/LaTeX;
- workflow nhanh và có thể tái sử dụng.

## 4. Nguyên tắc sản phẩm

### 4.1. Visual-first, LaTeX-friendly

Người dùng không cần biết LaTeX để sử dụng VietMath.

LaTeX vẫn là:

- input nâng cao;
- định dạng trao đổi;
- dữ liệu nguồn quan trọng;
- công cụ cho power user.

### 4.2. Vietnamese-first, không Vietnamese-only

Bản đầu tiên ưu tiên:

- Tiếng Việt;
- English.

Kiến trúc localization phải cho phép thêm ngôn ngữ mà không sửa business logic.

### 4.3. Offline-first

Các chức năng lõi phải hoạt động khi không có Internet:

- soạn công thức;
- lưu lịch sử;
- thư viện;
- copy;
- export;
- mở lại công thức.

Không bắt buộc đăng nhập để dùng editor desktop.

### 4.4. Free core

Không watermark, không giới hạn số công thức, không khóa chức năng soạn cơ bản sau paywall.

Nếu sau này có dịch vụ trả phí, chúng phải là dịch vụ bổ sung như cloud/AI/team features, không phá vỡ core editor miễn phí.

### 4.5. Correctness before feature count

Một editor có 500 biểu tượng nhưng cursor, undo hoặc copy sai không được coi là đạt.

Ưu tiên:

1. cấu trúc công thức đúng;
2. chỉnh sửa ổn định;
3. copy/export đúng;
4. Office lifecycle đúng;
5. sau đó mới tăng breadth của feature.

## 5. Core user journeys

### 5.1. Soạn công thức mới

- Mở VietMath.
- Con trỏ sẵn sàng trong editor.
- Nhập bằng bàn phím hoặc toolbar.
- Preview chính là editor trực tiếp, không cần bước render riêng.
- Copy/chèn công thức.

### 5.2. Chèn vào Word

- Đặt cursor trong Word.
- Mở VietMath add-in.
- Soạn công thức.
- Chọn "Chèn công thức".
- Công thức hiển thị đúng sau khi lưu/mở lại file.
- Có thể chọn công thức và sửa lại.

### 5.3. Chèn vào PowerPoint

- Chọn slide.
- Soạn công thức.
- Chèn vào slide.
- Công thức giữ chất lượng khi scale.
- Có thể mở lại source để sửa.

### 5.4. Người biết LaTeX

- Paste/gõ LaTeX.
- Editor chuyển thành biểu thức có thể chỉnh trực quan.
- Có thể copy LaTeX trở lại.

### 5.5. Tái sử dụng công thức

- Chọn công thức gần đây/favorite/template.
- Chèn hoặc clone để sửa.
- Không cần gõ lại từ đầu.

## 6. Scope v1

### 6.1. Equation editing

Phải có:

- số, biến, toán tử cơ bản;
- superscript/subscript;
- phân số;
- căn bậc hai và căn bậc n;
- ngoặc co giãn;
- tổng, tích;
- tích phân;
- limit;
- đạo hàm;
- lượng giác/log;
- tập hợp;
- vector;
- matrix/determinant;
- system/cases;
- nhiều dòng cơ bản;
- text trong công thức;
- Unicode phổ biến;
- undo/redo;
- cut/copy/paste;
- keyboard navigation.

### 6.2. UI

- Toolbar theo nhóm.
- Search symbol/template.
- Compact mode.
- Advanced/full mode.
- Recent/favorite/templates.
- Light/dark mode.
- Tiếng Việt + English.
- Settings cho shortcut, export và ngôn ngữ.

### 6.3. Export

- LaTeX.
- SVG.
- PNG.
- MathML.
- Clipboard phù hợp với từng output.
- Word-compatible output thông qua Office integration layer.

### 6.4. Desktop

- Windows.
- macOS.
- Không login bắt buộc.
- Auto-save local.
- History local.

### 6.5. Office

- Word: insert + edit lifecycle.
- PowerPoint: insert + edit lifecycle.
- Lưu source đủ để VietMath có thể mở lại công thức.

## 7. Không nằm trong v1

Các mục sau không được chặn v1:

- handwriting recognition;
- OCR từ ảnh;
- AI sinh công thức;
- realtime collaboration;
- cloud sync bắt buộc;
- mobile app;
- full TeX document editor;
- hỗ trợ toàn bộ package LaTeX;
- full compatibility với mọi object MathType lịch sử;
- Google Docs/WPS/LibreOffice integration đầy đủ.

Các mục này được xem là future modules.

## 8. UX principles

### 8.1. Mở là gõ được

Không mở vào dashboard nếu user chỉ muốn tạo một công thức.

### 8.2. Progressive disclosure

Người mới thấy các chức năng cơ bản.

Power user có thể bật:

- LaTeX panel;
- advanced symbols;
- detailed formatting;
- keyboard-first workflow.

### 8.3. Keyboard is first-class

Các thao tác lặp lại phải có shortcut hợp lý.

Tab/arrow/navigation giữa các slot phải predictable.

### 8.4. Không làm hỏng bộ gõ tiếng Việt

IME composition là quality gate.

Shortcut không được bắt phím trong lúc IME đang compose theo cách gây mất dấu.

## 9. Product quality targets

Các con số dưới đây là mục tiêu cần benchmark, không phải cam kết đã đạt:

- Cold start desktop: hướng tới <= 2 giây p95 trên máy tham chiếu.
- Reopen/show existing window: hướng tới <= 300 ms.
- Input latency phổ thông: hướng tới <= 30 ms p95.
- Idle memory: hướng tới <= 150 MB bao gồm WebView.
- Typical memory: hướng tới <= 250 MB.
- Installer: tối ưu để nhỏ nhất có thể; target ban đầu <= 50 MB khi không bundle runtime lớn.

## 10. Privacy

Mặc định:

- equation data ở local;
- không upload công thức lên server;
- không yêu cầu account;
- telemetry nếu có phải minh bạch và opt-in/anonymous theo quyết định sau.

Office add-in có thể cần hosting tài nguyên web, nhưng tài liệu/công thức không được upload chỉ để editor hoạt động nếu không cần thiết.

## 11. Tiêu chí thành công của phiên bản đầu

Một người dùng có thể:

1. cài VietMath;
2. soạn một bộ công thức bằng tiếng Việt;
3. chèn vào Word;
4. lưu và gửi file cho người khác;
5. mở lại tài liệu;
6. tiếp tục chỉnh sửa công thức;
7. export SVG/PNG/LaTeX khi cần;

mà không mất cấu trúc hoặc phải học LaTeX.

## 12. Decision principles

Khi có hai phương án kỹ thuật, ưu tiên theo thứ tự:

1. Correctness.
2. Editability.
3. Compatibility.
4. User experience.
5. Performance.
6. Binary size.
7. Feature breadth.

Một quyết định giúp app nhỏ hơn nhưng làm mất khả năng sửa lại công thức không được ưu tiên.
