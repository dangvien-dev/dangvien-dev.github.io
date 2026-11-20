// Kiểm tra dữ liệu trước khi deploy. Lỗi ở đây sẽ CHẶN deploy, trang đang chạy giữ nguyên bản cũ.
// Chạy tay: node .github/scripts/check-data.js
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const errors = [];

// 1. Cú pháp mọi file JS trong assets/
for (const f of fs.readdirSync(path.join(root, "assets")).filter((x) => x.endsWith(".js"))) {
  const code = fs.readFileSync(path.join(root, "assets", f), "utf8");
  try { new vm.Script(code, { filename: `assets/${f}` }); }
  catch (e) { errors.push(`assets/${f}: lỗi cú pháp — ${e.message}\n${(e.stack || "").split("\n").slice(0, 3).join("\n")}`); }
}

// 2. Nạp dữ liệu như trình duyệt
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["tools.js", "fixes.js"]) {
  const p = path.join(root, "assets", f);
  if (!fs.existsSync(p)) continue;
  try { vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f }); }
  catch (e) { errors.push(`assets/${f}: không nạp được — ${e.message}`); }
}

function checkList(name, list, required) {
  if (!Array.isArray(list) || list.length === 0) { errors.push(`window.${name} rỗng hoặc không phải mảng`); return; }
  const seen = new Set();
  list.forEach((item, i) => {
    const label = `${name}[${i}]${item && item.id ? ` (${item.id})` : ""}`;
    for (const k of required) if (!item || item[k] === undefined || item[k] === "") errors.push(`${label}: thiếu field "${k}"`);
    if (item && item.id) {
      if (!/^[a-z0-9-]+$/.test(item.id)) errors.push(`${label}: id chỉ được dùng a-z, 0-9, dấu -`);
      if (seen.has(item.id)) errors.push(`${label}: trùng id`);
      seen.add(item.id);
    }
    if (item && item.updated && !/^\d{4}-\d{2}-\d{2}$/.test(item.updated)) errors.push(`${label}: updated phải dạng YYYY-MM-DD`);
  });
  console.log(`✓ ${name}: ${list.length} mục`);
}

checkList("TOOLS", ctx.window.TOOLS, ["id", "name", "category", "platform", "status"]);
if (fs.existsSync(path.join(root, "assets", "fixes.js")))
  checkList("FIXES", ctx.window.FIXES, ["id", "title", "device", "verified"]);

if (errors.length) {
  console.error(`\n✗ ${errors.length} lỗi dữ liệu — dừng deploy:\n`);
  errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log("✓ Dữ liệu hợp lệ");
