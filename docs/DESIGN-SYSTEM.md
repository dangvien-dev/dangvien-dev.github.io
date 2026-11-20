# Design System — Dang Vien

Đây là phong cách giao diện chung cho các phần mềm và trang web của Nguyễn Đăng Viên. Khi làm UI mới (WPF, WinForms, web, Android) chỉ cần đọc file này, không phải mở lại từng repo.

**Nguồn gốc:** trích từ `dangvien-dev/TechMasterPro`, commit `fd06609`:
`TechMasterPro/Styles/{Colors,Typography,CardStyles,ButtonStyles,MenuStyles,HeaderStyles}.xaml`, `TechMasterPro/Views/MainWindow.xaml`, `docs/HANDOFF.md` §3.
Bản web hiện thực theo file này: `assets/style.css` của repo `dangvien-dev.github.io`.

> Nếu theme trong TechMaster Pro thay đổi thì cập nhật file này trước, rồi mới sửa các app khác theo.

---

## 1. Bố cục tổng thể

```
┌────────────┬──────────────────────────────────────────┐
│  SIDEBAR   │  HEADER (trắng)  [icon] ▌ Tiêu đề    [nút]│
│  #0F172A   ├──────────────────────────────────────────┤
│  rộng 250  │                                          │
│            │  CONTENT  #F8FAFC                        │
│  Brand     │   ┌──────┐ ┌──────┐ ┌──────┐             │
│  Menu…     │   │ Card │ │ Card │ │ Card │  (trắng,    │
│            │   └──────┘ └──────┘ └──────┘   bo 14)    │
│  ───────   │                                          │
│  Tác giả   │                                          │
│  Liên hệ   │                                          │
└────────────┴──────────────────────────────────────────┘
```

- Sidebar tối cố định bên trái, nội dung sáng bên phải. Chỉ có light theme ở vùng nội dung.
- Bố cục sidebar ở trên dành cho **phần mềm** (WPF/WinForms, web app nội bộ).

### Biến thể website (trang giới thiệu công khai, vd `dangvien-dev.github.io`)

```
┌───────────────────────────────────────────────────────┐
│ MENU NGANG #0F172A   Brand DEV        Mục · Mục · GitHub│
├───────────────────────────────────────────────────────┤
│ KHỐI MỞ ĐẦU  gradient #0F172A → #1E3A8A               │
│  nhãn nhỏ · tiêu đề 44 Bold · mô tả · 2 nút · số liệu  │
├───────────────────────────────────────────────────────┤
│ SECTION #F8FAFC  ▌Tiêu đề 26 · chip lọc · lưới card    │
├───────────────────────────────────────────────────────┤
│ SECTION xen kẽ #F1F5F9                                 │
├───────────────────────────────────────────────────────┤
│ CHÂN TRANG #0F172A  brand · liên kết · tác giả         │
└───────────────────────────────────────────────────────┘
```

- Menu ngang thay cho sidebar. Mục đang xem: nền `#1E293B`, gạch chân 2px `#60A5FA` (tương đương viền trái của menu active trong app).
- Nội dung căn giữa, rộng tối đa 1180px.
- Tiêu đề section có thanh dọc 4×24 `#2563EB` (lấy từ thanh accent của header trong app).
- Bộ lọc dạng chip tròn có chấm màu nhóm. Chip đang chọn dùng nền nhạt + chữ đậm của nhóm.
- Trang chi tiết có breadcrumb (`Ứng dụng / Nhóm / Tên`) thay cho nút quay lại trong header.
- Mobile (dưới 760px): menu thu gọn, chip cuộn ngang, lưới 1 cột, chân trang 1 cột.

## 2. Bảng màu

### Màu nền tảng (`Colors.xaml`)

| Token | Hex | Dùng cho |
|---|---|---|
| `BgMain` | `#F1F5F9` | Nền phụ: tag, ô segmented, vùng trống |
| `CardBg` | `#FFFFFF` | Card, header |
| `BorderColor` | `#E2E8F0` | Viền, đường phân cách |
| `ColorPrimary` | `#1E3A8A` | Màu thương hiệu đậm (ít dùng) |
| `TextPrimary` | `#1E293B` | Chữ chính |
| `TextSecondary` | `#64748B` | Chữ phụ, mô tả, version |
| `ColorSuccess` | `#22C55E` | Thành công, check |
| `ColorWarning` | `#FACC15` | Cảnh báo, số điện thoại ở sidebar |
| `ColorDanger` | `#EF4444` | Lỗi, badge cập nhật |

### Màu khung (`MainWindow.xaml`, `MenuStyles.xaml`)

| Vai trò | Hex |
|---|---|
| Nền sidebar | `#0F172A` |
| Chữ menu sidebar | `#CBD5F5` |
| Hover menu | `#1E293B` |
| Chữ mờ sidebar (tác giả) | `#94A3B8` |
| Accent (menu active, nút chính, icon header) | `#2563EB` |
| Accent sáng (chữ "PRO", viền trái menu active) | `#60A5FA` |
| Nền vùng nội dung | `#F8FAFC` |

### Màu theo nhóm (`HANDOFF.md` §3)

Mỗi nhóm chức năng có một cặp màu: chữ/icon (đậm) và nền (nhạt).

| Nhóm | Đậm | Nhạt |
|---|---|---|
| Máy in / nhóm 1 | `#2563EB` | `#EFF6FF` |
| Chia sẻ / nhóm 2 | `#16A34A` | `#F0FDF4` |
| Mạng / nhóm 3 | `#EA580C` | `#FFF7ED` |
| Hệ thống / nhóm 4 | `#9333EA` | `#FDF4FF` |

