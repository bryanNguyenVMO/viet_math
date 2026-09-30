# VietMath — UI Design & Frontend Stack

> Status: Approved direction v0.1  
> Updated: 2026-09-30  
> Mục tiêu: nhanh để phát triển, đẹp, nhẹ, dễ tùy biến và giữ được nhận diện riêng của VietMath.

## 1. Visual direction

VietMath là desktop productivity app, không phải admin dashboard và cũng không phải mobile app phóng to.

Visual direction:

- hiện đại;
- sạch;
- sáng;
- mật độ thông tin vừa phải;
- ưu tiên vùng soạn công thức;
- gần với cảm giác quen thuộc của Office/Windows nhưng không clone;
- bo góc vừa phải;
- shadow nhẹ;
- màu primary xanh;
- typography rõ ràng;
- math typography tách biệt khỏi UI typography.

Tinh thần tổng thể:

```text
Office familiarity
+ Windows 11 cleanliness
+ Linear/Notion simplicity
+ dedicated math editor workflow
```

## 2. Main editor layout

Desktop main window ưu tiên layout ba vùng:

```text
┌──────────────────────────────────────────────────────────────────┐
│ Menu / toolbar                                                   │
├──────────────┬──────────────────────────────────┬────────────────┤
│ Recent /     │                                  │ Symbol /       │
│ Library      │          Main editor             │ Structure      │
│              │                                  │ panel          │
├──────────────┴──────────────────────────────────┴────────────────┤
│ Formatting / status / contextual controls                        │
└──────────────────────────────────────────────────────────────────┘
```

Left/right panel có thể:

- collapse;
- resize;
- nhớ kích thước gần nhất.

Main editor luôn là vùng ưu tiên về diện tích.

## 3. Frontend stack

### Core

- React.
- TypeScript.

### Styling

- Tailwind CSS.
- CSS variables/design tokens.
- Không để feature code hard-code màu/radius tùy ý.

### Component primitives

- shadcn/ui.
- Radix UI primitives bên dưới.

shadcn được dùng như nguồn component có thể sở hữu/chỉnh sửa trong codebase, không phải visual identity mặc định.

Mọi component chính cần được bọc/chuẩn hóa theo VietMath Design System.

### Icons

- Lucide React cho application icons.

Ví dụ:

- Settings;
- Search;
- Star;
- Copy;
- Undo/Redo;
- Delete;
- Download;
- Language;
- Library.

Không dùng Font Awesome làm icon set chính.

### Mathematical symbols

Math symbols và structure preview phải render từ math engine, ưu tiên MathLive/math font.

Ví dụ:

- fraction;
- square root;
- integral;
- summation;
- limit;
- matrix;
- Greek symbols.

**Không dùng application icon library để giả lập ký hiệu toán.**

**Không dùng PNG/SVG tĩnh cho ký hiệu toán nếu engine có thể render trực tiếp.**

Lợi ích:

- đúng typography toán;
- sắc nét ở Retina/4K;
- scale tốt;
- nhất quán với nội dung editor.

## 4. Supporting libraries

### Sonner

Dùng cho toast nhẹ:

- copied;
- saved;
- favorite added;
- export warning;
- Office capability fallback.

Toast không dùng cho error cần user quyết định.

### cmdk

Dùng cho symbol/template search và command palette.

Search aliases hỗ trợ:

```text
phân số
phan so
fraction
frac
```

cùng tìm ra fraction template.

### react-resizable-panels

Dùng cho workspace panel resize.

Áp dụng cho:

- recent/library panel;
- editor;
- symbol panel.

### Zustand

Dùng cho UI/application state gọn.

Các state phù hợp:

- active panel;
- editor display mode;
- theme;
- locale;
- selected symbol category;
- temporary workspace state.

Không đưa equation domain source vào Zustand một cách tùy tiện nếu domain layer đã có owner riêng.

### react-hook-form + Zod

Dùng cho:

- settings;
- preferences;
- form validation;
- import/export option dialogs.

## 5. Animation

Không thêm Framer Motion/Motion ở phase đầu chỉ để làm đẹp.

Dùng CSS transition cho interaction nhỏ:

- hover: 100–150 ms;
- popover: khoảng 150 ms;
- panel open/close: 150–200 ms;
- dialog: 150–200 ms.

Chỉ thêm animation framework khi có interaction thực sự khó làm sạch bằng CSS.

Mục tiêu là responsive, không "múa UI".

## 6. VietMath Design System

### Design tokens

Ít nhất gồm:

```css
--vm-primary
--vm-primary-hover

--vm-bg
--vm-surface
--vm-surface-hover

--vm-border
--vm-border-strong

--vm-text
--vm-text-secondary
--vm-text-muted

--vm-danger
--vm-warning
--vm-success

--vm-radius-sm
--vm-radius-md
--vm-radius-lg

--vm-shadow-sm
--vm-shadow-md
```

Dark theme dùng cùng semantic token, không hard-code component-specific dark colors.

### Radius

Desktop app không dùng radius quá lớn.

Guideline ban đầu:

- small controls: 6px;
- cards/panels: 8px;
- modal/larger surface: 10px;
- pill chỉ dùng cho component thực sự có ý nghĩa pill.

### Shadow

Shadow nhẹ và ít.

Dùng border để phân tách layout trước, shadow cho floating layer:

- dropdown;
- popover;
- dialog;
- floating quick editor.

