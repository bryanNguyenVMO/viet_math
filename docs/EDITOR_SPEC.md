# VietMath — Editor Specification

> Status: Draft v0.1  
> Đây là behavioral spec cho core equation editor.

## 1. Mục tiêu

Editor phải phục vụ được cả hai nhóm:

- người không biết LaTeX;
- power user muốn nhập nhanh bằng keyboard/LaTeX.

Editor là structured math editor, không phải textarea render preview.

## 2. Interaction model

### 2.1. Direct editing

Công thức hiển thị và được sửa tại cùng một vùng.

Không tách bắt buộc thành:

- ô code;
- ô preview.

LaTeX panel là optional advanced panel.

### 2.2. Slot navigation

Các construct có slot:

- fraction: numerator/denominator;
- root: index/body;
- superscript/subscript;
- matrix cells;
- cases rows.

Keyboard navigation phải predictable.

Ví dụ fraction:

```text
insert fraction
→ cursor ở numerator
→ Tab/arrow theo rule đã định nghĩa
→ denominator
→ ra ngoài fraction
```

Rule cụ thể phải được test, không dựa vào incidental behavior của dependency.

## 3. Editing operations

Phải hỗ trợ ổn định:

- cursor movement;
- selection;
- select subtree;
- insert;
- replace selection;
- backspace/delete;
- cut;
- copy;
- paste;
- undo;
- redo;
- duplicate template;
- matrix row/column operations.

Undo transaction cần semantic:

Một action "insert fraction template" nên undo như một operation hợp lý, không phải nhiều bước DOM nhỏ.

## 4. Input modes

### 4.1. Math mode

Default.

Nhập:

- numbers;
- identifiers;
- operators;
- shortcuts;
- symbols.

### 4.2. Text mode

Cho nội dung như:

- "nếu";
- "với";
- units/labels;
- mô tả trong cases.

Text mode phải hỗ trợ Unicode và tiếng Việt đầy đủ.

### 4.3. LaTeX input

Có hai cách dự kiến:

- paste/import LaTeX;
- optional raw LaTeX panel đồng bộ với structured editor.

Nếu raw input tạm invalid:

- giữ text;
- không xóa input;
- báo lỗi nhẹ;
- cho user sửa tiếp.

## 5. Vietnamese IME

Đây là release blocker.

Phải test:

### Windows

- UniKey Telex.
- UniKey VNI.
- EVKey nếu nhóm beta sử dụng đáng kể.

### macOS

- Vietnamese Telex.
- Vietnamese input source phổ biến khác được chọn trong test matrix.

Trong IME composition:

- không trigger symbol shortcut sai;
- không commit editor command trước compositionend;
- không mất dấu;
- selection không nhảy;
- undo không chia một ký tự tiếng Việt thành trạng thái vô nghĩa.

## 6. Keyboard shortcuts

Nguyên tắc:

- không conflict với OS/app convention phổ biến;
- có thể customize ở phase sau;
- shortcut math không bắt phím khi text IME đang compose;
- macOS dùng Command convention;
- Windows dùng Ctrl convention.

Baseline:

- Undo/Redo.
- Cut/Copy/Paste.
- Select all.
- Save/favorite nếu phù hợp.
- Open quick editor.
- Optional shortcut cho fraction/root/superscript sau khi user research.

Không hard-code quá nhiều shortcut từ đầu.

## 7. Toolbar

Toolbar chia theo semantic group:

- Basic.
- Fraction & radical.
- Script.
- Calculus.
- Relation.
- Greek.
- Set.
- Matrix.
- Geometry.
- Text/templates.

### Compact mode

Hiển thị nhóm thường dùng.

### Full mode

Hiển thị nhiều category và search.

Không tạo hàng trăm button luôn visible.

## 8. Symbol/template search

Search cần hỗ trợ:

- tiếng Việt có dấu;
- tiếng Việt không dấu;
- English alias;
- symbol name;
- LaTeX command alias.

Ví dụ:

```text
"phân số"
"phan so"
"fraction"
"frac"
```