Chỉ có 4 cặp. Nếu có nhóm thứ 5 trở đi, các màu quay vòng (web đang làm vậy). Muốn thêm cặp màu thì bổ sung vào bảng này trước.

### Màu trạng thái (bổ sung cho web)

| Trạng thái | Chữ | Nền |
|---|---|---|
| Ổn định | `#16A34A` | `#F0FDF4` |
| Beta | `#2563EB` | `#EFF6FF` |
| Đang phát triển | `#A16207` | `#FEFCE8` |
| Nội bộ | `#64748B` | `#F1F5F9` |

## 3. Typography

- Font: **Segoe UI** (mặc định của WPF). Web dùng fallback `system-ui, Roboto, Arial`.
- Icon trên Windows dùng **Segoe MDL2 Assets** (font icon). Trên web dùng SVG nét 2px, vì font này không có trên Android, iOS hay macOS.
- Font mono (version, ngày tháng, tag công nghệ): `Consolas`.

| Style | Size | Weight | Màu |
|---|---|---|---|
| Brand (sidebar) | 18 | Bold | trắng |
| Brand tag ("PRO") | 12 | SemiBold | `#60A5FA` |
| Version (sidebar) | 11 | Regular | `TextSecondary` |
| Header title | 20 | Bold | `TextPrimary` |
| `TitleText` | 24 | Bold | `TextPrimary` |
| `ValueText` (số liệu lớn) | 26 | Bold | — |
| Menu item | 14 (mục phụ: 12) | Regular, active SemiBold | `#CBD5F5` |
| Body | 14 | Regular | `TextPrimary` |
| `SubText` | 12 | Regular | `TextSecondary` |
| Header action | 13 | Regular | `TextPrimary` |

Menu chính viết **IN HOA** (ví dụ `DASHBOARD`, `SAO LƯU & PHỤC HỒI`); mục phụ viết thường (ví dụ `Kiểm tra cập nhật`).

## 4. Component

### Sidebar (`SidebarButtonStyle`, kiểu RadioButton)
- Cao 44 (mục phụ 36), margin `8,6`, padding ngang 12, bo góc **10**.
- Icon 16px nằm trái, cách chữ 10px.
- Hover: nền `#1E293B`. Khi nhấn: opacity 0.7.
- Active: nền `#2563EB`, **viền trái 4px `#60A5FA`**, chữ trắng SemiBold.
- Badge cập nhật: chấm tròn 8px `#EF4444`, góc trên phải.
- Khối brand: margin `8,10,8,20`, gồm tên + tag + version.
- Chân sidebar: separator `#1E293B`, tên tác giả `#94A3B8` 12px, số điện thoại `#FACC15` 12px.

### Header (`HeaderViewTemplate`)
- Nền trắng, padding `25,15`.
- Bên trái: icon `#2563EB` 16px, rồi **thanh dọc 4×22 `#2563EB` bo 2**, rồi tiêu đề 20 Bold. Mỗi phần cách nhau 10px.
- Bên phải: các `HeaderActionButtonStyle`.

### Card (`CardStyle`)
- Nền trắng, bo góc **14**, padding 14, margin 6.
- Đổ bóng: `DropShadowEffect BlurRadius=15 Opacity=0.08 ShadowDepth=2`. Trên web tương đương `box-shadow: 0 2px 15px rgba(0,0,0,.08)`.
- Card không có viền. Web thêm viền màu nhóm khi hover.

### Nút
- **`PrimaryButtonStyle`**: nền `#2563EB`, chữ trắng SemiBold, padding `15,6`, bo **10**, không viền, con trỏ Hand. Trên web, hover đổi sang `#1D4ED8`.
- **`HeaderActionButtonStyle`**: nền trong suốt, padding `8,4`, size 13, bo **4**. Hover `#F3F4F6`, nhấn `#E5E7EB`, khi disabled opacity 0.5.
- Nút phụ (chỉ có trên web): nền trắng, viền `#E2E8F0`, bo 10.

### Tiêu đề section trong card (web)
- Thanh dọc 4×16 bo 2, màu theo nhóm, tiếp theo là tiêu đề 14 Bold.

### Icon tile (web)
- Ô vuông 44px bo 12 (ở trang chi tiết 56px bo 14). Nền và chữ lấy theo cặp màu nhóm, bên trong là 2 chữ cái viết tắt.

## 5. Quy ước bo góc và khoảng cách

| Thành phần | Bo góc |
|---|---|
| Card | 14 |
| Nút chính, menu item, ô input | 10 |
| Icon tile | 12 |
| Header action button | 4 |
| Thanh accent | 2 |

Khoảng cách dùng bội số của **6 hoặc 10**: margin card 6, margin menu 6, khoảng cách icon–chữ 10, padding header 25/15.

## 6. Ngôn ngữ trên giao diện

- Dùng tiếng Việt cho UI. Tên kỹ thuật giữ nguyên English (`Backup`, `Settings`, `Dashboard`).
- Hộp thoại trong WPF: luôn dùng `ConfirmDialog.Show(...)`, không dùng `MessageBox`.

## 7. CSS variables (web, copy dùng ngay)

```css
:root {
  --bg-main:#F1F5F9; --card-bg:#FFFFFF; --border:#E2E8F0; --primary:#1E3A8A;
  --text:#1E293B; --text-2:#64748B;
  --success:#22C55E; --warning:#FACC15; --danger:#EF4444;
  --sidebar:#0F172A; --side-text:#CBD5F5; --side-hover:#1E293B; --side-muted:#94A3B8;
  --accent:#2563EB; --accent-light:#60A5FA; --content-bg:#F8FAFC;
  --btn-hover:#F3F4F6; --btn-press:#E5E7EB;
  --font:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;
  --mono:Consolas,"Cascadia Mono",ui-monospace,monospace;
}
```
