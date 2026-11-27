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

// 3. Lệnh cài từ web (irm https://dangvien-dev.github.io/tm.txt | iex): latest.json phải trỏ đúng gói đang công bố.
(function checkWebInstall() {
  const tm = path.join(root, "tm.txt");
  const latestPath = path.join(root, "downloads", "latest.json");
  if (!fs.existsSync(tm) || !fs.existsSync(latestPath)) { errors.push("thiếu tm.txt hoặc downloads/latest.json (lệnh cài từ web)"); return; }
  const script = fs.readFileSync(tm);
  if ([...script].some((b) => b > 127)) errors.push("tm.txt phải là ASCII: PowerShell 5.1 có thể đọc sai dấu tiếng Việt");
  if (!script.toString("ascii").includes("'https://dangvien-dev.github.io'")) errors.push("tm.txt phải tải từ https://dangvien-dev.github.io");
  let latest;
  try { latest = JSON.parse(fs.readFileSync(latestPath, "utf8")); }
  catch (e) { errors.push(`downloads/latest.json: không đọc được — ${e.message}`); return; }
  const tool = (ctx.window.TOOLS || []).find((t) => t && t.id === "techmaster-deploy");
  if (!tool) { errors.push("TOOLS thiếu techmaster-deploy"); return; }
  if (latest.product !== "TechMaster.Deploy") errors.push("downloads/latest.json: product phải là TechMaster.Deploy");
  if (latest.version !== tool.version) errors.push(`downloads/latest.json: version ${latest.version} khác tools.js ${tool.version}`);
  if (latest.zip !== `TechMaster-Deploy-v${latest.version}.zip` || `downloads/${latest.zip}` !== tool.download) errors.push(`downloads/latest.json: zip ${latest.zip} khác gói đang tải ${tool.download}`);
  const zip = path.join(root, "downloads", String(latest.zip || ""));
  if (!fs.existsSync(zip)) { errors.push(`downloads/latest.json: không có ${latest.zip}`); return; }
  const actual = require("crypto").createHash("sha256").update(fs.readFileSync(zip)).digest("hex");
  if (latest.sha256 !== actual) errors.push(`downloads/latest.json: sha256 khác hash thật của ${latest.zip}`);
  const side = zip + ".sha256";
  if (fs.existsSync(side) && fs.readFileSync(side, "utf8").trim().split(/\s+/)[0] !== actual) errors.push(`${latest.zip}.sha256 khác hash thật`);
  console.log(`✓ Lệnh cài từ web: ${latest.zip} (${actual.slice(0, 12)}…)`);
})();

if (errors.length) {
  console.error(`\n✗ ${errors.length} lỗi dữ liệu — dừng deploy:\n`);
  errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log("✓ Dữ liệu hợp lệ");