## 7. Typography

### UI typography

Ưu tiên system font để giảm bundle và có cảm giác native:

macOS:

- SF Pro/system-ui.

Windows:

- Segoe UI/system-ui.

Fallback:

```css
font-family:
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Có thể đánh giá Inter sau nếu visual QA cho thấy cần brand consistency hơn.

### Math typography

Do equation engine/math font quản lý.

Không dùng UI font để render mathematical structure.

## 8. Toolbar design

Toolbar ưu tiên semantic group:

- Basic.
- Fraction/Root.
- Script.
- Calculus.
- Matrix/System.
- Relation.
- Greek/Symbol.
- More.

Mỗi structure button:

```text
┌─────────────┐
│ math sample │
│   label     │
└─────────────┘
```

Math sample render thật.

Label được localize.

Có compact/full mode để tránh toolbar quá dày.

## 9. Symbol panel

Symbol panel gồm:

- search;
- category tabs;
- grid;
- recent;
- favorites nếu cần.

Category ban đầu:

- Phổ biến.
- Hy Lạp.
- Toán tử.
- Quan hệ.
- Mũ/tên.
- Tập hợp.
- Hình học.
- Khác.

Tooltip hiển thị:

- localized name;
- optional LaTeX command;
- shortcut nếu có.

## 10. Formula library

Library gồm:

- Recent.
- Favorites.
- Templates.
- Collections.

Card công thức hiển thị equation preview thật.

Không render toàn bộ hàng nghìn công thức live cùng lúc; dùng thumbnail/cache/virtualization khi dữ liệu lớn.

## 11. Quick editor

Quick editor là cửa sổ nhỏ gọi bằng global shortcut.

Mục tiêu:

1. mở nhanh;
2. nhập/paste;
3. xem công thức;
4. Copy/Insert;
5. đóng.

Không mang toàn bộ toolbar lớn vào quick editor.

Có nút mở sang full editor.

## 12. Settings

Navigation dự kiến:

- Chung.
- Ngôn ngữ.
- Phím tắt.
- Định dạng.
- Xuất.
- Tích hợp Office.
- Thư viện.
- Cập nhật.
- Giới thiệu.

Settings dùng cùng design system, không phải giao diện riêng biệt.

## 13. Word/PowerPoint add-in

Add-in dùng shared VietMath components nhưng layout compact hơn.

Không cần làm desktop app thu nhỏ 1:1.

Primary actions theo context:

Word new equation:

> Chèn công thức

Word editing existing VietMath equation:

> Cập nhật

PowerPoint:

> Chèn / Cập nhật

UI vẫn có VietMath identity, không cố clone Fluent UI hoàn toàn.

## 14. Light/Dark/System themes

Theme options:

- Light.
- Dark.
- System.

Math output/export color là setting riêng.

Ví dụ app đang dark không có nghĩa PNG/SVG export tự chuyển công thức thành trắng.

## 15. Responsive desktop behavior

Target là desktop window, nhưng phải chịu được cửa sổ nhỏ.

Khi width giảm:

1. collapse right panel;
2. collapse left panel;
3. toolbar chuyển compact;
4. không làm main editor nhỏ tới mức unusable.

Office add-in responsive strategy riêng vì sidebar hẹp.

## 16. Accessibility

Baseline:

- keyboard navigation;
- visible focus;
- accessible labels;
- tooltip;
- contrast;
- 125–200% zoom;
- target size hợp lý;
- state không chỉ truyền bằng màu.

## 17. Performance rules

- import Lucide icons theo named import/tree-shaking;
- lazy-load panel nặng;
- không rerender toàn workspace mỗi keystroke;
- virtualize library lớn;
- không load MathJax ở startup nếu không cần;
- CSS transition thay animation dependency mặc định;
- tránh UI kit có runtime style overhead lớn nếu không cần.

## 18. Libraries not selected as default

### MUI

Không chọn làm default vì:

- dễ mang Material visual language;
- khó đạt VietMath identity bằng shadcn approach;
- dependency/runtime lớn hơn nhu cầu hiện tại.

### Ant Design

Phù hợp business/admin app hơn VietMath editor.

### Bootstrap

Không phù hợp visual direction.

### Font Awesome

Không dùng làm icon set chính vì Lucide phù hợp visual direction hơn.

### Fluent UI

Có thể tham khảo pattern Office, nhưng không dùng làm default component system cho toàn VietMath.

## 19. UI ownership rule

Feature code nên ưu tiên:

```text
VietMath UI component
        ↓
shadcn/Radix primitive
```

thay vì import primitive/vendor tùy ý ở mọi feature.

Ví dụ:

```text
VmButton
VmTooltip
VmSymbolButton
VmPanel
VmDialog
VmEquationCard
```

Không nhất thiết prefix mọi component trong implementation, nhưng concept ownership phải rõ.

## 20. Approved frontend UI stack summary

```text
React
TypeScript

Styling
├── Tailwind CSS
└── CSS variables / VietMath design tokens

Components
├── shadcn/ui
└── Radix UI

Application icons
└── Lucide React

Math UI
└── MathLive / math renderer

Utility UI
├── Sonner
├── cmdk
└── react-resizable-panels

State
└── Zustand

Forms
├── react-hook-form
└── Zod
```

Core rule:

> App icons use Lucide. Mathematical symbols are rendered by the math engine. VietMath owns its design system rather than inheriting a vendor's visual identity.
