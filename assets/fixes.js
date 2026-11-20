/*
 * SỔ TAY SỬA LỖI — các ca lỗi máy tính / máy in / photocopy / scan, cách xử lý và kết quả.
 * Chỉ cần sửa file này để thêm / cập nhật lỗi. Trang tự sinh bộ lọc theo `device`.
 *
 *  id       : slug không dấu, duy nhất  (#/loi/<id>)
 *  title    : tên lỗi ngắn gọn
 *  codes    : mã lỗi hiển thị dạng tag, vd ["0x00000709"]
 *  device   : "Máy tính" | "Máy in" | "Photocopy" | "Máy scan" | "Mạng & chia sẻ"
 *  model    : áp dụng cho dòng máy / phiên bản nào
 *  verified : "field" = đã xử lý thành công thực tế | "improved" = đã cải thiện nhưng chưa xác nhận dứt điểm | "unresolved" = chưa xác nhận kết quả | "doc" = quy trình chuẩn theo tài liệu hãng / kinh nghiệm
 *  updated  : "YYYY-MM-DD"
 *  symptom  : hiện tượng
 *  cause    : nguyên nhân
 *  steps    : [{ t: "tiêu đề bước", d: "mô tả (dùng `code` để đánh dấu lệnh/đường dẫn)", cmd: "lệnh copy được (tùy chọn)" }]
 *  notes    : lưu ý / cảnh báo
 *  refs     : [{ label, url }]
 */
