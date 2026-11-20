(function () {
  "use strict";

  const TOOLS = window.TOOLS || [];
  const FIXES = window.FIXES || [];
  const SITE = window.SITE || {};
  const app = document.getElementById("app");

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
    bug:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7V5a4 4 0 0 1 8 0v2"/><rect x="6" y="7" width="12" height="13" rx="6"/><path d="M12 11v9M3 13h3M18 13h3M4 7l2.5 2M20 7l-2.5 2M4 20l2.5-2M20 20l-2.5-2"/></svg>',
    copy:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
    tool:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/></svg>'
  };

  const state = { q: "", platform: "Tất cả", category: "Tất cả", fixQ: "", fixDevice: "Tất cả", fixVerified: "Tất cả" };
  const VERIFIED = { field: "Đã xử lý thực tế", improved: "Đã cải thiện, chưa xác nhận dứt điểm", unresolved: "Chưa xác nhận kết quả", doc: "Quy trình chuẩn" };
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

  const DEVICES = uniq(FIXES.map((f) => f.device));
  const devOf = (d) => GROUP_COLORS[Math.max(0, DEVICES.indexOf(d)) % GROUP_COLORS.length];
  const dvars = (d) => { const g = devOf(d); return `--g-fg:${g.fg};--g-bg:${g.bg}`; };
  // `code` và **đậm** trong nội dung sổ tay sửa lỗi (escape trước rồi mới format)
  const fmt = (s) => esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // ---------- chrome ----------
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setText("brand-name", SITE.brand || "Dang Vien");
  setText("brand-tag", SITE.brandTag || "DEV");
  setText("foot-brand", SITE.brand || "Dang Vien");
  setText("foot-tag", SITE.brandTag || "DEV");
  setText("foot-sub", SITE.subtitle || "");
  setText("foot-author", SITE.author ? `© ${new Date().getFullYear()} ${SITE.author}` : "");
  const contact = document.getElementById("foot-contact");
  if (SITE.contact) contact.textContent = SITE.contact; else contact.remove();
  ["nav-github", "foot-github"].forEach((id) => {
    const a = document.getElementById(id);
    if (SITE.github) a.href = SITE.github; else a.remove();
  });
  if (!FIXES.length) document.querySelectorAll('a[href="#/loi"]').forEach((a) => a.remove());

  // Đánh dấu mục menu đang xem
  function setNav(section) {
    document.querySelectorAll("#nav a[data-nav]").forEach((a) =>
      a.setAttribute("aria-current", a.dataset.nav === section ? "page" : "false"));
  }

  // Chip lọc (nhóm / thiết bị) — màu theo nhóm
  const chips = (key, values, current, colorOf) =>
    `<div class="chips" role="group">` +
    ["Tất cả", ...values].map((v) => {
      const g = v === "Tất cả" ? null : colorOf(v);
      return `<button class="chip" data-${key}="${esc(v)}" aria-pressed="${current === v}"${g ? ` style="--g-fg:${g.fg};--g-bg:${g.bg}"` : ""}>` +
        `${g ? '<span class="chip-dot"></span>' : ""}${esc(v)}</button>`;
    }).join("") + `</div>`;

  const crumb = (items) => `<nav class="crumb">${items.map(([href, label]) =>
    href ? `<a href="${href}">${esc(label)}</a>` : `<span>${esc(label)}</span>`).join('<span class="sep">/</span>')}</nav>`;

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

  function fixesTeaser() {
    if (!FIXES.length) return "";
    const latest = FIXES.slice().sort((a, b) => String(b.updated || "").localeCompare(String(a.updated || ""))).slice(0, 3);
    return `
      <section class="section alt">
        <div class="wrap">
          <div class="section-head">
            <div><h2>Sổ tay sửa lỗi</h2><p>Các ca lỗi máy tính, máy in, photocopy, máy scan mình đã gặp và cách xử lý — tra theo mã lỗi hoặc tên máy.</p></div>
            <a class="btn outline" href="#/loi">Xem ${FIXES.length} lỗi →</a>
          </div>
          <div class="grid">${latest.map(fixCard).join("")}</div>
        </div>
      </section>`;
  }

  function renderList() {
    setNav("apps");
    const platforms = [...new Set(TOOLS.map((t) => t.platform))].filter(Boolean);
    app.innerHTML = `
      <section class="hero-band">
        <div class="wrap hero-in hero-grid">
          <div>
          <span class="eyebrow">Phần mềm do mình tự viết</span>
          <h1>${esc(SITE.title || "Dang Vien Dev")}</h1>
          <p>${esc(SITE.subtitle || "")}</p>
          <div class="hero-cta">
            <a class="btn primary lg" href="#apps" id="go-apps">Xem ứng dụng</a>
            ${FIXES.length ? `<a class="btn ghost lg" href="#/loi">Tra cứu lỗi</a>` : ""}
          </div>
          </div>
          <div class="stats">
            <div><b>${TOOLS.length}</b><span>ứng dụng</span></div>
            <div><b>${platforms.length}</b><span>nền tảng</span></div>
            ${FIXES.length ? `<div><b>${FIXES.length}</b><span>ca trong sổ tay sửa lỗi</span></div>` : ""}
          </div>
        </div>
      </section>

      <section class="section" id="apps">
        <div class="wrap">
          <div class="section-head"><div><h2>Ứng dụng</h2><p>Bấm vào từng ứng dụng để xem tính năng, yêu cầu và tải về.</p></div></div>
          <div class="toolbar">
            ${CATEGORIES.length > 1 ? chips("cat", CATEGORIES, state.category, groupOf) : ""}
            <div class="toolbar-right">
              ${PLATFORMS.length > 1 ? `<div class="seg" role="group">${["Tất cả", ...PLATFORMS].map((p) =>
                `<button data-p="${esc(p)}" aria-pressed="${state.platform === p}">${esc(p)}</button>`).join("")}</div>` : ""}
              <label class="search">${ICON.search}
                <input id="q" type="search" placeholder="Tìm tên, tính năng, công nghệ…" value="${esc(state.q)}" autocomplete="off"></label>
            </div>
          </div>
          ${changesNotice()}
          <div id="grid" class="grid"></div>
        </div>
      </section>
      ${fixesTeaser()}`;

    const dismiss = app.querySelector("#notice-close");
    if (dismiss) dismiss.addEventListener("click", () => { session.set("dvt.noticeClosed", true); app.querySelector(".notice").remove(); });
    app.querySelector("#go-apps").addEventListener("click", (e) => {
      e.preventDefault(); document.getElementById("apps").scrollIntoView({ behavior: "smooth" });
    });
    app.querySelector("#q").addEventListener("input", (e) => { state.q = e.target.value.trim(); renderGrid(); });
    app.querySelectorAll(".seg button").forEach((b) => b.addEventListener("click", () => {
      state.platform = b.dataset.p;
      app.querySelectorAll(".seg button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderGrid();
    }));
    app.querySelectorAll(".chip[data-cat]").forEach((b) => b.addEventListener("click", () => {
      state.category = b.dataset.cat;
      app.querySelectorAll(".chip[data-cat]").forEach((x) => x.setAttribute("aria-pressed", x === b));
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
    setNav("apps");
    const version = (rel && rel.tag) || (t.version ? "v" + t.version : "—");
    const updated = fmtDate((rel && rel.date) || t.updated) || "—";
    app.innerHTML = `
      <div class="wrap page" style="${gvars(t.category)}">
        ${crumb([["#/", "Ứng dụng"], [null, t.category], [null, t.name]])}
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
      setNav("apps");
      app.innerHTML = `<div class="wrap page">${crumb([["#/", "Ứng dụng"], [null, "Không tìm thấy"]])}
        <div class="empty">Không tìm thấy ứng dụng “${esc(id)}”. <a href="#/">Về danh sách</a></div></div>`;
      return;
    }
    document.title = `${t.name} · ${SITE.title || "Dang Vien Dev"}`;
    renderDetail(t, null);
    if (t.githubRepo) {
      const rel = await fetchRelease(t.githubRepo);
      if (rel && location.hash === `#/tool/${encodeURIComponent(id)}`) renderDetail(t, rel);
    }
  }

  // ---------- sổ tay sửa lỗi ----------
  function fixMatches(f) {
    if (state.fixDevice !== "Tất cả" && f.device !== state.fixDevice) return false;
    if (state.fixVerified !== "Tất cả" && f.verified !== state.fixVerified) return false;
    if (!state.fixQ) return true;
    const hay = norm([f.title, f.model, f.device, f.symptom, f.cause, ...(f.codes || []),
      ...(f.steps || []).map((s) => `${s.t} ${s.d} ${s.cmd || ""}`), ...(f.notes || [])].join(" "));
    return norm(state.fixQ).split(/\s+/).every((w) => hay.includes(w));
  }

  const VBADGE = { field: "stable", improved: "dev", unresolved: "internal", doc: "beta" };
  const vbadge = (v) => `<span class="badge ${VBADGE[v] || "beta"}">${esc(VERIFIED[v] || v || "—")}</span>`;

  function fixCard(f) {
    return `
      <a class="card tool fix" style="${dvars(f.device)}" href="#/loi/${encodeURIComponent(f.id)}">
        <div class="tool-top">
          <div style="flex:1;min-width:0">
            <div class="tool-cat">${esc(f.device)}</div>
            <h3 class="tool-name">${esc(f.title)}</h3>
          </div>
        </div>
        <div class="tags">${(f.codes || []).map((c) => `<span class="tag code">${esc(c)}</span>`).join("")}</div>
        <p>${fmt(f.symptom)}</p>
        <div class="tool-foot"><span class="fix-model">${esc(f.model)}</span>${vbadge(f.verified)}</div>
      </a>`;
  }

  function renderFixGrid() {
    const list = FIXES.filter(fixMatches);
    document.getElementById("grid").innerHTML = list.length
      ? list.map(fixCard).join("")
      : `<div class="empty" style="grid-column:1/-1">Không có ca nào khớp. Thử gõ mã lỗi (vd 0x709, C447) hoặc tên máy.</div>`;
    const c = document.getElementById("fix-count");
    if (c) c.textContent = `${list.length} / ${FIXES.length} ca`;
  }

  function renderFixList() {
    setNav("fixes");
    const opts = [["Tất cả", "Tất cả"], ["field", VERIFIED.field], ["improved", VERIFIED.improved], ["unresolved", VERIFIED.unresolved], ["doc", VERIFIED.doc]];
    app.innerHTML = `
      <section class="hero-band small">
        <div class="wrap hero-in">
          ${crumb([["#/", "Trang chủ"], [null, "Sổ tay sửa lỗi"]])}
          <h1>Sổ tay sửa lỗi</h1>
          <p>Các ca lỗi máy tính, máy in, photocopy, máy scan mình đã gặp, ghi lại cách xử lý và kết quả.
            <b>Đã xử lý thực tế</b>: đã sửa thành công trên máy khách. <b>Đã cải thiện</b>: có tiến triển nhưng chưa xác nhận dứt điểm. <b>Chưa xác nhận</b>: ca chưa có kết quả cuối. <b>Quy trình chuẩn</b>: theo tài liệu hãng / kinh nghiệm.</p>
          <label class="search big">${ICON.search}
            <input id="fq" type="search" placeholder="Gõ mã lỗi, tên máy, hiện tượng… (vd 0x709, C447)" value="${esc(state.fixQ)}" autocomplete="off"></label>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <div class="toolbar">
            ${DEVICES.length > 1 ? chips("dev", DEVICES, state.fixDevice, devOf) : ""}
            <div class="toolbar-right">
              <div class="seg" role="group">${opts.map(([v, l]) =>
                `<button data-v="${esc(v)}" aria-pressed="${state.fixVerified === v}">${esc(l)}</button>`).join("")}</div>
              <span id="fix-count" class="dim"></span>
            </div>
          </div>
          <div id="grid" class="grid"></div>
        </div>
      </section>`;
    app.querySelector("#fq").addEventListener("input", (e) => { state.fixQ = e.target.value.trim(); renderFixGrid(); });
    app.querySelectorAll(".seg button").forEach((b) => b.addEventListener("click", () => {
      state.fixVerified = b.dataset.v;
      app.querySelectorAll(".seg button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderFixGrid();
    }));
    app.querySelectorAll(".chip[data-dev]").forEach((b) => b.addEventListener("click", () => {
      state.fixDevice = b.dataset.dev;
      app.querySelectorAll(".chip[data-dev]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderFixGrid();
    }));
    renderFixGrid();
  }

  function renderFixDetail(id) {
    const f = FIXES.find((x) => x.id === id);
    setNav("fixes");
    if (!f) {
      app.innerHTML = `<div class="wrap page">${crumb([["#/loi", "Sổ tay sửa lỗi"], [null, "Không tìm thấy"]])}
        <div class="empty">Không tìm thấy lỗi “${esc(id)}”. <a href="#/loi">Về sổ tay sửa lỗi</a></div></div>`;
      return;
    }
    document.title = `${f.title} · ${SITE.title || "Dang Vien Dev"}`;
    const steps = (f.steps || []).map((s, i) => `
      <li class="step"><span class="step-no">${i + 1}</span><div class="step-body">
        <div class="step-t">${fmt(s.t)}</div>
        ${s.d ? `<div class="step-d">${fmt(s.d)}</div>` : ""}
        ${s.cmd ? `<div class="cmd"><button class="copy" type="button" title="Copy">${ICON.copy}Copy</button><pre>${esc(s.cmd)}</pre></div>` : ""}
      </div></li>`).join("");
    app.innerHTML = `
      <div class="wrap page" style="${dvars(f.device)}">
        ${crumb([["#/loi", "Sổ tay sửa lỗi"], [null, f.device]])}
        <div class="card hero fix-hero">
          <div class="hero-text">
            <div class="tool-cat">${esc(f.device)}</div>
            <h2>${esc(f.title)}</h2>
            <div class="tags">${(f.codes || []).map((c) => `<span class="tag code">${esc(c)}</span>`).join("")}</div>
          </div>
          ${vbadge(f.verified)}
        </div>
        <div class="detail">
          <div>
            <div class="card sec"><h3>Hiện tượng</h3><p>${fmt(f.symptom)}</p></div>
            <div class="card sec"><h3>Nguyên nhân</h3><p>${fmt(f.cause)}</p></div>
            <div class="card sec"><h3>Cách xử lý</h3><ol class="steps">${steps}</ol></div>
            ${f.notes && f.notes.length ? `<div class="card sec warn"><h3>Lưu ý</h3><ul class="notes">${f.notes.map((n) => `<li>${fmt(n)}</li>`).join("")}</ul></div>` : ""}
          </div>
          <div class="card sec side-card">
            <h3>Thông tin</h3>
            <dl class="kv">
              <dt>Trạng thái</dt><dd>${vbadge(f.verified)}</dd>
              <dt>Thiết bị</dt><dd style="color:var(--g-fg)">${esc(f.device)}</dd>
              <dt>Áp dụng</dt><dd>${esc(f.model)}</dd>
              <dt>Cập nhật</dt><dd class="mono">${esc(fmtDate(f.updated) || "—")}</dd>
            </dl>
            <div class="tags">${(f.codes || []).map((c) => `<span class="tag code">${esc(c)}</span>`).join("")}</div>
            ${f.refs && f.refs.length ? `<div class="refs"><div class="refs-h">Tham khảo</div>${f.refs.map((r) =>
              `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a>`).join("")}</div>` : ""}
          </div>
        </div>
      </div>`;
    app.querySelectorAll(".cmd .copy").forEach((b) => b.addEventListener("click", async () => {
      const text = b.nextElementSibling.textContent;
      try { await navigator.clipboard.writeText(text); b.lastChild.textContent = "Đã copy"; }
      catch (_) { b.lastChild.textContent = "Copy lỗi"; }
      setTimeout(() => { b.lastChild.textContent = "Copy"; }, 1500);
    }));
  }

  function route() {
    const h = location.hash;
    window.scrollTo(0, 0);
    let m;
    if ((m = h.match(/^#\/tool\/(.+)$/))) showDetail(decodeURIComponent(m[1]));
    else if ((m = h.match(/^#\/loi\/(.+)$/))) renderFixDetail(decodeURIComponent(m[1]));
    else if (h === "#/loi") { document.title = `Sổ tay sửa lỗi · ${SITE.title || "Dang Vien Dev"}`; renderFixList(); }
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