đều có thể tìm fraction template.

Normalization chỉ dùng cho search index, không modify equation content.

## 9. Formatting

v1 cần tối thiểu:

- font size;
- color;
- inline/block mode;
- math/text style theo capability của engine.

Không ưu tiên typography tuning cực sâu trước editor correctness.

## 10. Matrix UX

Phải hỗ trợ:

- insert preset 2x2, 3x3;
- custom dimensions;
- add row/column;
- remove row/column;
- keyboard movement cell-to-cell;
- bracket type.

Guard:

- action remove không được tạo invalid matrix;
- confirm không cần thiết cho row nhỏ nhưng undo phải hoạt động.

## 11. Cases/system UX

User có thể:

- add/remove row;
- nhập expression;
- nhập condition text;
- di chuyển giữa columns;
- dùng tiếng Việt ở condition.

## 12. Paste behavior

Paste ưu tiên theo type:

1. VietMath structured payload nếu có.
2. MathML nếu supported và trusted/validated.
3. LaTeX-like text nếu detect rõ.
4. Plain text.

Không tự đoán aggressive khiến text bình thường thành công thức sai.

Có thể hỏi/import option khi ambiguity cao.

## 13. Copy behavior

UI không chỉ có một "Copy" mơ hồ.

Actions:

- Copy equation.
- Copy LaTeX.
- Copy MathML.
- Copy image.
- Save SVG.
- Save PNG.

"Copy equation" có thể dùng best platform clipboard payload, nhưng advanced outputs vẫn explicit.

## 14. Export behavior

### SVG

- scalable;
- transparent background mặc định;
- không crop accent/root/large operator;
- self-contained ở mức hợp lý.

### PNG

- configurable scale;
- transparent hoặc background option;
- đúng bounding box.

### LaTeX

- deterministic trong supported subset;
- không optimize/reorder biểu thức theo algebra mặc định.

### MathML

- valid output cho supported construct;
- test round-trip where applicable.

## 15. Equation library

Categories:

- Recent.
- Favorites.
- Templates.
- User collections.

Mỗi item lưu canonical source, không chỉ thumbnail.

Thumbnail được generate/cache async.

## 16. Autosave

Editor draft:

- autosave local;
- crash/restart có thể phục hồi;
- debounce hợp lý;
- không block keystroke.

User không cần bấm Save chỉ để giữ current draft.

## 17. Error UX

Parse/draft error:

- inline subtle message;
- highlight nếu xác định được;
- không modal mỗi keystroke.

Export error:

- nói target nào không hỗ trợ;
- cho fallback nếu có.

Ví dụ:

> Cấu trúc này chưa hỗ trợ công thức Word native. Bạn có thể chèn dưới dạng vector và vẫn chỉnh sửa lại bằng VietMath.

## 18. Accessibility

Baseline:

- keyboard-accessible toolbar;
- visible focus;
- contrast;
- tooltip/accessible name;
- zoom 125–200%;
- không phụ thuộc màu duy nhất để thể hiện state.

Screen-reader math semantics sẽ được đánh giá riêng theo engine/platform capability.

## 19. Editor acceptance corpus

Phase 0 bắt đầu với ít nhất các dạng:

```latex
x^2 + y^2 = z^2
\frac{-b\pm\sqrt{b^2-4ac}}{2a}
\int_0^1 x^2\,dx
\sum_{i=1}^{n} i
\lim_{x\to 0}\frac{\sin x}{x}
\begin{bmatrix}a&b\\c&d\end{bmatrix}
f(x)=\begin{cases}x^2 & \text{nếu }x\ge0\\-x & \text{nếu }x<0\end{cases}
```

Corpus sẽ tăng dần lên 500+ fixtures trước stable 1.0.

## 20. Không được coi là hoàn thành nếu

- render đẹp nhưng cursor sai;
- copy thành công nhưng mất source;
- Telex làm mất dấu;
- undo làm hỏng cấu trúc;
- unsupported construct bị silently dropped;
- opening an invalid draft làm mất nội dung.
