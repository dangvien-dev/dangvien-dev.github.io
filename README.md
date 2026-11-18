# Dang Vien Tools

Trang giới thiệu các tool do mình viết. Site tĩnh thuần HTML/CSS/JS — không build, không framework.

## Cấu trúc

```
index.html          # khung trang
assets/tools.js     # DỮ LIỆU — chỉ sửa file này khi thêm/cập nhật tool
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

## Deploy lên GitHub Pages

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/dangvien-dev/dangvien-dev.github.io.git
git push -u origin main
```

Trên GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)`**.

- Repo tên `dangvien-dev.github.io` → site ở `https://dangvien-dev.github.io/`
- Repo tên khác (vd `tools`) → `https://dangvien-dev.github.io/tools/`
- Domain riêng: thêm file `CNAME` chứa domain, trỏ DNS `CNAME` về `dangvien-dev.github.io`.

> Lưu ý: GitHub Pages cho organization **Free** chỉ publish từ repo **public**. Source tool có thể để repo private riêng, chỉ repo site là public.
