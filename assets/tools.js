/*
 * DANH SÁCH TOOL — chỉ cần sửa file này để thêm / cập nhật tool.
 * Mỗi tool là 1 object. Field nào chưa có thì để "" hoặc [].
 *
 *  id           : slug không dấu, dùng cho URL  (#/tool/<id>)
 *  name         : tên hiển thị
 *  tagline      : 1 câu mô tả ngắn trên card
 *  description  : đoạn mô tả chi tiết (trang chi tiết)
 *  category     : nhóm, dùng cho bộ lọc
 *  platform     : "Windows" | "Android" | "Web" | ...
 *  status       : "stable" | "beta" | "dev" | "internal"
 *  version      : "1.0.0" hoặc "" nếu chưa phát hành
 *  updated      : "YYYY-MM-DD" hoặc ""
 *  stack        : công nghệ
 *  features     : danh sách tính năng
 *  requirements : yêu cầu hệ thống
 *  download     : link tải trực tiếp (để "" → nút "Chưa có bản tải")
 *  githubRepo   : "owner/repo" PUBLIC có Releases → trang tự lấy bản mới nhất qua GitHub API
 *                 (repo private thì API trả 404, để "" và dùng field download)
 *  source       : link source code (nếu public)
 *  docs         : link hướng dẫn
 *  changelog    : [{ version, date, notes: [] }]
 */