window.FIXES = [
  /* ============================ MẠNG & CHIA SẺ MÁY IN ============================ */
  {
    id: "win-0x00000709-rpc",
    title: "Lỗi 0x00000709 / 0x00000bc4 khi kết nối máy in chia sẻ",
    codes: ["0x00000709", "0x00000bc4"],
    device: "Mạng & chia sẻ",
    model: "Máy client Windows 11 22H2 trở lên (Home và Pro)",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Add máy in chia sẻ từ máy khác báo “Operation could not be completed (error 0x00000709)” hoặc “No printers were found (0x00000bc4)”.",
    cause: "Từ Windows 11 22H2, máy client mặc định kết nối tới print spooler của máy share bằng RPC over TCP. Máy share đời cũ hoặc cấu hình khác không trả lời được nên báo lỗi. Cách sửa gốc là chuyển client sang RPC over named pipes.",
    steps: [
      { t: "Kiểm tra máy có Group Policy không", d: "Trên máy client: Win + R → `gpedit.msc`. Nếu báo không tìm thấy thì là bản Home, bỏ qua bước 2, làm bước 3." },
      { t: "Bản Pro: đổi bằng Group Policy", d: "`Computer Configuration > Administrative Templates > Printers > Configure RPC connection settings` → Enabled → `Protocol to use for outgoing RPC connections` chọn **RPC over named pipes** → OK. Chạy lệnh dưới rồi add lại máy in. Nếu không thấy mục này thì Windows chưa đủ bản cập nhật: dùng bước 3.", cmd: "gpupdate /force\nnet stop spooler && net start spooler" },
      { t: "Bản Home (hoặc không có mục trên): đổi bằng registry", d: "CMD chạy quyền Administrator, sau đó **khởi động lại máy** rồi add lại máy in. Đây chính là giá trị mà Group Policy ở bước 2 ghi vào.", cmd: "reg add \"HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\Printers\\RPC\" /v RpcUseNamedPipeProtocol /t REG_DWORD /d 1 /f" },
      { t: "Nếu 0x709 xuất hiện khi đặt máy in mặc định", d: "Đây là trường hợp khác. Settings → Bluetooth & devices → Printers & scanners → tắt **Let Windows manage my default printer**. Vẫn lỗi thì mở Regedit tới `HKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Windows`, xóa giá trị `Device`, đăng xuất rồi đặt lại." },
      { t: "Cách cuối cùng: thay 3 file hệ thống", d: "Chỉ dùng khi các bước trên đều thất bại: thay `localspl.dll`, `win32spl.dll`, `spoolsv.exe` trong `System32` bằng bản cũ. Đây là **vá tạm**: thực chất là rollback bản vá bảo mật của spooler, Windows Update có thể ghi đè và lỗi quay lại. Phải báo khách trước." }
    ],
    notes: [
      "Cấu hình làm trên máy **client** (máy đi kết nối), không phải máy share.",
      "Thứ tự ưu tiên: cách an toàn trước (bước 2–3), thay file sau cùng."
    ],
    refs: [{ label: "Microsoft Learn — RPC connection updates for print in Windows 11", url: "https://learn.microsoft.com/en-us/troubleshoot/windows-client/printing/windows-11-rpc-connection-updates-for-print" }]
  },
  {
    id: "win-share-0x4f8-0x52f",
    title: "Không vào được máy share: 0x000004f8 / 0x0000052f / “Account restrictions”",
    codes: ["0x000004f8", "0x0000052f", "Account restrictions"],
    device: "Mạng & chia sẻ",
    model: "Client Windows 10/11 Pro, đặc biệt Windows 11 24H2",
    verified: "field",
    updated: "2026-11-20",
    symptom: "Add máy in hoặc mở thư mục chia sẻ báo 0x000004f8 (chặn đăng nhập Guest), sau đó có thể chuyển sang 0x0000052f / “Account restrictions are preventing this user from signing in”.",
    cause: "0x4f8: client chặn đăng nhập Guest không xác thực (Windows 11 24H2 tắt mặc định). 0x52f (ERROR_ACCOUNT_RESTRICTION): đã đăng nhập có xác thực nhưng tài khoản gửi sang có mật khẩu trống hoặc không được phép đăng nhập qua mạng. Hay gặp khi client tự gửi user Windows hiện tại (ví dụ `Admin` không mật khẩu).",
    steps: [
      { t: "Máy share: tạo user riêng có mật khẩu", d: "Tạo user (ví dụ `printer` hoặc `Scan`) có mật khẩu đủ mạnh: chữ hoa, chữ thường, số, ký tự đặc biệt. Thực tế đã gặp: mật khẩu `123` bị từ chối, đổi sang mật khẩu mạnh thì kết nối được." },
      { t: "Máy share: bật Password protected sharing", d: "`Control Panel > Network and Sharing Center > Advanced sharing settings > All networks` → bật **Password protected sharing**. Nếu tắt, Windows ép mọi kết nối thành Guest nên vẫn lỗi 0x4f8. Kiểm tra máy in: tab Sharing đã tích Share, tab Security cho user được quyền Print." },
      { t: "Máy client: xóa session và credential cũ", d: "CMD (Admin). Xóa mọi entry cũ của máy share trong danh sách `cmdkey /list` bằng `cmdkey /delete:<target>`.", cmd: "net use * /delete /y\ncmdkey /list" },
      { t: "Máy client: kết nối bằng user của máy share", d: "Dấu `*` (hỏi mật khẩu) phải đứng **ngay sau đường dẫn share**, trước `/user`. Gõ mật khẩu sẽ không hiện ký tự. Báo “The command completed successfully” là được, add lại máy in. Lỗi 1219 thì restart client rồi chạy lại.", cmd: "net use \\\\TEN-MAY-SHARE\\IPC$ * /user:TEN-MAY-SHARE\\printer" },
      { t: "Lưu credential lâu dài", d: "Để lần sau không phải nhập lại.", cmd: "cmdkey /add:TEN-MAY-SHARE /user:TEN-MAY-SHARE\\printer /pass:MatKhau" },
      { t: "Nếu dễ nhầm tên máy", d: "Chạy `hostname` trên máy share để lấy tên chính xác (dễ nhầm `I` / `1` / `l`), hoặc dùng IP thay tên: `\\\\192.168.x.x\\IPC$`. Đã dùng IP thì khi add máy in cũng phải dùng đúng IP đó." }
    ],
    notes: [
      "Cách tạm (kém an toàn), chỉ dùng khi bắt buộc phải cho Guest: trên client chạy PowerShell (Admin) `Set-SmbClientConfiguration -EnableInsecureGuestLogons $true -Force` và `Set-SmbClientConfiguration -RequireSecuritySignature $false -Force`. Nếu máy có gpedit thì Policy `Lanman Workstation > Enable insecure guest logons` sẽ ghi đè lệnh này.",
      "Nếu sau khi vào được share lại báo 0x00000709 / 0x0000011b / 0x00000bcb thì đó là vấn đề RPC/driver, xem mục 0x00000709."
    ],
    refs: []
  },
  {
    id: "win-0x80070035",
    title: "Lỗi 0x80070035 “The network path was not found”",
    codes: ["0x80070035"],
    device: "Mạng & chia sẻ",
    model: "Windows 10/11 trong mạng LAN (có MikroTik)",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Mở `\\\\ten-may` trong Explorer báo không tìm thấy đường dẫn mạng.",
    cause: "Client không tới được dịch vụ SMB của máy đích. Có 2 nhánh: không phân giải được tên máy, hoặc cổng 445 bị chặn / dịch vụ chia sẻ không chạy.",
    steps: [
      { t: "Thử theo tên", d: "Nếu báo “could not find host” là lỗi phân giải tên.", cmd: "ping ten-may" },
      { t: "Lấy IP thật của máy đích", d: "Trên máy đích chạy `hostname` và `ipconfig`. Không ngồi được máy đích thì xem `arp -a` trên client hoặc danh sách DHCP Lease trên MikroTik." },
      { t: "Thử theo IP và cổng 445", d: "Thay IP thật vào, không gõ nguyên chữ mẫu.", cmd: "ping 192.168.1.x\nTest-NetConnection 192.168.1.x -Port 445" },
      { t: "IP vào được, tên không vào được", d: "Chỉ cần sửa phân giải tên: dùng IP, hoặc thêm dòng vào `C:\\Windows\\System32\\drivers\\etc\\hosts`, hoặc tạo DNS tĩnh trên MikroTik.", cmd: "/ip dns static add name=ten-may address=192.168.1.x" },
      { t: "Cổng 445 bị chặn (TcpTestSucceeded: False)", d: "Trên máy đích: network profile phải là **Private**; Firewall cho phép **File and Printer Sharing**; service `LanmanServer` (Server) đang chạy; card mạng đã tích *File and Printer Sharing for Microsoft Networks*." },
      { t: "Windows 11 24H2", d: "Vào được cổng 445 nhưng bị từ chối đăng nhập thì xem mục 0x000004f8 / 0x0000052f." }
    ],
    notes: ["Ping IP không trả lời chưa chắc là mất kết nối: firewall có thể chặn ICMP, hoặc Wi-Fi đang bật client isolation."],
    refs: []
  },
  {
    id: "win-ghost-printer",
    title: "Máy in “ma”: hiện trong Chrome nhưng không có trong Control Panel",
    codes: ["Ghost printer"],
    device: "Máy in",
    model: "Windows 10/11, thường gặp với máy in bill / phần mềm bán hàng",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Hộp thoại in của Chrome vẫn có máy in (ví dụ “In Bill”) nhưng Devices and Printers không thấy để xóa.",
    cause: "Máy in còn đăng ký trong Print Spooler nhưng không được cài theo cách chuẩn (thường do phần mềm POS tự ghi vào spooler). Chrome gọi thẳng API liệt kê máy in nên vẫn thấy.",
    steps: [
      { t: "Kiểm tra bằng PowerShell", d: "Xem máy in có trong danh sách không, ghi lại Driver và Port trước khi xóa để tránh làm hỏng máy in bill đang dùng.", cmd: "Get-Printer | Format-Table Name,DriverName,PortName" },
      { t: "Xóa bằng PowerShell", d: "Nếu bước 1 thấy máy in.", cmd: "Remove-Printer -Name \"In Bill\"" },
      { t: "Không xóa được: xóa trong registry", d: "Xóa key của máy in tại `HKLM\\SYSTEM\\CurrentControlSet\\Control\\Print\\Printers`, kiểm tra thêm kết nối theo user tại `HKCU\\Printers\\Connections`, sau đó restart spooler.", cmd: "net stop spooler\nnet start spooler" }
    ],
    notes: ["Xác nhận với khách máy in đó có còn dùng cho phần mềm bán hàng không trước khi xóa."],
    refs: []
  },

  /* ================================ MÁY IN ================================ */
  {
    id: "epson-l1110-waste-ink",
    title: "Epson L1110 báo tràn bộ đếm mực thải (waste ink pad)",
    codes: ["Waste ink pad", "Service required"],
    device: "Máy in",
    model: "Epson L1110 (cách làm tương tự cho dòng L khác, đúng file theo model)",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Máy ngừng in, đèn báo nhấp nháy / báo cần bảo dưỡng dù vẫn còn mực.",
    cause: "Bộ đếm mực thải trong firmware chạm giới hạn. Đây là bộ đếm phần mềm, không phải hết mực.",
    steps: [
      { t: "Mở Adjustment Program đúng model", d: "Chạy bằng quyền **Administrator**. Chọn đúng model L1110 và cổng USB." },
      { t: "Kiểm tra bộ đếm", d: "`Particular adjustment mode` → `Waste ink pad counter` → tích các counter → **Check** để xem phần trăm hiện tại." },
      { t: "Reset", d: "Tích các counter → **Initialize** → tắt máy in khi được yêu cầu → bật lại." },
      { t: "Kiểm tra phần cứng", d: "Máy in nhiều thì tháo kiểm tra miếng bông thải. Bông đã ngấm đầy mà chỉ reset bộ đếm sẽ tràn mực ra ngoài, làm hỏng máy: phải vệ sinh / thay bông hoặc lắp ống dẫn mực thải ra ngoài." }
    ],
    notes: ["Lỗi “Rejected because of a fatal error”: thường do dùng file Adjustment của model khác, hoặc chưa chạy quyền Administrator. Tạm tắt antivirus nếu nó chặn chương trình."],
    refs: []
  },
  {
    id: "epson-l1110-air-bubble",
    title: "Epson L1110 in mất màu / không ra mực do bọt khí đầu in",
    codes: ["Mất nét", "Bọt khí"],
    device: "Máy in",
    model: "Epson L1110 và dòng L bình mực ngoài",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Nozzle check bị đứt nét hoặc mất hẳn một màu.",
    cause: "Có bọt khí trong đường mực / đầu in, hoặc mực khô làm nghẹt béc.",
    steps: [
      { t: "Kiểm tra nguyên nhân gốc", d: "Mực trong bình có dưới mức không, ống dẫn mực có bị gập không, máy có bị nghiêng / di chuyển gần đây không." },
      { t: "Head Cleaning + Nozzle Check", d: "Trong Epson Printer Utility chạy Head Cleaning 2–3 lần, nghỉ vài phút giữa các lần, sau đó in Nozzle Check." },
      { t: "Hút bọt khí bằng xi lanh", d: "Dùng xi lanh 10 ml gắn ống silicon nhỏ, rút bọt khí và mực cũ ra tới khi mực chảy đều." },
      { t: "Ngâm đầu in", d: "Nghẹt do mực khô: ngâm đầu in bằng dung dịch rửa chuyên dụng." },
      { t: "Đổ đầy bình và để mực ổn định", d: "Châm đầy cả 4 bình, chờ mực ổn định rồi test lại." }
    ],
    notes: ["Làm hết các bước vẫn không ra mực thì khả năng cao đầu in đã hỏng (cháy chip hoặc nghẹt vĩnh viễn), phải thay đầu in."],
    refs: []
  },

  /* ================================ MÁY SCAN ================================ */
  {
    id: "fujitsu-ds32006-u11002",
    title: "Scan sổ đỏ A3 gấp đôi: lỗi DS32006 rồi U11002 (file rỗng)",
    codes: ["DS32006", "U11002"],
    device: "Máy scan",
    model: "Máy scan Fujitsu / Ricoh dùng PaperStream IP",
    verified: "field",
    updated: "2026-11-20",
    symptom: "Scan sổ đỏ (A3 gấp đôi) báo DS32006 (multifeed). Tắt multifeed xong lại báo U11002, file xuất ra rỗng.",
    cause: "DS32006: cảm biến siêu âm phát hiện 2 lớp giấy, đúng vì sổ gấp đôi, không phải hỏng phần cứng. U11002: chức năng Blank Page Skip đang bật, nền hoa văn mờ / hồng nhạt của sổ đỏ bị nhận nhầm là trang trắng.",
    steps: [
      { t: "Tạo profile riêng “Sổ đỏ A3 gấp”", d: "Không sửa profile hồ sơ thường. Profile thường vẫn giữ kiểm tra multifeed bằng siêu âm." },
      { t: "Tắt multifeed trong profile mới", d: "PaperStream IP → Multifeed Detection chọn **None**, hoặc chỉ giữ **Check Length**." },
      { t: "Tắt Blank Page Skip", d: "Tab Image Processing / Advanced Settings → tắt **Blank Page Skip**. Kiểm tra thêm Color mode và Dropout color: scan đen trắng hoặc dropout màu dễ làm nền sổ đỏ thành trắng." },
      { t: "Cho từng cuốn vào máy", d: "Profile đã tắt multifeed nên không đặt cả xấp, tránh kéo 2 tờ mà không có cảnh báo, gây mất trang." }
    ],
    notes: [],
    refs: []
  },

  /* ================================ PHOTOCOPY ================================ */
  {
    id: "toshiba-fs-menu-sau-thay",
    title: "Toshiba e-STUDIO: vào FS Menu và mã bắt buộc chạy sau khi thay linh kiện",
    codes: ["FS-05-2742", "FS-30-103", "FS-08-2002"],
    device: "Photocopy",
    model: "Toshiba e-STUDIO 5518A / 6518A / 7518A / 8518A",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Tra cứu nhanh các thao tác service hay dùng.",
    cause: "Tổng hợp từ Service Manual. Ký hiệu FS-05-1234-56 = FS Menu – mode 05 – mã 1234 – sub code 56.",
    steps: [
      { t: "Vào FS Menu (mục 5.2)", d: "Giữ **[FUNCTION CLEAR] + [START]** rồi bấm **[ON/OFF]** → xác thực ([OK], nhập mật khẩu service nếu có) → FS Menu → chọn mode (03 / 05 / 08…) → [Next] → bấm **[Classic]** góc trên bên phải để hiện bàn phím nhập mã → nhập mã → [START]." },
      { t: "Sau khi thay drum, gạt drum, transfer belt, developer", d: "Bắt buộc chạy **FS-05-2742** (khởi tạo điều khiển chất lượng ảnh). Gamma **FS-05-7311 / 7312** phải chạy **sau** 2742." },
      { t: "Sau khi thay developer / vật liệu từ", d: "Chạy **FS-05-2400** (hiệu chỉnh auto-toner sensor) rồi mới tới **FS-05-2742**." },
      { t: "Trước khi bảo trì (mục 7.3)", d: "Xem FS-20 hoặc in **FS-30-103** (PM support mode data list) để biết counter từng linh kiện. In thêm 114 (tổng counter) và 107 (80 lỗi gần nhất). Có USB thì dùng **FS-30-300** xuất toàn bộ danh sách ra CSV (cần khách đồng ý)." },
      { t: "Reset lỗi sấy bằng status counter", d: "**FS-08-2002**: manual ghi giá trị status counter cần đưa về 0 cho các nhóm lỗi C445–C449, C471/C472, C474, C480, C4B0." },
      { t: "Thoát (mục 5.1)", d: "[FS Menu] → [NORMAL] hoặc tắt máy bằng [ON/OFF]. **Luôn thoát chế độ tự chẩn đoán trước khi giao máy cho khách.**" }
    ],
    notes: ["Service Manual không có danh sách mã 05/08 đầy đủ. Danh sách đầy đủ nằm trong tài liệu riêng “Self-diagnostic code list” của Toshiba."],
    refs: []
  },
  {
    id: "toshiba-6518a-c447",
    title: "Toshiba 6518A lỗi C447 sub 24 sau khi in vài tờ",
    codes: ["C447", "Sub 24"],
    device: "Photocopy",
    model: "Toshiba e-STUDIO 6518A",
    verified: "field",
    updated: "2026-11-20",
    symptom: "Bật máy bình thường, in khoảng 3 tờ thì báo C447. Vào FS-08-2002 thấy giá trị 24.",
    cause: "Lỗi điều khiển nhiệt cụm sấy trong lúc đang gia nhiệt liên tục. Ca thực tế: thermistor giữa đo 0 Ω, đảo que đo 700 kΩ (hỏng). Thermistor ngoài và thermistor của một cụm sấy khác cũng đo giá trị bất thường.",
    steps: [
      { t: "Reset lỗi", d: "Vào **FS-08-2002** → [START] → đưa giá trị về **0** → [SET] / [OK] → khởi động lại máy. Đây là quy trình thực tế đã dùng trên máy này." },
      { t: "In thử", d: "Reset xong lỗi lại xuất hiện sau vài tờ thì không reset tiếp: lỗi nằm ở phần cứng cụm sấy." },
      { t: "Đo thermistor", d: "Để cụm sấy nguội hẳn. Đo từng thermistor, đảo chiều que đo. Thermistor tốt cho giá trị ổn định ở cả hai chiều và giảm điện trở khi hơ nóng. Nên so với một thermistor cùng loại còn tốt, vì manual không ghi giá trị chuẩn." },
      { t: "Kiểm tra connector", d: "Nhiều thermistor cùng đo bất thường thì kiểm tra connector / dây cụm sấy có bị oxy hóa trước khi kết luận thay hàng loạt." },
      { t: "Thay thế", d: "Thay thermistor hỏng (nên thay cả hai), reset lại FS-08-2002, in test nhiều tờ. Vẫn lỗi thì thay trọn cụm sấy, sau đó mới tính tới IH board." }
    ],
    notes: ["Reset mà không xử lý nguyên nhân gốc thì lỗi sẽ lặp lại."],
    refs: []
  },
  {
    id: "toshiba-6518a-c4e2",
    title: "Toshiba 6518A lỗi C4E2: belt sấy không quay",
    codes: ["C4E2"],
    device: "Photocopy",
    model: "Toshiba e-STUDIO 6518A (dòng 5518A–8518A)",
    verified: "field",
    updated: "2026-11-20",
    symptom: "Báo C4E2 (không phải “CE42”), lỗi liên quan cảm biến phát hiện quay belt sấy (fuser belt rotation detection sensor).",
    cause: "Ca thực tế: tấm lụa bôi trơn (fuser belt lubricating sheet) bên trong belt sấy đã khô hết dầu silicon. Belt ma sát quá lớn với pad nên không quay theo lô ép; vệ sinh sensor không hết lỗi.",
    steps: [
      { t: "Kiểm tra cảm biến bằng FS-03", d: "Vào FS-03 (Input check) → bật nút **[F2]** (xanh = ON) → bấm phím **3** → quan sát bit **[E]**. Chú ý: F2 OFF thì bit E là tín hiệu khác. Cụm sấy phải lắp vào máy mới đọc được tín hiệu." },
      { t: "Xoay tay rotor", d: "Xoay detection plate (rotor) hoặc che / bỏ che khe sensor. Bit đổi trạng thái theo vòng quay: sensor, dây và LGC board ổn, lỗi ở phần cơ. Bit đứng yên: kiểm tra sensor, connector, dây, sau đó mới tới LGC board." },
      { t: "Kiểm tra phần cơ", d: "Rotor bẩn / gãy, bushing mòn, bánh răng, one-way clutch, drive plate. Ca này: lô ép ép sát thì xoay bánh nhông rất cứng, belt sấy không quay." },
      { t: "Thay belt / kit sấy theo manual", d: "Thay belt sấy theo mục **4.9.7** (đổ silicon oil đúng cách) hoặc trọn bộ kit **FR-KIT-FC556-FU** theo mục **4.9**, kèm chỉnh khe hở separation plate / guide theo **6.11**." },
      { t: "Sau khi thay", d: "In **FS-30-103** kiểm tra counter belt, pad, slide sheet để quyết định thay gì tiếp theo." }
    ],
    notes: [
      "Không tra mỡ lên tấm lụa bôi trơn như một số video hướng dẫn: không phải quy trình của hãng, có nguy cơ làm kẹt belt.",
      "Đeo găng nitrile không bột khi thao tác với belt và drum."
    ],
    refs: []
  },
  {
    id: "toshiba-f150",
    title: "Toshiba lỗi F150: mất điện khi đang ở manufacturing mode",
    codes: ["F150"],
    device: "Photocopy",
    model: "Toshiba e-STUDIO 5518A / 6518A / 7518A / 8518A",
    verified: "field",
    updated: "2026-11-20",
    symptom: "Bật máy lên báo F150.",
    cause: "Theo Service Manual (bảng mã lỗi trang 8-29, chi tiết 8-289): máy bị mất điện trong lúc đang ở manufacturing mode, lần khởi động sau sẽ báo mã này. Đây là cờ firmware ghi nhận, không phải hỏng phần cứng.",
    steps: [
      { t: "Tắt / bật lại nguồn", d: "Thực tế ở xưởng: tắt nguồn rồi bật lại là hết lỗi, với máy đang đặt **FS-08-9010 = 1**." },
      { t: "Lỗi lặp lại thường xuyên", d: "Kiểm tra nguồn điện cấp cho máy (ổ cắm, ổn áp, cúp điện) và bộ nguồn của máy." }
    ],
    notes: ["Manual chỉ ghi FS-08-9010 là “line adjustment mode” (ảnh hưởng counter in). Cân nhắc trước khi đổi giá trị mã này."],
    refs: []
  },
  {
    id: "toshiba-c380-c381",
    title: "Toshiba lỗi C380 / C381: auto-toner sensor",
    codes: ["C380", "C381"],
    device: "Photocopy",
    model: "Toshiba e-STUDIO 5518A / 6518A / 7518A / 8518A",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Báo C381 (auto-toner sensor chạm ngưỡng dưới) hoặc C380 (ngưỡng trên).",
    cause: "Ca đã gặp: mực trong developer cạn. Ngoài ra có thể do mixer của developer không quay hoặc sensor / LGC board.",
    steps: [
      { t: "Kiểm tra cấp mực", d: "**FS-03-227**: chạy motor sub-hopper (M19) để cấp mực thủ công. Mực vẫn không xuống thì kiểm tra hộp mực và đường cấp." },
      { t: "Kiểm tra mixer", d: "**FS-03-114**: chạy motor mixer của developer. Không thấy hoạt động thì kiểm tra motor và connector **CN301** trên LGC board." },
      { t: "Sau khi thay developer", d: "Chạy **FS-05-2400** (giá trị B cần đạt 2.34–2.46 V theo manual dòng máy này), sau đó **FS-05-2742**. Nút Up/Down chỉ hiện ở màn ADJUSTMENT MODE, sau giai đoạn WAIT." },
      { t: "B không tăng khi tăng A", d: "Theo manual, B phải tăng theo A. Tăng A nhiều mà B gần như đứng yên là dấu hiệu phần cứng (mixer, sensor, đường tín hiệu), không phải do thiếu mực." }
    ],
    notes: ["D-FC556K là developer dùng khi thay trọn vật liệu từ, khác với việc châm mực bình thường qua hộp mực."],
    refs: []
  },

  /* ================================ MÁY TÍNH ================================ */
  {
    id: "win-bsod-phan-tich-dump",
    title: "Màn hình xanh (BSOD): cách đọc file dump để tìm thủ phạm",
    codes: ["BSOD", "IRQL_NOT_LESS_OR_EQUAL", "SYSTEM_SERVICE_EXCEPTION", "MEMORY_MANAGEMENT"],
    device: "Máy tính",
    model: "Windows 10 / 11",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Máy bị màn hình xanh, thông báo “What failed: ntoskrnl.exe” hoặc không có tên driver.",
    cause: "ntoskrnl.exe chỉ là nơi phát hiện lỗi, thường không phải thủ phạm. Nguyên nhân hay gặp: RAM lỗi / XMP không ổn định, driver (card mạng, GPU, chipset, antivirus, VPN), ép xung, nguồn yếu, file hệ thống hỏng.",
    steps: [
      { t: "Đảm bảo máy có ghi dump", d: "`sysdm.cpl` → Advanced → Startup and Recovery → Settings → chọn **Small memory dump (256 KB)**. Pagefile trên ổ C phải bật. File nằm ở `C:\\Windows\\Minidump\\*.dmp`." },
      { t: "Đọc nhanh: BlueScreenView", d: "Chạy quyền Admin, xem cột Bug Check String, Bug Check Code, Caused By Driver." },
      { t: "Đọc chính xác: WinDbg", d: "Copy file `.dmp` ra Desktop (file trong `C:\\Windows` hay bị chặn quyền) → WinDbg → Open dump file → gõ lệnh dưới. Đọc `BUGCHECK_CODE`, `MODULE_NAME`, `IMAGE_NAME`, `PROCESS_NAME`, `STACK_TEXT`.", cmd: "!analyze -v" },
      { t: "Không cần tool: Event Viewer", d: "`eventvwr.msc` → Windows Logs → System, lọc Event ID **1001** (BugCheck) và **41** (Kernel-Power)." },
      { t: "Nghi RAM", d: "`IMAGE_NAME` là `ntoskrnl.exe` / `memory_corruption` và mỗi lần ra mã lỗi khác nhau: tắt XMP, chạy MemTest86 ít nhất 4 pass, có 2 thanh thì test từng thanh." },
      { t: "Sửa file hệ thống", d: "Chạy được cả trong Command Prompt của Recovery (Advanced options).", cmd: "sfc /scannow\nDISM /Online /Cleanup-Image /RestoreHealth" }
    ],
    notes: ["SYSTEM_SERVICE_EXCEPTION xảy ra ngay sau khi mất mạng: nghi driver card mạng (LAN/Wi-Fi, đặc biệt USB Wi-Fi). Rollback hoặc cập nhật driver, xem Event Viewer quanh thời điểm crash để tìm file `.sys`."],
    refs: []
  },
  {
    id: "win-uefi-bcdboot",
    title: "Tạo lại boot UEFI sau khi clone ổ / mất phân vùng boot",
    codes: ["Boot", "bcdboot", "EFI"],
    device: "Máy tính",
    model: "Windows 10 / 11, ổ GPT / UEFI",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Sau khi chuyển dữ liệu sang SSD mới hoặc mất phân vùng boot, máy không vào được Windows.",
    cause: "Phân vùng EFI thiếu hoặc BCD không trỏ đúng phân vùng Windows.",
    steps: [
      { t: "Kiểm tra trước khi ghi", d: "Boot WinPE. Mở phân vùng Windows, xác nhận còn thư mục `Windows` và `Users`. Phân vùng chỉ dùng vài trăm MB, trống trơn thì **dừng lại**: có thể đã bị format, chạy bcdboot lúc này vô ích và có nguy cơ ghi đè dữ liệu còn cứu được. Quét phân vùng bị mất bằng DiskGenius / TestDisk trước." },
      { t: "Gán ký tự cho phân vùng EFI", d: "Phân vùng EFI là FAT32, thường 100–260 MB.", cmd: "diskpart\nlist disk\nselect disk 0\nlist vol\nselect vol <so_vol_EFI>\nassign letter=S\nexit" },
      { t: "Tạo lại boot files", d: "Thay `C:` bằng ký tự thật của phân vùng Windows trong WinPE (xem bằng `list vol`).", cmd: "bcdboot C:\\Windows /s S: /f UEFI" },
      { t: "Kiểm tra BCD", d: "`device` và `osdevice` phải trỏ đúng phân vùng Windows.", cmd: "bcdedit /store S:\\EFI\\Microsoft\\Boot\\BCD /enum" },
      { t: "BCD đúng mà vẫn INACCESSIBLE_BOOT_DEVICE (0x7B)", d: "Lỗi không nằm ở boot: kiểm tra chế độ controller trong BIOS (AHCI / RAID / Intel RST / VMD) có khớp lúc cài Windows không, chạy `chkdsk C: /f /r` trong WinPE." }
    ],
    notes: ["Khi chuyển sang ổ mới, nên dùng tính năng clone nguyên ổ thay vì copy từng phân vùng: copy lẻ dễ sót phân vùng EFI / Recovery."],
    refs: []
  },
  {
    id: "lenovo-secure-boot-dbx",
    title: "Laptop không boot do Secure Boot chặn Windows Boot Manager",
    codes: ["Secure Boot", "DBX", "BitLocker"],
    device: "Máy tính",
    model: "Lenovo IdeaPad 3 15ITL6 (Windows 11), áp dụng tương tự máy UEFI khác",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Windows 11 vào Automatic Repair liên tục, firmware báo chặn Windows Boot Manager.",
    cause: "Chứng chỉ trong danh sách thu hồi (DBX) của Secure Boot không khớp, firmware chặn bootloader.",
    steps: [
      { t: "Kiểm tra BitLocker trước tiên", d: "Ổ đã mã hóa BitLocker thì phải có **recovery key 48 số** (tài khoản Microsoft của khách, bản in, USB). Đổi cài đặt Secure Boot gần như chắc chắn làm máy đòi key. Không có key thì dữ liệu không cứu được, chỉ còn cách cài lại Windows." },
      { t: "Lập biên bản với khách", d: "Không có key: ghi rõ tình trạng BitLocker vào phiếu nhận máy, khách ký đồng ý mất dữ liệu trước khi làm bước nào ghi đè ổ." },
      { t: "Khôi phục khóa Secure Boot", d: "Vào BIOS (F2 hoặc nút Novo) → Security → Secure Boot → **Restore Factory Keys** → lưu và khởi động lại." }
    ],
    notes: ["Không dùng công cụ vượt màn hình đăng nhập hoặc vượt BitLocker trên máy của khách: là truy cập trái phép, có rủi ro pháp lý."],
    refs: []
  },
  {
    id: "win-desktop-trong-sau-clone",
    title: "Desktop trống trơn sau khi thay SSD / clone Windows",
    codes: ["Desktop trống"],
    device: "Máy tính",
    model: "Windows 10 / 11",
    verified: "field",
    updated: "2026-11-20",
    symptom: "Màn hình desktop không có icon nào, nhưng `dir C:\\Users\\<user>\\Desktop` vẫn thấy đủ file.",
    cause: "Tùy chọn **Show desktop icons** đang bị tắt.",
    steps: [
      { t: "Bật lại icon desktop", d: "Chuột phải ra desktop → **View** → tích **Show desktop icons**. Ca thực tế đã hết lỗi ngay ở bước này." },
      { t: "Nếu đã bật mà vẫn trống", d: "Kiểm tra đường dẫn Desktop (Properties → Location) có trỏ đúng thư mục không, sau đó mới tính tới rebuild icon cache." }
    ],
    notes: ["Kiểm tra bước 1 trước tiên, tránh mất thời gian rebuild icon cache hay sửa quyền thư mục."],
    refs: []
  },
  {
    id: "foxit-treo-webview2",
    title: "Foxit PDF Reader bị treo khi mở",
    codes: ["Foxit", "WebView2"],
    device: "Máy tính",
    model: "Foxit PDF Reader bản mới, Windows 7 / 8.1 / 10 / 11",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Mở Foxit bị treo, không hiện giao diện. Tắt Start Page vẫn không hết.",
    cause: "Foxit bản mới dùng Microsoft Edge WebView2 Runtime cho Start Page, eSign, Share, panel đăng nhập. Máy thiếu WebView2 hoặc WebView2 bị hỏng. Tắt Start Page không đủ vì các panel khác vẫn gọi WebView2.",
    steps: [
      { t: "Kiểm tra WebView2", d: "Xem Apps & features có **Microsoft Edge WebView2 Runtime**, hoặc thư mục `C:\\Program Files (x86)\\Microsoft\\EdgeWebView`." },
      { t: "Cài bản Standalone", d: "Tải **Evergreen Standalone Installer** (x64) từ trang Microsoft. Máy không có mạng thì tải trên máy khác rồi chép qua.", cmd: "MicrosoftEdgeWebView2RuntimeInstallerX64.exe /silent /install" },
      { t: "Windows 7 / 8.1", d: "Chỉ hỗ trợ tới WebView2 bản 109, phải dùng đúng bản đó." },
      { t: "Không cài được gì thêm", d: "Dùng tạm Microsoft Edge để mở PDF, hoặc hạ Foxit về bản cũ không phụ thuộc WebView2." }
    ],
    notes: ["Máy thuộc diện bảo mật: không tự ý cắm USB / cài phần mềm. Xin phép người phụ trách, dùng USB chuyên dụng, kiểm tra chữ ký số và SHA256 của file cài."],
    refs: [{ label: "Microsoft Edge WebView2 Runtime", url: "https://developer.microsoft.com/microsoft-edge/webview2/" }]
  },
  {
    id: "win-copy-duong-dan-dai",
    title: "Copy file báo lỗi do đường dẫn quá 260 ký tự",
    codes: ["Path too long", "MAX_PATH"],
    device: "Máy tính",
    model: "Windows 10 / 11, kể cả bản Windows Mini",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Explorer báo không copy được file vì tên / đường dẫn quá dài.",
    cause: "Giới hạn MAX_PATH 260 ký tự của Windows Explorer.",
    steps: [
      { t: "Cách nhanh: Robocopy", d: "Không cần cấu hình gì, Robocopy không bị giới hạn 260 ký tự.", cmd: "robocopy \"D:\\Nguon\" \"E:\\Dich\" /E /B /R:1 /W:1" },
      { t: "Bật long path cho toàn hệ thống", d: "PowerShell (Admin), sau đó khởi động lại máy.", cmd: "New-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem\" -Name \"LongPathsEnabled\" -Value 1 -PropertyType DWORD -Force" }
    ],
    notes: ["Bật LongPathsEnabled rồi thì Explorer vẫn có thể bị giới hạn 260 ký tự, nên với việc copy file Robocopy là cách chắc chắn hơn.", "Disk Management báo lỗi refresh trong lúc copy chỉ là lỗi hiển thị: bấm OK rồi F5 hoặc mở lại."],
    refs: []
  },
  {
    id: "win-app-khong-maximize",
    title: "Chrome / Office không tự mở toàn màn hình",
    codes: ["Maximize"],
    device: "Máy tính",
    model: "Windows 11 Pro",
    verified: "doc",
    updated: "2026-11-20",
    symptom: "Mở Chrome hoặc Word / Excel ra cửa sổ nhỏ, không maximize như trước.",
    cause: "Trạng thái cửa sổ đã lưu bị sai.",
    steps: [
      { t: "Chrome: lưu lại trạng thái", d: "Maximize cửa sổ rồi đóng hẳn Chrome (tắt cả nền), mở lại." },
      { t: "Chrome: xóa file Preferences", d: "Đóng Chrome, đổi tên file `Preferences` trong `%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default`." },
      { t: "Chrome: thêm tham số cho shortcut", d: "Shortcut → Properties → ô Target thêm `--start-maximized` sau `chrome.exe\"`." },
      { t: "Office: lưu lại trạng thái", d: "Mở file, maximize cửa sổ, đóng bằng nút X (không đóng bằng Task Manager), mở lại." },
      { t: "Office: nhiều app cùng lỗi", d: "Settings → Apps → Microsoft Office → Modify → **Quick Repair**." }
    ],
    notes: [],
    refs: []
  },

  /* ================================ CANON ================================ */
  {
    id: "canon-lbp243dw-heavy-paper",
    title: "Canon LBP243dw: mực in bám giấy kém, cải thiện khi chọn giấy dày",
    codes: ["Mực không bám", "90–105 g/m²"],
    device: "Máy in",
    model: "Canon LBP243dw",
    verified: "improved",
    updated: "2026-11-20",
    symptom: "Hình ảnh toner có in lên giấy nhưng không bám chắc; lau nhẹ bị bay thành hạt / chấm mịn. Từ tờ thứ 2 hiện tượng bong nặng hơn. Đã loại trừ giấy; chuyển thiết lập định lượng 90–105 g/m² thì đỡ rõ, nhưng chưa xác nhận sửa dứt điểm.",
    cause: "Chưa xác định chắc chắn. Việc cải thiện khi chọn 90–105 g/m² gợi ý cần kiểm tra chế độ điều khiển cụm sấy, màng sấy / trục ép hoặc tính tương thích toner; không đủ bằng chứng để kết luận riêng thiết lập giấy là nguyên nhân gốc.",
    steps: [
      { t: "Xác định giấy đang dùng", d: "Kiểm tra định lượng giấy trên bao bì. Không chọn chế độ giấy dày chỉ để thử nếu giấy thực tế là giấy thường mỏng." },
      { t: "Đổi loại giấy", d: "Trong Printing Preferences / Paper Settings, chọn nhóm giấy dày tương ứng khoảng 90–105 g/m² (tên tùy phiên bản driver). Nếu máy có thiết lập loại giấy tại khay, đặt đồng nhất với driver." },
      { t: "In kiểm tra", d: "So sánh chế độ giấy thường với 90–105 g/m² trên cùng loại giấy; có thể cho máy nghỉ khoảng 10 phút rồi in lại để đối chiếu. Ca đã trao đổi đỡ bong rõ ở mức 90–105 g/m², nhưng chưa có xác nhận hết lỗi hoàn toàn." },
      { t: "Nếu vẫn không bám", d: "Không tiếp tục tăng nhiệt bằng cách chọn giấy dày hơn tùy tiện. Kiểm tra đúng loại toner, giấy và chuyển sang chẩn đoán cụm sấy (film / lô ép, thermistor, nguồn gia nhiệt)." }
    ],
    notes: [
      "Trạng thái: đã cải thiện rõ nhưng chưa xác nhận sửa dứt điểm. Không khẳng định mọi lỗi bong / không bám toner đều do thiết lập giấy.",
      "Không dùng chế độ giấy dày cho giấy mỏng nếu không đúng khuyến nghị của hãng."
    ],
    refs: []
  },
  {
    id: "canon-lbp2900-usb-offline",
    title: "Canon LBP2900: máy bật, USB có tiếng nhận nhưng máy in vẫn Offline",
    codes: ["Offline", "USB", "CAPT"],
    device: "Máy in",
    model: "Canon LBP2900 kết nối USB trên Windows 10 / 11",
    verified: "unresolved",
    updated: "2026-11-20",
    symptom: "Máy in vẫn bật, cắm USB có âm thanh Windows nhận thiết bị nhưng hàng đợi máy in vẫn báo Offline; tùy chọn Use Printer Offline không được chọn.",
    cause: "Chưa xác định được nguyên nhân gốc trong ca đã trao đổi. Cần phân biệt lỗi hàng đợi / Print Spooler, cổng USB bị gán sai, thiết bị USB không enumerate đúng hoặc driver Canon CAPT.",
    steps: [
      { t: "Kiểm tra hàng đợi", d: "Mở control printers → mở hàng đợi Canon LBP2900, kiểm tra Pause Printing / Use Printer Offline và xóa lệnh in đang kẹt nếu có." },
      { t: "Khởi động lại Print Spooler", d: "Mở services.msc, Restart dịch vụ Print Spooler rồi thử in lại." },
      { t: "Quan sát Device Manager khi cắm lại USB", d: "Mở Device Manager trước, rút và cắm lại cáp. Xác định Windows hiện Canon LBP2900, USB Printing Support, Unknown USB Device hay không có thay đổi. Kết quả này quyết định nhánh xử lý tiếp theo." },
      { t: "Kiểm tra cổng máy in", d: "Printer Properties → Ports: kiểm tra máy đang trỏ tới USB001 / USB002 phù hợp; không chọn cổng USB ảo hoặc cổng cũ không còn tồn tại." },
      { t: "Cài lại driver khi đã xác nhận USB ổn định", d: "Gỡ đúng bản driver lỗi, cài Canon CAPT đúng kiến trúc Windows và kết nối USB theo hướng dẫn cài đặt. Không cài lại lặp đi lặp lại trước khi xác định thiết bị có được Windows nhận đúng hay không." }
    ],
    notes: [
      "Ca trao đổi trước đây chưa có kết quả cuối cùng xác nhận đã sửa thành công; đây là quy trình chẩn đoán đã đề xuất, không phải ca đã nghiệm thu.",
      "Ưu tiên kiểm tra Device Manager khi cắm lại USB để tách lỗi kết nối vật lý / enumeration khỏi lỗi driver."
    ],
    refs: []
  },

];
