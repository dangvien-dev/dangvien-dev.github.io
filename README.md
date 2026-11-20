# Dang Vien Dev

Trang giới thiệu các ứng dụng / tool do mình viết. Site tĩnh thuần HTML/CSS/JS — không build, không framework.

Giao diện theo phong cách TechMaster Pro — xem [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md).

## Cấu trúc

```
index.html          # khung trang
downloads/          # gói app / EXE nâng cấp / SHA256 / hướng dẫn tải
assets/tools.js     # DỮ LIỆU — chỉ sửa file này khi thêm/cập nhật tool
assets/fixes.js     # DỮ LIỆU kho lỗi (#/loi) — lỗi máy tính / máy in / photocopy / scan đã có cách xử lý
assets/app.js       # render danh sách, tìm kiếm, bộ lọc, trang chi tiết (#/tool/<id>)
assets/style.css    # giao diện
.nojekyll           # tắt Jekyll trên GitHub Pages
```

Mở `index.html` trực tiếp bằng trình duyệt là chạy được (không cần server).

## Thêm tool mới

Copy một object trong `window.TOOLS` ở `assets/tools.js`, đổi `id` (slug không dấu, duy nhất) và các field. Bộ lọc nền tảng / nhóm tự sinh từ dữ liệu.

Link tải — chọn 1 trong 2:

- `download`: link trực tiếp (Drive, Nextcloud, Releases…).
- `githubRepo: "dangvien-dev/<repo>"`: trang tự lấy release mới nhất qua GitHub API, nút tải trỏ tới asset đầu tiên. **Chỉ chạy với repo public**; repo private API trả 404 → trang dùng lại field `download`.

GitHub API không đăng nhập giới hạn 60 request/giờ/IP — đủ cho site giới thiệu.

## Kho lỗi (`#/loi`)

Trang tra cứu lỗi: `https://dangvien-dev.github.io/#/loi`, chi tiết `#/loi/<id>`.

Thêm lỗi: copy một object trong `window.FIXES` ở `assets/fixes.js`, đổi `id`. Bộ lọc theo thiết bị tự sinh từ field `device`.

- `verified: "field"` = đã xử lý thành công trên máy thật; `"doc"` = quy trình chuẩn theo tài liệu hãng.
- Trong `symptom`, `cause`, `steps[].d`, `notes` dùng `` `code` `` và `**đậm**`; `steps[].cmd` hiện thành khối lệnh có nút Copy.
- Không ghi thông tin khách hàng (tên máy, IP, mật khẩu thật) — site công khai.

## Deploy lên GitHub Pages

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/dangvien-dev/dangvien-dev.github.io.git
git push -u origin main
```

Trên GitHub: **Settings → Pages → Build and deployment → Source: `GitHub Actions`** (chỉ làm 1 lần).

Mỗi lần push lên `main`, workflow `.github/workflows/pages.yml` sẽ:

- thay placeholder `__BUILD__` trong mọi file `.html` bằng 7 ký tự đầu của commit SHA, nên link `style.css?v=…` / `app.js?v=…` đổi theo từng lần deploy và trình duyệt luôn tải bản mới;
- tạo `version.json` (`{"build": "<sha>"}`). Trang đang mở kiểm tra file này khi tải, mỗi 5 phút và khi người xem quay lại tab. Nếu khác bản đang chạy thì hiện thông báo **"Trang vừa có bản mới → Tải lại"**.

Không cần tự sửa `?v=` bằng tay nữa. Khi thêm link CSS/JS mới vào HTML, chỉ cần ghi `?v=__BUILD__`.

## Thông báo cho người xem

- **Bản deploy mới:** hiện toast góc dưới phải (xem trên).
- **Ứng dụng mới / vừa cập nhật:** trình duyệt nhớ `version` + `updated` của từng ứng dụng ở lần ghé trước (`localStorage`). Lần ghé sau, ứng dụng nào mới có nhãn **MỚI**, ứng dụng đổi version/ngày có nhãn **CẬP NHẬT**, kèm khung tóm tắt trên đầu danh sách. Lần ghé đầu tiên không hiện gì.
- Muốn người xem thấy nhãn **CẬP NHẬT**, chỉ cần đổi `version` hoặc `updated` trong `assets/tools.js`.

- Repo tên `dangvien-dev.github.io` → site ở `https://dangvien-dev.github.io/`
- Repo tên khác (vd `tools`) → `https://dangvien-dev.github.io/tools/`
- Domain riêng: thêm file `CNAME` chứa domain, trỏ DNS `CNAME` về `dangvien-dev.github.io`.

> Lưu ý: GitHub Pages cho organization **Free** chỉ publish từ repo **public**. Source tool có thể để repo private riêng, chỉ repo site là public.

## TechMaster Deploy trên Pages

Trang chi tiết: `https://dangvien-dev.github.io/#/tool/techmaster-deploy`.

- `downloads/TechMaster-Deploy-v2.1.12.0.zip`: bản đầy đủ, có launcher EXE và toàn bộ thư mục cần thiết.
- `downloads/TechMaster-Update.exe`: công cụ nâng cấp độc lập cho người đang có bộ app cũ.
- Mỗi tệp có `.sha256` đi kèm. Gói đầy đủ được đối chiếu manifest và không chứa cấu hình đơn vị, logo công ty hoặc biên bản khách hàng.
- `downloads/techmaster-deploy.html`: hướng dẫn giải nén / chạy, cập nhật và phân biệt SmartScreen với Smart App Control.

Mục này tải trực tiếp từ Pages (`githubRepo` để trống), không gọi GitHub Releases API.
Giữ nhãn **Nội bộ** theo giai đoạn sử dụng của app; file trên GitHub Pages công khai không có kiểm soát đăng nhập.

Các field tùy chọn mới trong `assets/tools.js`:

- `downloadLabel`: tên nút tải chính.
- `downloadName`: tên tệp cho thuộc tính `download` khi dùng link tĩnh.
- `additionalDownloads`: các link phụ `{ label, url, filename }`; tool không khai báo vẫn hoạt động như trước.

Khi có bản TechMaster Deploy mới: lấy ZIP đã xác minh từ repo app, thêm vào `downloads/`, tạo SHA256,
đổi phiên bản / link / changelog trong catalog và cập nhật hướng dẫn tải. Chỉ thay EXE nâng cấp nếu nguồn nhúng của nó thay đổi.