window.TOOLS = [
  {
    id: "techvkey",
    name: "TechVKey",
    tagline: "Bộ gõ tiếng Việt cho Windows — nhẹ, có giao diện sáng/tối, tự cập nhật.",
    description:
      "TechVKey là bộ gõ tiếng Việt cho Windows, phát triển tiếp từ mã nguồn mở OpenKey của Mai Vu Tuyen (giấy phép GPL) nên giữ nguyên bộ máy gõ ổn định của OpenKey. Phần mình làm thêm: sửa lỗi kẹt phím Shift/Ctrl khiến chữ bị tự viết hoa, làm lại giao diện (ô nhập bo góc, hộp thoại thông báo đồng bộ, giao diện tối theo Windows) và tự cập nhật qua GitHub Releases. Mã nguồn công khai theo GPL.",
    category: "Tiện ích Windows",
    platform: "Windows",
    status: "stable",
    version: "2.0.10",
    updated: "2026-11-19",
    stack: ["C++", "Win32", "GDI+"],
    features: [
      "Kiểu gõ Telex, VNI, Simple Telex; bảng mã Unicode, TCVN3, VNI Windows, Unicode tổ hợp, CP 1258",
      "Kiểm tra chính tả, tự khôi phục phím với từ sai, viết hoa chữ cái đầu câu",
      "Gõ tắt (macro) và công cụ chuyển mã nhanh",
      "Loại trừ ứng dụng thông minh, tự nhớ bảng mã theo từng ứng dụng",
      "Phím chuyển Việt / Anh tự cấu hình (Ctrl, Alt, Win, Shift + một phím)",
      "Giao diện sáng / tối, có thể theo Windows; biểu tượng khay hợp cả taskbar sáng và tối",
      "Tự cập nhật qua GitHub Releases và tự mở lại sau khi cập nhật"
    ],
    requirements: [
      "Windows 10 / 11 (64-bit)",
      "Không cần cài đặt: giải nén file zip rồi chạy OpenKey64.exe",
      "Chưa ký số: lần đầu Windows SmartScreen có thể cảnh báo — chọn Thông tin thêm → Vẫn chạy. Nếu file bị chặn, bấm chuột phải → Properties → Unblock",
      "Đang dùng 2.0.8 trở xuống và cập nhật bằng nút trong app: chép OpenKeyUpdate.exe trong file zip mới vào thư mục cài một lần để các lần cập nhật sau tự mở lại"
    ],
    download: "https://github.com/dangvien-dev/TechVKey/releases/latest", // dự phòng khi GitHub API bị giới hạn (403): nút vẫn dẫn tới trang tải
    githubRepo: "dangvien-dev/TechVKey",
    source: "https://github.com/dangvien-dev/TechVKey",
    docs: "",
    changelog: [
      {
        version: "2.0.10", date: "2026-11-19",
        notes: [
          "Ô phím tắt (chữ Z) thấp lại, thẳng hàng với các checkbox và không còn sát ô Bảng mã",
          "Lần đầu thử tính năng tự mở lại TechVKey sau khi cập nhật"
        ]
      },
      {
        version: "2.0.9", date: "2026-11-18",
        notes: [
          "Giao diện tối: hết khối trắng sau các ô chọn trong tab, viền ô nhập và góc bo gọn hơn",
          "Updater tự mở lại TechVKey và tự cập nhật chính nó",
          "Biểu tượng khay kiểu hiện đại tự đổi chữ đậm trên taskbar sáng"
        ]
      },
      {
        version: "2.0.8", date: "2026-11-18",
        notes: [
          "Ô nhập bo góc, hộp thoại thông báo đồng bộ giao diện",
          "Thêm giao diện tối (Hệ thống → Giao diện: Theo Windows / Sáng / Tối)",
          "Sửa chữ tiếng Việt bị hỏng dấu trong hộp thoại báo lỗi cập nhật"
        ]
      },
      {
        version: "2.0.7", date: "2026-11-18",
        notes: ["Báo lỗi mở OpenKeyUpdate.exe rõ ràng hơn và bớt bị Windows chặn"]
      },
      {
        version: "2.0.6", date: "2026-11-18",
        notes: [
          "Sửa lỗi kẹt phím Shift/Ctrl khiến chữ bị tự viết hoa",
          "Giao diện mới êm mắt, tinh gọn",
          "Đổi tên thành TechVKey, tự cập nhật từ kho riêng"
        ]
      }
    ]
  },
  {
    id: "techmaster-pro",
    name: "TechMaster Pro",
    tagline: "Toolkit IT portable chạy từ USB — xem phần cứng, backup/restore, cấu hình máy.",
    description:
      "Bộ công cụ portable cho kỹ thuật viên, chạy trực tiếp từ USB, không ghi Registry để giữ đúng tính portable. Gom các thao tác hay lặp lại khi xử lý máy khách vào một giao diện.",
    category: "Kỹ thuật máy tính",
    platform: "Windows",
    status: "dev",
    version: "",
    updated: "",
    stack: ["C#", "WPF", "MVVM", "CommunityToolkit.Mvvm"],
    features: [
      "Dashboard: thông tin phần cứng, đọc license, nhận diện slot RAM qua SMBIOS",
      "Backup / Restore",
      "Settings portable (không dùng Registry)",
      "Tự cập nhật qua GitHub",
      "Module Help"
    ],
    requirements: ["Windows 10 / 11", "Chạy từ USB, không cần cài đặt"],
    download: "",
    githubRepo: "",
    source: "",
    docs: "",
    changelog: []
  },
  {
    id: "techmaster-deploy",
    name: "TechMaster Deploy",
    tagline: "Clone / sysprep, kích hoạt, biên bản bản quyền, cài Office bằng ODT.",
    description:
      "Bộ công cụ triển khai máy độc lập, có GUI. Dùng tạm trước khi các tính năng này được tích hợp vào TechMaster Pro.",
    category: "Triển khai Windows",
    platform: "Windows",
    status: "dev",
    version: "",
    updated: "",
    stack: ["PowerShell", "WinForms"],
    features: [
      "Sửa lỗi sau clone / sysprep",
      "Kích hoạt",
      "Xuất biên bản bản quyền",
      "Cài Office qua Office Deployment Tool (ODT)"
    ],
    requirements: ["Windows 10 / 11", "Quyền Administrator"],
    download: "",
    githubRepo: "",
    source: "",
    docs: "",
    changelog: []
  },
  {
    id: "smartservices",
    name: "SmartServices",
    tagline: "Quản lý kho, thiết bị khách hàng và phiếu sửa chữa cho kỹ thuật viên.",
    description:
      "App Android cho kỹ thuật viên kèm Web Admin, đồng bộ hai chiều qua Supabase. Quản lý kho, thiết bị của khách và công việc sửa chữa.",
    category: "Quản lý dịch vụ",
    platform: "Android",
    status: "dev",
    version: "",
    updated: "",
    stack: ["Kotlin", "MVVM", "Room", "Supabase", "Next.js (Web Admin)"],
    features: [
      "Quản lý kho và thiết bị khách hàng",
      "Phiếu sửa chữa / công việc theo kỹ thuật viên",
      "Đồng bộ hai chiều PC ↔ mobile",
      "Phân quyền xem mật khẩu thiết bị theo phiếu được giao"
    ],
    requirements: ["Android", "Cài trực tiếp bằng APK"],
    download: "",
    githubRepo: "",
    source: "",
    docs: "",
    changelog: []
  },
  {
    id: "vovinam-giai-dau",
    name: "VovinamGiaiDau",
    tagline: "Quản lý giải đấu Vovinam: đăng ký VĐV, bốc thăm, chấm điểm, khóa kết quả.",
    description:
      "Phần mềm desktop quản lý trọn quy trình một giải đấu Vovinam, phát triển tiếp từ hệ thống Excel VBA trước đó.",
    category: "Thể thao",
    platform: "Windows",
    status: "dev",
    version: "",
    updated: "",
    stack: ["C#", "WPF", ".NET Framework 4.8"],
    features: [
      "Đăng ký vận động viên",
      "Bốc thăm ngẫu nhiên",
      "Chấm điểm",
      "Khóa kết quả"
    ],
    requirements: ["Windows 10 / 11", ".NET Framework 4.8"],
    download: "",
    githubRepo: "",
    source: "",
    docs: "",
    changelog: []
  }
];

/* Thông tin chung của site */
window.SITE = {
  title: "Dang Vien Tools",
  subtitle: "Các công cụ mình viết để bớt việc lặp lại — chia sẻ cho anh em kỹ thuật.",
  author: "Nguyễn Đăng Viên",
  github: "https://github.com/dangvien-dev",
  contact: "" // email / Zalo / Facebook, để "" nếu không muốn hiện
};
