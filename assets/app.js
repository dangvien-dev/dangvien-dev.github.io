(function () {
  "use strict";

  const TOOLS = window.TOOLS || [];
  const SITE = window.SITE || {};
  const app = document.getElementById("app");
  const header = document.getElementById("header");
  const sideNav = document.getElementById("side-nav");

  const STATUS = { stable: "Ổn định", beta: "Beta", dev: "Đang phát triển", internal: "Nội bộ" };

  // ---------- localStorage an toàn (có thể bị chặn / trống) ----------
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };
  const session = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (_) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };

  // ---------- Tool mới / cập nhật kể từ lần ghé trước ----------
  // Chữ ký = version + updated. Lần ghé đầu tiên không đánh dấu gì.
  const sig = (t) => `${t.version || ""}|${t.updated || ""}`;
  const CHANGES = (function () {
    const cached = session.get("dvt.changes");
    if (cached) return cached;                       // giữ badge khi F5 trong cùng phiên
    const prev = store.get("dvt.seen");
    const now = {};
    TOOLS.forEach((t) => { now[t.id] = sig(t); });
    const changes = {};
    if (prev && prev.tools) {
      TOOLS.forEach((t) => {
        if (!(t.id in prev.tools)) changes[t.id] = "new";
        else if (prev.tools[t.id] !== now[t.id]) changes[t.id] = "updated";
      });
    }
    store.set("dvt.seen", { tools: now, at: new Date().toISOString() });
    session.set("dvt.changes", changes);
    return changes;
  })();
  const CHANGE_LABEL = { new: "Mới", updated: "Cập nhật" };

  // Màu theo nhóm — docs/HANDOFF.md §3 (TechMaster Pro)
  const GROUP_COLORS = [
    { fg: "#2563EB", bg: "#EFF6FF" }, // xanh dương
    { fg: "#16A34A", bg: "#F0FDF4" }, // xanh lá
    { fg: "#EA580C", bg: "#FFF7ED" }, // cam
    { fg: "#9333EA", bg: "#FDF4FF" }  // tím
  ];

  const ICON = {
    grid:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    folder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    back:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg>',
    down:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>',
    check:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5 9-10"/></svg>',
    bell:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
    tool:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/></svg>'
  };

  const state = { q: "", platform: "Tất cả", category: "Tất cả" };
  const releaseCache = {};

  // ---------- helpers ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s ?? "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  const fmtDate = (d) => { if (!d) return ""; const [y, m, x] = d.split("-"); return x ? `${x}/${m}/${y}` : d; };
  const badge = (s) => `<span class="badge ${esc(s)}">${esc(STATUS[s] || s || "—")}</span>`;
  const initials = (name) => {
    const caps = String(name).match(/[A-ZĐ]/g) || [];
    return (caps.length >= 2 ? caps[0] + caps[1] : String(name).slice(0, 2)).toUpperCase();
  };

  const CATEGORIES = uniq(TOOLS.map((t) => t.category));
  const PLATFORMS = uniq(TOOLS.map((t) => t.platform));
  const groupOf = (cat) => GROUP_COLORS[Math.max(0, CATEGORIES.indexOf(cat)) % GROUP_COLORS.length];
  const gvars = (cat) => { const g = groupOf(cat); return `--g-fg:${g.fg};--g-bg:${g.bg}`; };

  // ---------- chrome ----------
  document.getElementById("brand-name").textContent = SITE.brand || "Dang Vien";
  document.getElementById("brand-tag").textContent = SITE.brandTag || "DEV";
  document.getElementById("brand-sub").textContent = `${TOOLS.length} ứng dụng`;
  document.getElementById("side-author").textContent = SITE.author || "";
  const contact = document.getElementById("side-contact");
  if (SITE.contact) contact.textContent = SITE.contact; else contact.remove();
  const gh = document.getElementById("side-github");
  if (SITE.github) gh.href = SITE.github; else gh.remove();

  function renderSidebar(activeId) {
    const onList = !activeId;
    const item = (val, label, count, icon) => {
      const cur = onList && state.category === val;
      return `<button class="side-item" data-cat="${esc(val)}" aria-current="${cur}">
        ${icon}<span>${esc(label)}</span><span class="count">${count}</span></button>`;
    };
    let html = item("Tất cả", "TẤT CẢ ỨNG DỤNG", TOOLS.length, ICON.grid);
    if (CATEGORIES.length > 1) {
      html += `<div class="side-group">NHÓM</div>`;
      html += CATEGORIES.map((c) => {
        const g = groupOf(c);
        const dot = `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="3" fill="${g.fg}"/></svg>`;
        return item(c, c, TOOLS.filter((t) => t.category === c).length, dot);
      }).join("");
    }
    sideNav.innerHTML = html;
    sideNav.querySelectorAll(".side-item").forEach((b) => b.addEventListener("click", () => {
      state.category = b.dataset.cat;
      if (location.hash && location.hash !== "#/") location.hash = "#/";
      else route();
    }));
  }

  // ---------- list ----------
  function matches(t) {
    if (state.platform !== "Tất cả" && t.platform !== state.platform) return false;
    if (state.category !== "Tất cả" && t.category !== state.category) return false;
    if (!state.q) return true;
    const hay = norm([t.name, t.tagline, t.description, t.category, t.platform,
      ...(t.stack || []), ...(t.features || [])].join(" "));
    return norm(state.q).split(/\s+/).every((w) => hay.includes(w));
  }

  function toolCard(t) {
    const ver = t.version ? `v${esc(t.version)}` : "Chưa phát hành";
    return `
      <a class="card tool" style="${gvars(t.category)}" href="#/tool/${encodeURIComponent(t.id)}">
        <div class="tool-top">
          <div class="tile">${esc(initials(t.name))}</div>
          <div style="flex:1;min-width:0">
            <h3 class="tool-name">${esc(t.name)}${CHANGES[t.id] ? ` <span class="chg ${CHANGES[t.id]}">${CHANGE_LABEL[CHANGES[t.id]]}</span>` : ""}</h3>
            <div class="tool-cat">${esc(t.category)}</div>
          </div>
          ${badge(t.status)}
        </div>
        <p>${esc(t.tagline)}</p>
        <div class="tags">${(t.stack || []).slice(0, 4).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
        <div class="tool-foot"><span>${esc(t.platform)}</span>
          <span>${ver}${t.updated ? " · " + fmtDate(t.updated) : ""}</span></div>
      </a>`;
  }

  function renderGrid() {
    const list = TOOLS.filter(matches);
    document.getElementById("grid").innerHTML = list.length
      ? list.map(toolCard).join("")
      : `<div class="empty" style="grid-column:1/-1">Không có ứng dụng nào khớp bộ lọc.</div>`;
  }

  function changesNotice() {
    const ids = Object.keys(CHANGES);
    if (!ids.length || session.get("dvt.noticeClosed")) return "";
    const items = ids.map((id) => {
      const t = TOOLS.find((x) => x.id === id);
      if (!t) return "";
      const what = CHANGES[id] === "new" ? "mới thêm" : (t.version ? `cập nhật v${esc(t.version)}` : "vừa cập nhật");
      return `<a href="#/tool/${encodeURIComponent(id)}"><b>${esc(t.name)}</b></a> <span class="dim">${what}</span>`;
    }).filter(Boolean);
    return `<div class="card notice" role="status">
      <span class="notice-icon">${ICON.bell}</span>
      <div class="notice-body"><b>Có thay đổi từ lần trước bạn ghé</b><div>${items.join(" · ")}</div></div>
      <button class="hbtn" id="notice-close" aria-label="Đóng">✕</button></div>`;
  }

  function renderList() {
    renderSidebar(null);
    const title = state.category === "Tất cả" ? "TẤT CẢ ỨNG DỤNG" : state.category.toUpperCase();
    header.innerHTML = `
      <div class="h-title"><span class="h-icon">${state.category === "Tất cả" ? ICON.grid : ICON.folder}</span>
        <span class="h-bar"></span><h1>${esc(title)}</h1></div>
      <div class="h-actions">
        ${PLATFORMS.length > 1 ? `<div class="seg" role="group">${["Tất cả", ...PLATFORMS].map((p) =>
          `<button data-p="${esc(p)}" aria-pressed="${state.platform === p}">${esc(p)}</button>`).join("")}</div>` : ""}
        <label class="search">${ICON.search}
          <input id="q" type="search" placeholder="Tìm tên, tính năng, công nghệ…" value="${esc(state.q)}" autocomplete="off"></label>
      </div>`;
    app.innerHTML = `${SITE.subtitle ? `<p class="intro">${esc(SITE.subtitle)}</p>` : ""}${changesNotice()}<div id="grid" class="grid"></div>`;
    const dismiss = app.querySelector("#notice-close");
    if (dismiss) dismiss.addEventListener("click", () => { session.set("dvt.noticeClosed", true); app.querySelector(".notice").remove(); });

    header.querySelector("#q").addEventListener("input", (e) => { state.q = e.target.value.trim(); renderGrid(); });
    header.querySelectorAll(".seg button").forEach((b) => b.addEventListener("click", () => {
      state.platform = b.dataset.p;
      header.querySelectorAll(".seg button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderGrid();
    }));
    renderGrid();
  }

  // ---------- detail ----------
  const bullet = (items) => `<ul class="list">${items.map((x) => `<li>${ICON.check}<span>${esc(x)}</span></li>`).join("")}</ul>`;

  function changelogHtml(entries) {
    if (!entries || !entries.length) return `<p class="note">Chưa có bản phát hành.</p>`;
    return entries.map((e) => `
      <div class="log-item"><span class="log-ver">${esc(e.version)}</span><span class="log-date">${esc(fmtDate(e.date))}</span>
        ${e.notes && e.notes.length ? `<ul>${e.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}</div>`).join("");
  }

  function downloadBtn(t, rel) {
    const url = (rel && rel.url) || t.download;
    if (!url) return `<span class="btn" aria-disabled="true">${ICON.down}Chưa có bản tải</span>`;
    const label = t.downloadLabel ? esc(t.downloadLabel) : (rel && rel.tag ? `Tải ${esc(rel.tag)}` : (t.version ? `Tải v${esc(t.version)}` : "Tải về"));
    const download = !rel && t.downloadName ? ` download="${esc(t.downloadName)}"` : "";
    return `<a class="btn primary" href="${esc(url)}"${download} target="_blank" rel="noopener">${ICON.down}${label}</a>`;
  }

  async function fetchRelease(repo) {
    if (!repo) return null;
    if (releaseCache[repo] !== undefined) return releaseCache[repo];
    try {
      const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`,
        { headers: { Accept: "application/vnd.github+json" } });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      const asset = (j.assets || [])[0];
      releaseCache[repo] = { tag: j.tag_name, date: (j.published_at || "").slice(0, 10),
        url: asset ? asset.browser_download_url : j.html_url };
    } catch (_) { releaseCache[repo] = null; }
    return releaseCache[repo];
  }

  function renderDetail(t, rel) {
    renderSidebar(t.id);
    const version = (rel && rel.tag) || (t.version ? "v" + t.version : "—");
    const updated = fmtDate((rel && rel.date) || t.updated) || "—";
    header.innerHTML = `
      <div class="h-title"><span class="h-icon">${ICON.tool}</span><span class="h-bar"></span><h1>${esc(t.name)}</h1></div>
      <div class="h-actions"><a class="hbtn" href="#/">${ICON.back}Tất cả ứng dụng</a></div>`;

    app.innerHTML = `
      <div style="${gvars(t.category)}">
        <div class="card hero">
          <div class="tile">${esc(initials(t.name))}</div>
          <div class="hero-text"><h2>${esc(t.name)}</h2><p>${esc(t.tagline)}</p></div>
          <div class="actions">
            ${downloadBtn(t, rel)}
            ${(t.additionalDownloads || []).map((d) => `<a class="btn outline" href="${esc(d.url)}"${d.filename ? ` download="${esc(d.filename)}"` : ""} target="_blank" rel="noopener">${esc(d.label)}</a>`).join("")}
            ${t.docs ? `<a class="btn outline" href="${esc(t.docs)}" target="_blank" rel="noopener">Hướng dẫn</a>` : ""}
            ${t.source ? `<a class="btn outline" href="${esc(t.source)}" target="_blank" rel="noopener">Source</a>` : ""}
          </div>
        </div>
        <div class="detail">
          <div>
            ${t.description ? `<div class="card sec"><h3>Giới thiệu</h3><p>${esc(t.description)}</p></div>` : ""}
            ${t.features && t.features.length ? `<div class="card sec"><h3>Tính năng</h3>${bullet(t.features)}</div>` : ""}
            ${t.requirements && t.requirements.length ? `<div class="card sec"><h3>Yêu cầu hệ thống</h3>${bullet(t.requirements)}</div>` : ""}
            <div class="card sec"><h3>Changelog</h3>${changelogHtml(t.changelog)}</div>
          </div>
          <div class="card sec side-card">
            <h3>Thông tin</h3>
            <dl class="kv">
              <dt>Trạng thái</dt><dd>${badge(t.status)}</dd>
              <dt>Phiên bản</dt><dd class="mono">${esc(version)}</dd>
              <dt>Cập nhật</dt><dd class="mono">${esc(updated)}</dd>
              <dt>Nền tảng</dt><dd>${esc(t.platform)}</dd>
              <dt>Nhóm</dt><dd style="color:var(--g-fg)">${esc(t.category)}</dd>
            </dl>
            <div class="tags">${(t.stack || []).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
          </div>
        </div>
      </div>`;
  }

  async function showDetail(id) {
    const t = TOOLS.find((x) => x.id === id);
    if (!t) {
      renderSidebar("x");
      header.innerHTML = `<div class="h-title"><span class="h-bar"></span><h1>Không tìm thấy</h1></div>
        <div class="h-actions"><a class="hbtn" href="#/">${ICON.back}Tất cả ứng dụng</a></div>`;
      app.innerHTML = `<div class="empty">Không tìm thấy ứng dụng “${esc(id)}”.</div>`;
      return;
    }
    document.title = `${t.name} · ${SITE.title || "Dang Vien Dev"}`;
    renderDetail(t, null);
    if (t.githubRepo) {
      const rel = await fetchRelease(t.githubRepo);
      if (rel && location.hash === `#/tool/${encodeURIComponent(id)}`) renderDetail(t, rel);
    }
  }

  function route() {
    const m = location.hash.match(/^#\/tool\/(.+)$/);
    window.scrollTo(0, 0);
    if (m) showDetail(decodeURIComponent(m[1]));
    else { document.title = SITE.title || "Dang Vien Dev"; renderList(); }
  }

  window.addEventListener("hashchange", route);
  route();

  // ---------- Phát hiện bản deploy mới ----------
  // window.BUILD được workflow thay bằng mã commit; mở file cục bộ thì vẫn là placeholder → bỏ qua.
  const BUILD = String(window.BUILD || "");
  let updateShown = false;
  async function checkUpdate() {
    if (!BUILD || BUILD.indexOf("BUILD") !== -1 || updateShown) return;
    try {
      const r = await fetch(`version.json?t=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      if (j.build && j.build !== BUILD) showUpdateToast();
    } catch (_) {}
  }
  function showUpdateToast() {
    updateShown = true;
    const box = document.getElementById("toasts");
    if (!box) return;
    box.innerHTML = `<div class="card toast" role="alert">
      <span class="notice-icon">${ICON.bell}</span>
      <div class="notice-body"><b>Trang vừa có bản mới</b><div class="dim">Tải lại để xem nội dung mới nhất.</div></div>
      <button class="btn primary" id="toast-reload">Tải lại</button>
      <button class="hbtn" id="toast-close" aria-label="Để sau">✕</button></div>`;
    box.querySelector("#toast-reload").addEventListener("click", () => location.reload());
    box.querySelector("#toast-close").addEventListener("click", () => { box.innerHTML = ""; });
  }
  checkUpdate();
  setInterval(checkUpdate, 5 * 60 * 1000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkUpdate(); });
})();
