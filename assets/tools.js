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
    tagline: "Chuẩn bị Sysprep, xử lý sau clone, cài Office và bàn giao bản quyền.",
    description:
      "Bộ công cụ triển khai Windows dành cho kỹ thuật viên, giao diện WPF. Chuẩn bị máy gốc trước Sysprep, kiểm tra sau clone, cài phần mềm, kích hoạt Windows / Office bằng giấy phép hợp lệ và xuất biên bản bàn giao. Bản hiện tại phục vụ sử dụng nội bộ.",
    category: "Triển khai Windows",
    platform: "Windows",
    status: "internal",
    version: "2.2.19.0",
    updated: "2026-11-26",
    stack: ["PowerShell 5.1", "WPF", ".NET Framework"],
    features: [
      "Chuẩn bị Sysprep: lưu thiết lập Word, kiểm tra phím chụp và dọn shortcut trùng",
      "Xử lý sau clone: tên máy, định dạng ngày / số, bàn phím và ID UltraViewer",
      "Kiểm tra / kích hoạt Windows và Office, QR Installation ID và nhận Confirmation ID qua LAN",
      "Đối chiếu key / Installation ID trước khi nạp CID; kiểm tra key cài đặt chung Windows theo lựa chọn",
      "Biên bản kiểm tra và hai mẫu xác nhận bàn giao cho khách lẻ / công ty; lưu thông tin đơn vị, chọn hoặc xoá riêng logo",
      "Tải / cài Office bằng ODT, dùng kho cài đặt lưu trên máy",
      "Đặt A4 / máy in mặc định; chọn trình duyệt / PDF qua Cài đặt Windows và kiểm tra lại kết quả",
      "Cài ứng dụng từ WinGet hoặc tệp EXE / MSI do kỹ thuật viên thêm tại máy",
      "Fix Driver dùng chung mọi máy: quét lỗi, link Catalog, cài CAB / INF và kho USB / NAS tối đa 4 vòng; máy in / MFP mở trang driver của hãng; không đóng gói driver",
      "Chẩn đoán ứng dụng bị báo virus (Defender / Kaspersky, Floxif, ngoại lệ rộng) và Sửa lỗi có chọn lọc: cập nhật / quét Defender, gỡ cho phép, cách ly không xoá tệp",
      "Cửa sổ cập nhật, sao lưu và khôi phục phiên bản trước; hướng dẫn nhanh ngay trong app"
    ],
    requirements: [
      "Windows 10 / 11, Windows PowerShell 5.1 và .NET Framework; chạy với quyền Administrator",
      "Tải bản đầy đủ (.zip), giải nén toàn bộ rồi chạy TechMaster Deploy.exe trong thư mục vừa giải nén",
      "Giữ nguyên thư mục App và các tệp đi kèm; file EXE nâng cấp chỉ dành cho bộ app đã có sẵn",
      "Chưa ký số: Windows SmartScreen hoặc Smart App Control có thể chặn; xem hướng dẫn tải và chạy"
    ],
    download: "downloads/TechMaster-Deploy-v2.2.19.0.zip",
    downloadLabel: "Tải bản đầy đủ (.zip)",
    downloadName: "TechMaster-Deploy-v2.2.19.0.zip",
    additionalDownloads: [
      { label: "EXE nâng cấp", url: "downloads/TechMaster-Update.exe", filename: "TechMaster-Update.exe" }
    ],
    githubRepo: "", // tải trực tiếp trên Pages, không phụ thuộc GitHub Releases API
    source: "https://github.com/dangvien-dev/TechMaster-Deploy",
    docs: "downloads/techmaster-deploy.html",
    changelog: [
      {
        version: "2.2.19.0", date: "2026-11-26",
        notes: [
          "Fix Driver: máy in / MFP của Canon, HP, Epson, Brother, Kyocera, Ricoh, Xerox, Lexmark, OKI có nút Mở trang driver của hãng và link tìm theo tên model, thay cho link Catalog theo VID/PID thường không ra kết quả",
          "Nhận diện máy in theo class Printer, ID USBPRINT / WSDPRINT / USB class 07 hoặc tên model; thiết bị khác và hãng ngoài bảng vẫn dùng Catalog",
          "Chỉ mở link HTTPS do app tạo; báo cáo HTML dùng cùng bộ link"
        ]
      },
      {
        version: "2.2.18.0", date: "2026-11-26",
        notes: [
          "Sửa lỗi báo virus không còn chọn sẵn quét toàn bộ ổ D: / USB; ghi dung lượng ổ và cảnh báo HDD lớn có thể quét hàng giờ",
          "Nhận biết mọi lượt quét Defender đang chạy, kể cả quét riêng một ổ, qua nhật ký Defender; hỏi trước khi chạy chồng"
        ]
      },
      {
        version: "2.2.17.0", date: "2026-11-26",
        notes: [
          "Chẩn đoán báo virus mặc định chế độ nhẹ (chỉ chữ ký .exe), tích Quét sâu để kiểm tra cả .dll; luồng chạy ưu tiên thấp",
          "Hỏi trước khi chạy khi Defender đang quét; không chạm ổ mạng hoặc ổ đã rút"
        ]
      },
      {
        version: "2.2.16.0", date: "2026-11-26",
        notes: [
          "Khi Defender đang có lượt quét khác, mục quét chờ tối đa 15 phút rồi tự chạy, thay cho lỗi A scan is already in progress"
        ]
      },
      {
        version: "2.2.15.0", date: "2026-11-26",
        notes: [
          "Mã 5 trong lịch sử phát hiện ghi Đã cho phép lúc phát hiện; cờ ĐANG ĐƯỢC CHO PHÉP chỉ hiện khi mã còn trong danh sách cho phép của Defender"
        ]
      },
      {
        version: "2.2.14.0", date: "2026-11-26",
        notes: [
          "Thêm Sửa lỗi… sau chẩn đoán báo virus: cập nhật định nghĩa, gỡ mã đang Cho phép / ngoại lệ phủ cả ổ, tắt AppInit_DLLs, cách ly tệp còn sót, quét nhanh / theo ổ / toàn bộ / offline",
          "Không xoá tệp: tệp bị cách ly chuyển vào _CachLy_Virus kèm danh sách đường dẫn gốc và SHA256; mỗi mục kiểm tra lại và ghi nhật ký",
          "Kết luận tách ĐANG có dấu hiệu virus lây file với ĐÃ TỪNG nhiễm trong 30 ngày"
        ]
      },
      {
        version: "2.2.13.0", date: "2026-11-26",
        notes: [
          "Chẩn đoán báo virus hiện thanh tiến trình, bước 1/6 → 6/6, số tệp đã kiểm tra chữ ký và thời gian chạy; có nút Xem kết quả gần nhất"
        ]
      },
      {
        version: "2.2.12.0", date: "2026-11-26",
        notes: [
          "Nhận dạng Floxif (symsrv.dll / ffff.dll, AppInit_DLLs), trạng thái xử lý theo mã Microsoft, đánh dấu ĐÃ CHẠY / CÒN TRÊN Ổ và tóm tắt theo ổ"
        ]
      },
      {
        version: "2.2.11.0", date: "2026-11-26",
        notes: [
          "Xuất kết quả chẩn đoán ra .txt; chỉ quét chữ ký .exe / .dll; ngoại lệ Defender trùng cả ổ hoặc thư mục hệ thống được đưa lên KIỂM TRA GẤP"
        ]
      },
      {
        version: "2.2.10.0", date: "2026-11-26",
        notes: [
          "Đổi tab Fix Driver thành Chẩn đoán & sửa lỗi; thêm Chẩn đoán báo virus (chỉ đọc) cho Word, Zalo hoặc ứng dụng bị Defender / Kaspersky chặn",
          "Phân biệt virus lây file, công cụ kích hoạt bị nhận là HackTool và phát hiện heuristic có thể báo nhầm"
        ]
      },
      {
        version: "2.2.9.0", date: "2026-11-23",
        notes: [
          "Fix Driver hiện tổng thiết bị đã đọc, Code 0, lỗi và trạng thái chưa rõ; dữ liệu CIM rỗng không còn bị trình bày như quét thành công 0 lỗi",
          "Hiện tất cả thiết bị và Mở Device Manager để đối chiếu; đây chưa phải tính năng tìm driver mới hơn cho thiết bị đang hoạt động",
          "Trạng thái thiếu hiện ?, không tính là hoạt động / đã sửa hoặc cho disable; lỗi khởi tạo có log để kiểm tra"
        ]
      },
      {
        version: "2.2.8.0", date: "2026-11-21",
        notes: [
          "Menu truyền thống đọc build + UBR, vẫn ghi key nhưng từ mốc 26200.9974 cảnh báo Windows có thể bỏ qua do triển khai tính năng dần",
          "Giữ cảnh báo khi key có sẵn và sau restart Explorer; phân biệt cấu hình đã lưu với giao diện menu chưa xác minh",
          "Hướng dẫn Shift + chuột phải hoặc Arrange primary actions inline nếu có; toggle thực hiện thủ công trong Windows"
        ]
      },
      {
        version: "2.2.7.0", date: "2026-11-21",
        notes: [
          "Thêm Sau khi clone → Thiết lập mặc định: đặt A4 và máy in mặc định cho tài khoản đang chạy app, có log và đọc lại kết quả",
          "Chọn trình duyệt / PDF đã đăng ký, xác nhận trong Cài đặt Windows rồi kiểm tra HTTP, HTTPS và .pdf",
          "Báo riêng khi driver chưa nhận A4 hoặc một phần thao tác thất bại; không báo đã đổi ứng dụng chỉ vì mở Cài đặt"
        ]
      },
      {
        version: "2.2.6.0", date: "2026-11-21",
        notes: [
          "Ghi nhớ lịch sử UltraViewer khi mở lại app / khởi động lại máy, đọc lại bản sao lưu cũ trên đúng máy; không tự reset lại",
          "Hiện thời gian và trạng thái reset, xác minh hoặc khôi phục cùng đường dẫn sao lưu",
          "Thêm nút Paint trên Microsoft Store trong Cài Windows để mở trang chính thức và bấm Get / Cài đặt"
        ]
      },
      {
        version: "2.2.5.0", date: "2026-11-21",
        notes: [
          "Thông báo có khung màu: thông tin, đang xử lý, chờ kiểm tra, thành công và lỗi; UltraViewer chỉ báo xanh khi đã xác minh",
          "Thêm đơn vị / công ty và địa chỉ khách hàng, xuất sang biên bản và mẫu xác nhận bàn giao",
          "Dọn Windows.old qua Disk Cleanup có kiểm tra lại; chọn menu Windows 10 / khôi phục Windows 11 theo tài khoản hiện tại"
        ]
      },
      {
        version: "2.2.4.0", date: "2026-11-21",
        notes: [
          "Đồng bộ bảng key Office, ứng dụng, lịch sử cập nhật và Fix Driver: tiêu đề xanh nhạt, dòng thoáng, màu chọn dễ đọc",
          "Bảng Office có cột tiếng Việt, 5 ký tự cuối dùng chữ đều, tên giấy phép xuống dòng và tooltip"
        ]
      },
      {
        version: "2.2.3.0", date: "2026-11-21",
        notes: [
          "Chuyển Key dùng tạm Office sang mục Kích hoạt, cạnh nút kích hoạt Office, tương tự Windows",
          "Cửa sổ key chỉ chọn / xoá key có xác nhận; giữ Gỡ Office ở mục Tải / cài Office"
        ]
      },
      {
        version: "2.2.2.0", date: "2026-11-21",
        notes: [
          "Mở WinRAR lần đầu sau cài hoặc khi đã có sẵn để hoàn tất thiết lập theo tài khoản; giữ ứng dụng đang chạy",
          "Kiểm tra riêng hàng đợi máy in PDF sau cài Foxit Reader; phân biệt Reader đã cài với có máy in ảo",
          "Giữ kết quả chẩn đoán đã được worker xử lý thay vì báo nhầm lỗi cài đặt chung"
        ]
      },
      {
        version: "2.2.1.0", date: "2026-11-21",
        notes: [
          "Bo góc các nút còn dùng giao diện mặc định ở UltraViewer, Bàn phím, Chuẩn bị Sysprep, Chẩn đoán và Gỡ Office",
          "Bo thêm 14 ô nhập, mật khẩu, danh sách, bảng và thanh tiến trình; giữ nhập liệu, chọn, cuộn và ẩn / hiện đúng trạng thái"
        ]
      },
      {
        version: "2.2.0.0", date: "2026-11-20",
        notes: [
          "Fix Driver dùng chung mọi máy / mainboard, không cần profile để quét và cài",
          "Link Catalog theo Hardware ID, cài CAB / INF đã tải, kho USB / NAS xử lý driver cha / con tối đa 4 vòng",
          "Profile JSON chỉ bổ sung gợi ý khi khớp model; có mẫu SingPC, disable / chỉnh nguồn xác nhận riêng và báo cáo HTML"
        ]
      },
      {
        version: "2.1.12.0", date: "2026-11-18",
        notes: [
          "Căn Hướng dẫn nhanh và Liên hệ cùng lề, cỡ chữ với menu",
          "Giữ vùng trợ giúp trong đúng khung ở cửa sổ thấp; thanh cuộn menu cùng nền tối"
        ]
      },
      {
        version: "2.1.11.0", date: "2026-11-18",
        notes: [
          "Kiểm tra / dọn key chung Windows Pro chưa kích hoạt theo lựa chọn, có biên nhận và hoàn tác",
          "Ưu tiên key riêng, xác nhận 5 ký tự cuối và đối chiếu lại key / IID trước khi nạp CID",
          "Office thiếu key hoặc chỉ có Grace / Trial hiện hướng dẫn bằng hộp thoại"
        ]
      },
      {
        version: "2.1.10.0", date: "2026-11-18",
        notes: ["Thêm nút Lưu thông tin và Xoá logo riêng tại Biên bản bản quyền"]
      },
      {
        version: "2.1.9.0", date: "2026-11-18",
        notes: ["Xem trước logo bằng ảnh WPF để cuộn đúng khung, giữ logo gốc khi xuất biên bản"]
      }
    ]
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
  title: "Dang Vien Dev",
  brand: "Dang Vien",
  brandTag: "DEV",
  subtitle: "Các ứng dụng mình viết để bớt việc lặp lại — chia sẻ cho anh em kỹ thuật.",
  author: "Nguyễn Đăng Viên",
  github: "https://github.com/dangvien-dev",
  contact: "" // email / Zalo / Facebook, để "" nếu không muốn hiện
};
