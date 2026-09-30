# VietMath — Microsoft Office Integration

> Status: Design v0.2 — Phase 0 findings incorporated  
> Office integration là subsystem độc lập và phải được test trên Office thật.

## 1. Mục tiêu

VietMath phải hỗ trợ workflow:

```text
Create → Insert → Save → Close → Reopen → Edit → Update
```

Không coi "paste một ảnh vào Word" là hoàn thành tích hợp.

## 2. Nguyên tắc chung

- Source equation phải sống cùng document ở mức cần thiết.
- File gửi sang máy khác vẫn hiển thị.
- Nếu máy khác có VietMath/add-in, source có thể được phục hồi để edit.
- Không phụ thuộc duy nhất vào local SQLite.
- Không silently overwrite external edits.
- Native Office equation và visual-preserving fallback là hai capability khác nhau.

## 3. Word integration

### 3.1. Preferred path: native Word equation

Target:

```text
Equation model
  ↓
MathML/intermediate structure
  ↓
OMML
  ↓
Word OOXML / Office API
```

Native Word equation có lợi:

- hòa vào document;
- Word có thể render/edit;
- accessibility/format behavior gần Office hơn.

Nhưng chỉ dùng native path khi conversion được xác minh.

### 3.2. Fallback path

Nếu construct không convert đủ fidelity:

- insert SVG/image;
- embed VietMath source metadata;
- cho phép "Edit with VietMath".

UI phải báo rõ đây là visual fallback.

### 3.3. Word object identity

Mỗi object VietMath cần unique ID.

Proposed data:

```text
vietmathObjectId
schemaVersion
source
style
targetMode
hash/version
```

Phase 0 automated spike đã chứng minh được:

- OMML primitives có thể được đóng trong Word OOXML `pkg:package`;
- equation có thể nằm trong `w:sdt` content control;
- VietMath source metadata có thể round-trip qua một encoded tag cho short fixtures.

**Ruling:** full source trong `w:tag` chỉ là Phase 0 proof-of-concept. Production nên giữ tag nhỏ (object ID/schema/version) và lưu full source ở document-level metadata/custom XML hoặc cơ chế tương đương đã được host-test.

Word desktop insert/save/reopen/edit vẫn phải được validate trên Microsoft 365 Windows/macOS trước Phase 2.

## 4. Editing existing Word equation

Luồng:

1. User chọn object/công thức.
2. Add-in xác định object type.
3. Tìm VietMath metadata.
4. Nếu source tồn tại: load source.
5. Nếu source không tồn tại nhưng native equation có thể parse: thử import.
6. Nếu không thể import: thông báo giới hạn, không giả vờ edit source cũ.
7. Khi update: kiểm tra conflict.
8. Replace/update object.
9. Update metadata/version.

## 5. External modification conflict

Case:

```text
VietMath insert
→ user sửa trực tiếp trong Word
→ VietMath edit
```

Không được lấy source cũ ghi đè ngay.

Cần detection dựa trên:

- current native structure/hash;
- stored version/hash;
- timestamp không đủ đáng tin một mình.

Possible outcomes:

- no conflict → edit normally;
- can re-import → load latest Word structure;
- conflict cannot reconcile → hỏi user chọn latest Word version hoặc stored VietMath source.

## 6. Word formatting

Phải test:

- inline equation;
- display/block equation;
- font size;
- surrounding paragraph;
- tables;
- headers/footers nếu scope;
- line wrapping;
- copy/paste giữa đoạn;
- tracked changes;
- document read-only;
- protected document.

v1 không cần support tất cả nếu Office API hạn chế, nhưng limitation phải documented.

## 7. Copy between documents

Đặc biệt kiểm tra:

- copy Word object sang document khác;
- metadata có đi theo hay không;
- object ID collision;
- source retention.

Nếu metadata không tự đi theo ổn định, add-in cần managed copy/import strategy hoặc source recovery.

## 8. PowerPoint integration

### 8.1. v1 preferred path

Phase 0 chọn strategy ưu tiên:

1. tạo geometric shape;
2. fill shape bằng equation image/vector-compatible rendering;
3. gắn VietMath tag/object ID;
4. dùng PowerPoint shape binding khi PowerPointApi 1.8 khả dụng;
5. khi edit, update `shape.fill.setImage(...)` trên **cùng shape** thay vì delete/reinsert.

Lý do:

