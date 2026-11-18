(function () {
  "use strict";

  const TOOLS = window.TOOLS || [];
  const SITE = window.SITE || {};
  const app = document.getElementById("app");

  const STATUS = {
    stable:   "Ổn định",
    beta:     "Beta",
    dev:      "Đang phát triển",
    internal: "Nội bộ"
  };

  const state = { q: "", platform: "Tất cả", category: "Tất cả" };
  const releaseCache = {};

  // ---------- helpers ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const norm = (s) => String(s ?? "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

  const uniq = (arr) => [...new Set(arr.filter(Boolean))];

  const badge = (status) =>
    `<span class="badge ${esc(status)}">${esc(STATUS[status] || status || "—")}</span>`;

  const fmtDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return day && m && y ? `${day}/${m}/${y}` : d;
  };

  // ---------- site chrome ----------
  document.title = SITE.title || document.title;
  document.getElementById("site-title").textContent = SITE.title || "Tools";
  const gh = document.getElementById("nav-github");
  if (SITE.github) gh.href = SITE.github; else gh.remove();
  document.getElementById("footer-author").innerHTML =
    `© ${new Date().getFullYear()} ${esc(SITE.author || "")}` +
    (SITE.contact ? ` · ${esc(SITE.contact)}` : "");
  document.getElementById("footer-count").textContent = `${TOOLS.length} tool`;

  // ---------- list view ----------
  function matches(t) {
    if (state.platform !== "Tất cả" && t.platform !== state.platform) return false;
    if (state.category !== "Tất cả" && t.category !== state.category) return false;
    if (!state.q) return true;
    const hay = norm([t.name, t.tagline, t.description, t.category, t.platform,
      ...(t.stack || []), ...(t.features || [])].join(" "));
    return norm(state.q).split(/\s+/).every((w) => hay.includes(w));
  }

  function chipRow(key, values) {
    return `<div class="chips" role="group">` +
      ["Tất cả", ...values].map((v) =>
        `<button class="chip" data-key="${key}" data-val="${esc(v)}" aria-pressed="${state[key] === v}">${esc(v)}</button>`
      ).join("") + `</div>`;
  }

  function card(t) {
    const ver = t.version ? `v${esc(t.version)}` : "Chưa phát hành";
    const upd = t.updated ? fmtDate(t.updated) : "";
    return `
      <a class="card" href="#/tool/${encodeURIComponent(t.id)}">
        <div class="card-head"><h3>${esc(t.name)}</h3>${badge(t.status)}</div>
        <p>${esc(t.tagline)}</p>
        <div class="meta">${(t.stack || []).slice(0, 4).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
        <div class="card-foot">
          <span>${esc(t.platform)} · ${esc(t.category)}</span>
          <span class="mono">${ver}${upd ? " · " + upd : ""}</span>
        </div>
      </a>`;
  }

  function renderGrid() {
    const list = TOOLS.filter(matches);
    const grid = document.getElementById("grid");
    grid.innerHTML = list.length
      ? list.map(card).join("")
      : "";
    grid.classList.toggle("grid", list.length > 0);
    if (!list.length) grid.innerHTML = `<div class="empty">Không có tool nào khớp bộ lọc.</div>`;
  }

  function renderList() {
    const platforms = uniq(TOOLS.map((t) => t.platform));
    const categories = uniq(TOOLS.map((t) => t.category));
    app.innerHTML = `
      <section class="hero">
        <h1>${esc(SITE.title || "Tools")}</h1>
        <p>${esc(SITE.subtitle || "")}</p>
      </section>
      <div class="toolbar">
        <label class="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="q" type="search" placeholder="Tìm theo tên, tính năng, công nghệ…" value="${esc(state.q)}" autocomplete="off">
        </label>
        ${platforms.length > 1 ? chipRow("platform", platforms) : ""}
      </div>
      ${categories.length > 1 ? `<div style="margin:-8px 0 20px">${chipRow("category", categories)}</div>` : ""}
      <div id="grid" class="grid"></div>`;

    document.getElementById("q").addEventListener("input", (e) => {
      state.q = e.target.value.trim();
      renderGrid();
    });
    app.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
      state[b.dataset.key] = b.dataset.val;
      app.querySelectorAll(`.chip[data-key="${b.dataset.key}"]`)
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderGrid();
    }));
    renderGrid();
  }

  // ---------- detail view ----------
  function list(items) {
    return `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  }

  function changelogHtml(entries) {
    if (!entries || !entries.length) return `<p class="note">Chưa có bản phát hành.</p>`;
    return `<div class="log">` + entries.map((e) => `
      <div class="log-item">
        <div><span class="log-ver">${esc(e.version)}</span> <span class="dim">· ${esc(fmtDate(e.date))}</span></div>
        ${e.notes && e.notes.length ? `<ul>${e.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
      </div>`).join("") + `</div>`;
  }

  function downloadBtn(t, rel) {
    const url = (rel && rel.url) || t.download;
    if (!url) return `<span class="btn" aria-disabled="true">Chưa có bản tải</span>`;
    const label = rel && rel.tag ? `Tải ${esc(rel.tag)}` : (t.version ? `Tải v${esc(t.version)}` : "Tải về");
    return `<a class="btn primary" href="${esc(url)}" target="_blank" rel="noopener">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>${label}</a>`;
  }

  // Lấy release mới nhất từ GitHub (chỉ repo public)
  async function fetchRelease(repo) {
    if (!repo) return null;
    if (releaseCache[repo] !== undefined) return releaseCache[repo];
    try {
      const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`,
        { headers: { Accept: "application/vnd.github+json" } });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      const asset = (j.assets || [])[0];
      releaseCache[repo] = {
        tag: j.tag_name,
        date: (j.published_at || "").slice(0, 10),
        url: asset ? asset.browser_download_url : j.html_url,
        body: j.body || ""
      };
    } catch (_) {
      releaseCache[repo] = null;
    }
    return releaseCache[repo];
  }

  function renderDetail(t, rel) {
    const version = (rel && rel.tag) || (t.version ? "v" + t.version : "—");
    const updated = fmtDate((rel && rel.date) || t.updated) || "—";
    app.innerHTML = `
      <a class="back" href="#/">← Tất cả tool</a>
      <div class="detail-head">
        <div>
          <h1>${esc(t.name)}</h1>
          <p>${esc(t.tagline)}</p>
        </div>
        <div class="actions">
          ${downloadBtn(t, rel)}
          ${t.docs ? `<a class="btn ghost" href="${esc(t.docs)}" target="_blank" rel="noopener">Hướng dẫn</a>` : ""}
          ${t.source ? `<a class="btn ghost" href="${esc(t.source)}" target="_blank" rel="noopener">Source</a>` : ""}
        </div>
      </div>
      <div class="detail-body">
        <div>
          ${t.description ? `<div class="section"><h2>Giới thiệu</h2><p class="lead">${esc(t.description)}</p></div>` : ""}
          ${t.features && t.features.length ? `<div class="section"><h2>Tính năng</h2>${list(t.features)}</div>` : ""}
          ${t.requirements && t.requirements.length ? `<div class="section"><h2>Yêu cầu hệ thống</h2>${list(t.requirements)}</div>` : ""}
          <div class="section"><h2>Changelog</h2>${changelogHtml(t.changelog)}</div>
        </div>
        <aside class="side">
          <dl class="kv">
            <dt>Trạng thái</dt><dd>${badge(t.status)}</dd>
            <dt>Phiên bản</dt><dd>${esc(version)}</dd>
            <dt>Cập nhật</dt><dd>${esc(updated)}</dd>
            <dt>Nền tảng</dt><dd>${esc(t.platform)}</dd>
            <dt>Nhóm</dt><dd>${esc(t.category)}</dd>
          </dl>
          <div class="meta">${(t.stack || []).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
        </aside>
      </div>`;
  }

  async function showDetail(id) {
    const t = TOOLS.find((x) => x.id === id);
    if (!t) {
      app.innerHTML = `<a class="back" href="#/">← Tất cả tool</a><div class="empty">Không tìm thấy tool “${esc(id)}”.</div>`;
      return;
    }
    document.title = `${t.name} · ${SITE.title || "Tools"}`;
    renderDetail(t, null);
    if (t.githubRepo) {
      const rel = await fetchRelease(t.githubRepo);
      if (rel && location.hash === `#/tool/${encodeURIComponent(id)}`) renderDetail(t, rel);
    }
  }

  // ---------- router ----------
  function route() {
    const m = location.hash.match(/^#\/tool\/(.+)$/);
    window.scrollTo(0, 0);
    if (m) showDetail(decodeURIComponent(m[1]));
    else { document.title = SITE.title || "Tools"; renderList(); }
  }

  window.addEventListener("hashchange", route);
  route();
})();