- shape ID/tags cho object identity;
- binding cho stable lookup;
- update cùng shape giúp giữ geometry tốt hơn;
- không phụ thuộc vào preview-only picture insertion path.

PowerPoint native equation path vẫn là separate capability và không được giả định giống Word.

### 8.2. Update shape

Khi edit và replace visual:

Phải cố giữ:

- x/y;
- width/height;
- rotation;
- z-order nếu API cho phép;
- accessibility title/alt;
- grouping behavior cần test;
- animation behavior cần test riêng.

Nếu không giữ được attribute nào, limitation phải rõ.

## 9. PowerPoint object identity

Mỗi inserted shape có VietMath object ID.

Phase 0 dùng shape tag để chứng minh object/source round-trip ở mức short fixture.

Production target:

- shape tag giữ VietMath object ID/schema pointer;
- full source chuyển sang document-level store nếu host validation xác nhận một cơ chế đáng tin;
- binding ID dùng dạng `vietmath:<object-id>` khi binding API khả dụng.

Phải xử lý:

- duplicate slide;
- duplicate shape;
- copy giữa presentations;
- ID collision.

## 10. Office add-in architecture

```text
Shared editor UI
      ↓
Office host abstraction
      ├── WordHostAdapter
      └── PowerPointHostAdapter
```

Không viết component UI kiểu:

```ts
if (isWord) { ...huge logic... }
if (isPowerPoint) { ...huge logic... }
```

Host adapter expose use cases:

- getSelection;
- insertEquation;
- readEquation;
- updateEquation;
- getCapabilities;
- saveMetadata;
- readMetadata.

## 11. Add-in hosting/offline

Desktop core là offline-first.

Office add-in dùng web technology và có deployment/hosting constraints riêng. Vì vậy không được quảng cáo "Office add-in always offline" cho đến khi cache/offline behavior được test trên target Office versions.

Cần phân biệt rõ:

- Desktop offline capability.
- Office add-in network/deployment requirement.

## 12. Compatibility strategy

Bản đầu test ưu tiên:

### Windows

- Microsoft 365 Word desktop.
- Microsoft 365 PowerPoint desktop.

### macOS

- Microsoft 365 Word.
- Microsoft 365 PowerPoint.

Sau đó mới mở rộng matrix theo nhu cầu user thực tế.

Không claim broad Office version support khi chưa test.

## 13. Native conversion test groups

Phải cover:

- superscript/subscript;
- fraction;
- radicals;
- delimiters;
- sum/product;
- integral;
- limit;
- accents;
- matrix;
- cases;
- aligned/multiline;
- text with Vietnamese;
- nested combinations.

Mỗi fixture có expected:

- insert succeeds;
- semantic structure;
- visual fidelity;
- read-back/editability.

## 14. Failure behavior

Nếu Word native conversion fail:

Không drop symbol.

Return explicit result:

```text
Native Word equation unsupported
→ Offer "Insert as editable VietMath vector"
```

Nếu Office API call fail:

- source vẫn còn trong editor;
- user có thể retry/copy;
- không mất draft.

## 15. Security/privacy

Add-in không upload document contents lên server chỉ để convert nếu conversion có thể local/client-side.

Nếu sau này cần server feature:

- user phải biết;
- scope data rõ;
- privacy policy rõ;
- core edit workflow không phụ thuộc nếu có thể tránh.

## 16. Phase 0 Office proof-of-concept

Trước khi build UI hoàn chỉnh, cần prototype:

### Word

1. Insert fraction.
2. Insert nested radical.
3. Insert matrix.
4. Insert Vietnamese text in cases.
5. Store source metadata.
6. Save file.
7. Close/reopen.
8. Select and edit.
9. Send file to second machine/profile and repeat.

### PowerPoint

Automated spike hiện có:

1. metadata encode/decode;
2. stable binding ID policy;
3. bound geometric-shape host contract;
4. same-shape image update strategy;
5. geometry snapshot preservation contract;
6. duplicate object must receive a new VietMath ID.

Manual Microsoft 365 Windows/macOS gate còn lại:

1. insert rendered equation image/vector-compatible output;
2. save/reopen;
3. recover tag/binding;
4. edit and refresh same shape;
5. verify x/y/width/height/rotation;
6. verify duplicate shape/slide ID handling;
7. verify z-order/grouping/animation limitations.

Nếu proof-of-concept không ổn, architecture phải được điều chỉnh trước feature expansion.
