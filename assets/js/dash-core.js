/* THE HAWK portal — shared dashboard shell + UI parts (design preview).
   Each role page (guardian / coach / admin) calls Dash.start({...}).
   Views are rendered on demand into #view (nothing is kept hidden in the DOM). */
(function () {
  "use strict";
  const X = window.HAWKX, ICONS = window.HAWK_ICONS || {};
  const IMG = "assets/img/";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = n => String(n).padStart(2, "0");
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fmtDate = (iso, wd) => { const d = new Date(iso + "T00:00:00"); return (wd ? WD[d.getDay()] + ", " : "") + pad(d.getDate()) + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); };

  /* ---------- icons (Tabler line set, see icons.js) ----------
     icon(): small UI icon in the current text colour.
     gi():   feature icon: white line icon on a solid Hawk-blue tile; size is the tile size. */
  const UI = {
    whistle: "stopwatch", team: "users-group", stats: "chart-bar", glyph: "chart-bar", clipboard: "clipboard-check", calcheck: "calendar-check",
    cal: "calendar", ball: "ball-football", vs: "soccer-field", medal: "award", image: "photo", trend: "trending-up", gear: "settings",
    edit: "pencil", chevL: "chevron-left", chevR: "chevron-right", chevD: "chevron-down", menu: "menu-2", qr: "qrcode", pin: "map-pin",
    up: "arrow-up", down: "arrow-down", shield: "shield-check", note: "file-text", grid: "layout-grid", list: "list-details"
  };
  const svgOf = n => ICONS[UI[n] || n] || ICONS["circle-check"] || "";
  const icon = (n, cls) => `<svg class="ic ${cls || ""}" viewBox="0 0 24 24" aria-hidden="true">${svgOf(n)}</svg>`;
  const gi = (n, size, cls) => { const s = size || 40; return `<svg class="gi ${cls || ""}" viewBox="0 0 24 24" width="${s}" height="${s}" style="padding:${Math.round(s * .25)}px;border-radius:${Math.round(s * .3)}px" aria-hidden="true">${svgOf(n)}</svg>`; };

  /* ---------- crest for opponents ---------- */
  const crest = (o, size) => o === "hawk" || !o
    ? `<img src="${IMG}logo.webp" alt="" width="${size || 40}" height="${size || 40}" style="object-fit:contain">`
    : `<svg viewBox="0 0 40 46" width="${size || 40}" height="${size || 40}" aria-hidden="true"><path d="M20 1.5l17 5.6v14.2c0 11.3-7.6 19.6-17 23.2C10.6 40.9 3 32.6 3 21.3V7.1z" fill="${o.c[0]}" stroke="${o.c[1]}" stroke-width="2"/><text x="20" y="26.5" text-anchor="middle" font-family="Saira,sans-serif" font-weight="700" font-size="12" fill="${o.c[1]}">${esc(o.t)}</text></svg>`;

  /* ---------- small builders ---------- */
  function avatar(p, size, cls) {
    size = size || 40;
    if (!p.img) {
      const ini = String(p.name || ((p.first || "") + " " + (p.last || ""))).trim().split(/\s+/).map(w => w[0] || "").join("").slice(0, 2).toUpperCase();
      return `<span class="av av-ini ${cls || ""}" style="width:${size}px;height:${size}px;font-size:${Math.round(size * .36)}px">${esc(ini || "?")}</span>`;
    }
    const hw = (p.head && p.head[1]) || .18, cx = (p.head && p.head[0]) || .5;
    const ih = size * .62 / hw, iw = ih * (p.ar || .55);
    return `<span class="av ${cls || ""}" style="width:${size}px;height:${size}px"><img src="${IMG}${p.img}" alt="" loading="lazy" style="height:${ih.toFixed(1)}px;width:${iw.toFixed(1)}px;left:${(size / 2 - cx * iw).toFixed(1)}px;top:${(size * .1).toFixed(1)}px"></span>`;
  }
  const bar = (v, max, cls) => `<span class="bar ${cls || ""}"><i style="width:${Math.max(3, Math.min(100, v / (max || 10) * 100)).toFixed(1)}%"></i></span>`;
  function ring(pct, size, stroke, label) {
    size = size || 110; stroke = stroke || 7;
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    return `<div class="ring-l"><div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle class="tr" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/><circle class="vl" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c * (1 - pct / 100)}"/></svg><b style="font-size:${Math.round(size * .2)}px">${Math.round(pct)}%</b></div>${label ? `<span>${esc(label)}</span>` : ""}</div>`;
  }
  function animateRings(root) { requestAnimationFrame(() => requestAnimationFrame(() => $$(".ring .vl", root).forEach(c => { c.style.strokeDashoffset = c.dataset.off; }))); }
  function spark(vals, h) {
    h = h || 70; const W = 300, mx = Math.max(1, ...vals), n = vals.length;
    const pts = vals.map((v, i) => [n === 1 ? W / 2 : i * (W / (n - 1)), h - 6 - (v / mx) * (h - 16)]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return `<svg class="spark" viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" style="height:${h}px"><path class="a" d="${d} L${W},${h} L0,${h}Z"/><path class="l" d="${d}"/></svg>`;
  }
  const tag = (txt, tone) => `<span class="tag ${tone || "t-mute"}">${esc(txt)}</span>`;
  const statusTag = s => tag(s, { Active: "t-ok", Approved: "t-ok", Open: "t-ok", Present: "t-ok", Paid: "t-ok", Submitted: "t-ok", Scheduled: "t-info", Invited: "t-info", Pending: "t-warn", "Pending review": "t-warn", Late: "t-warn", Due: "t-warn", Unpaid: "t-warn", Draft: "t-mute", Inactive: "t-bad", Closed: "t-mute", Absent: "t-bad", Returned: "t-bad", Full: "t-warn" }[s] || "t-mute");
  const head = (title, sub, actions, back) => `<div class="pg-head"><div><h1>${back ? `<a class="pg-back" href="${back}" aria-label="Back">${icon("chevL")}</a>` : ""}${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${actions ? `<div class="pg-actions">${actions}</div>` : ""}</div>`;
  const kpi = (ico, val, label, extra) => `<div class="card kpi"><span class="kpi-i">${gi(ico, 52)}</span><div><b>${val}</b><span>${esc(label)}</span>${extra ? `<em>${extra}</em>` : ""}</div></div>`;
  const empty = (ico, text) => `<div class="empty">${gi(ico, 48)}<p>${esc(text)}</p></div>`;
  // Athlantix-style "select" card. o: {href | attr, ico | html, label, sub, badge, cls}
  const selCard = o => {
    const inner = `${o.badge ? `<span class="sc-badge">${o.badge}</span>` : ""}${o.html || gi(o.ico, 76)}<b>${esc(o.label)}</b>${o.sub ? `<small>${o.sub}</small>` : ""}`;
    return o.href ? `<a class="sel-card ${o.cls || ""}" href="${o.href}">${inner}</a>` : `<button type="button" class="sel-card ${o.cls || ""}" ${o.attr || ""}>${inner}</button>`;
  };
  const addCard = (label, attr) => `<button type="button" class="sel-card add-card" ${attr}>${gi("plus", 64)}<b>${esc(label)}</b></button>`;
  const selGrid = cards => `<div class="sel-grid">${cards.join("")}</div>`;
  function field(o) {
    const id = "f-" + o.name, req = o.required ? " required" : "", ph = o.placeholder ? ` placeholder="${esc(o.placeholder)}"` : "";
    let ctl;
    if (o.type === "select") ctl = `<select class="sel" id="${id}" name="${o.name}"${req}>${o.options.map(op => { const [v, l] = Array.isArray(op) ? op : [op, op]; return `<option value="${esc(v)}"${String(v) === String(o.value) ? " selected" : ""}>${esc(l)}</option>`; }).join("")}</select>`;
    else if (o.type === "textarea") ctl = `<textarea class="ta" id="${id}" name="${o.name}"${ph}${req}>${esc(o.value || "")}</textarea>`;
    else ctl = `<input class="in" id="${id}" name="${o.name}" type="${o.type || "text"}" value="${esc(o.value == null ? "" : o.value)}"${ph}${req}${o.attrs ? " " + o.attrs : ""}>`;
    return `<label class="fld${o.full ? " full" : ""}" for="${id}"><span>${esc(o.label)}</span>${ctl}${o.help ? `<small>${esc(o.help)}</small>` : ""}</label>`;
  }
  const formData = root => { const o = {}; $$("[name]", root).forEach(el => { if (el.type === "checkbox") o[el.name] = el.checked; else if (el.type !== "file") o[el.name] = el.value.trim(); }); return o; };
  function table(cols, rows, emptyText) {
    if (!rows.length) return empty("clipboard-list", emptyText || "Nothing here yet.");
    return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${cols.map(c => `<th class="${c.cls || ""}">${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr data-i="${i}">${cols.map(c => `<td class="${c.cls || ""}">${c.render ? c.render(r, i) : esc(r[c.k])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  const seg = (name, opts, val, yellow) => `<div class="seg" data-seg="${name}"${yellow ? " data-y" : ""}>${opts.map(([v, l]) => `<button type="button" class="${String(v) === String(val) ? "is-on" + (yellow ? " y" : "") : ""}" data-v="${esc(v)}" aria-pressed="${String(v) === String(val)}">${esc(l)}</button>`).join("")}</div>`;
  const chips = (name, opts, val) => `<div class="chips" data-chips="${name}">${opts.map(([v, l]) => `<button type="button" class="chip${String(v) === String(val) ? " is-on" : ""}" data-v="${esc(v)}">${esc(l)}</button>`).join("")}</div>`;
  // attr is "seg" or "chips"; fn(groupName, value)
  function onPick(root, attr, fn) {
    root.addEventListener("click", e => {
      const b = e.target.closest(`[data-${attr}] [data-v]`); if (!b) return;
      const box = b.closest(`[data-${attr}]`), y = box.hasAttribute("data-y");
      $$("[data-v]", box).forEach(x => { const on = x === b; x.classList.toggle("is-on", on); if (y) x.classList.toggle("y", on); x.setAttribute("aria-pressed", on); });
      fn(box.dataset[attr], b.dataset.v);
    });
  }

  /* ---------- modal, toast, confirm ---------- */
  function modal(o) {
    const ov = document.createElement("div"); ov.className = "mdl-o";
    ov.innerHTML = `<div class="mdl ${o.size || ""}" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><div class="mdl-h"><h3>${esc(o.title)}</h3><button class="ibtn" type="button" data-x aria-label="Close">${icon("x")}</button></div><div class="mdl-b">${o.body}</div>${o.foot ? `<div class="mdl-f">${o.foot}</div>` : ""}</div>`;
    document.body.appendChild(ov);
    const prev = document.activeElement;
    const key = e => { if (e.key === "Escape") close(); };
    function close() { ov.remove(); document.removeEventListener("keydown", key); if (prev && prev.focus) prev.focus({ preventScroll: true }); if (o.onClose) o.onClose(); }
    document.addEventListener("keydown", key);
    ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-x]")) close(); });
    setTimeout(() => { const f = ov.querySelector(".mdl-b input, .mdl-b select, .mdl-b textarea"); (f || ov.querySelector("[data-x]")).focus(); }, 40);
    animateRings(ov);
    return { el: ov, close, q: s => ov.querySelector(s) };
  }
  function toast(msg, ico) {
    let box = $(".toasts"); if (!box) { box = document.createElement("div"); box.className = "toasts"; box.setAttribute("role", "status"); document.body.appendChild(box); }
    const t = document.createElement("div"); t.className = "toast"; t.innerHTML = gi(ico || "circle-check", 34) + `<span>${esc(msg)}</span>`;
    box.appendChild(t); setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 320); }, 2800);
  }
  function confirmBox(title, text, okLabel, onOk) {
    const m = modal({ title, body: `<p class="muted">${esc(text)}</p>`, foot: `<button class="btn btn-g" data-x>Cancel</button><button class="btn btn-d" data-ok>${esc(okLabel || "Delete")}</button>` });
    m.q("[data-ok]").addEventListener("click", () => { m.close(); onOk(); });
  }
  function countUp(root) {
    $$("[data-count]", root).forEach(el => {
      const to = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length, t0 = performance.now();
      const step = n => { const k = Math.min(1, (n - t0) / 900), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  /* ---------- LaLiga-style player stats card ---------- */
  function statRowsFor(p, s) {
    return p.key === "gk"
      ? [[s.mins, "Mins Played"], [s.apps, "Appearances"], [s.saves, "Saves"], [s.passes, "Total Passes"], [s.duels, "Duels Won"], [s.rating, "Avg Rating"]]
      : [[s.mins, "Mins Played"], [s.shots, "Shots on Target"], [s.goals, "Goals"], [s.passes, "Total Passes"], [s.duels, "Duels Won"], [s.dribbles, "Successful Dribbles"]];
  }
  function statsCard(p, s, sub) {
    return `<div class="ll"><div class="ll-bg"></div>
      <div class="ll-pl"><span class="ll-num">${esc(p.num)}</span>${p.img ? `<img src="${IMG}${p.img}" alt="${esc(p.name)}">` : `<img src="${IMG}logo.webp" alt="" style="height:46%;bottom:22%;opacity:.5">`}</div>
      <div class="ll-r"><h2 class="ll-name">${esc(p.first)} ${esc(p.last)}</h2><p class="ll-sub">${esc(sub || "Stats")}</p>
        <div class="ll-rows">${statRowsFor(p, s).map(([v, l]) => `<div class="ll-row"><b data-count="${v}">0</b><span>${esc(l)}</span></div>`).join("")}</div>
        <div class="ll-brand"><img src="${IMG}logo.webp" alt="">THE HAWK</div></div></div>`;
  }

  /* ---------- rating rows (Athlantix list) ---------- */
  // one line icon per row label, so a list reads at a glance
  const ROW_ICO = {
    "attendance": "calendar-check", "appearances": "shirt-sport", "goals": "ball-football", "assists": "heart-handshake", "avg rating": "star", "average rating": "star",
    "last evaluation": "clipboard-check", "minutes played": "stopwatch", "saves": "hand-stop", "total passes": "send", "duels won": "shield-half",
    "ball control": "ball-football", "passing": "send", "shooting": "target-arrow", "dribbling": "play-football", "first touch": "shoe",
    "positioning": "map-pin", "decision making": "brain", "game awareness": "eye", "speed": "bolt", "stamina": "flame", "agility": "run",
    "discipline": "shield-check", "teamwork": "users-group", "attitude": "mood-happy", "coachability": "school",
    "handling": "hand-stop", "shot stopping": "shield-half", "diving": "run", "distribution": "send", "footwork": "shoe",
    "age group": "users-group", "position": "soccer-field", "jersey number": "shirt-sport", "preferred foot": "shoe", "age": "calendar", "date of birth": "calendar-event",
    "school": "school", "joined": "calendar-check", "guardian": "user", "relationship": "heart", "email": "mail", "phone": "phone", "player mykad": "id", "portal access": "key"
  };
  const glyph = label => gi(ROW_ICO[String(label || "").toLowerCase()] || "chart-bar", 34, "glyph");
  // one generic row: [label, value 0..max, display text]
  const statRow = (label, v, max, txt, edit) => `<div class="row${edit ? "" : " ro"}">${glyph(label)}<label>${esc(label)}</label>${bar(v, max)}<b>${txt == null ? pad(v) : txt}</b>${edit ? `<button type="button" class="ibtn y" ${edit} aria-label="Edit ${esc(label)}">${icon("edit")}</button>` : ""}</div>`;
  function evalRows(p, scores, editable) {
    const groups = X.attrsFor(p);
    return `<div class="rows">${Object.entries(groups).map(([g, list]) => `<div class="grp-h">${esc(g)}</div>` + list.map(a => {
      const v = scores[a] == null ? 5 : scores[a];
      return `<div class="row${editable ? "" : " ro"}" data-attr="${esc(a)}">${glyph(a)}<label>${esc(a)}</label>${editable ? `<input type="range" min="1" max="10" step="1" value="${v}" aria-label="${esc(a)} score" hidden>` : ""}${bar(v, 10)}<b>${pad(v)}</b>${editable ? `<button type="button" class="ibtn y" data-edit aria-label="Edit ${esc(a)}">${icon("edit")}</button>` : ""}</div>`;
    }).join("")).join("")}</div>`;
  }
  // pencil toggles a slider in place of the bar
  function bindEvalRows(root, onChange) {
    root.addEventListener("click", e => {
      const b = e.target.closest("[data-edit]"); if (!b) return;
      const row = b.closest(".row"), rng = $("input[type=range]", row), br = $(".bar", row), on = rng.hidden;
      rng.hidden = !on; br.hidden = on; b.innerHTML = icon(on ? "check" : "edit"); if (on) rng.focus();
    });
    root.addEventListener("input", e => {
      const r = e.target.closest(".row input[type=range]"); if (!r) return;
      const row = r.closest(".row"); $("b", row).textContent = pad(r.value); $(".bar i", row).style.width = (r.value * 10) + "%";
      if (onChange) onChange(row.dataset.attr, +r.value);
    });
  }

  /* ---------- session ---------- */
  function session(role) {
    let s = null;
    try { s = JSON.parse(sessionStorage.getItem("hawk.session") || "null"); } catch (e) { s = null; }
    if (!s || s.role !== role) { location.replace("login.html?role=" + role); return null; }
    return s;
  }

  /* ---------- shell ---------- */
  function start(cfg) {
    const ses = session(cfg.role); if (!ses) return;
    const me = cfg.user(ses);
    document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <linearGradient id="rgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a66f0"/><stop offset="1" stop-color="#1a33b8"/></linearGradient>
      <linearGradient id="dfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b49e0" stop-opacity=".16"/><stop offset="1" stop-color="#2b49e0" stop-opacity="0"/></linearGradient></defs></svg>`);
    const navHtml = cfg.nav.map(n => n.group ? `<div class="sb-group">${esc(n.group)}</div>` : `<a class="sb-item" href="#${n.id}" data-nav="${n.id}">${icon(n.icon)}<span>${esc(n.label)}</span></a>`).join("");
    const app = document.createElement("div"); app.className = "app";
    app.innerHTML = `<aside class="sb" id="sb" aria-label="Sidebar">
        <a class="sb-logo" href="index.html"><img src="${IMG}logo.webp" alt=""><span><b>THE HAWK</b><small>${esc(cfg.label)}</small></span></a>
        <nav class="sb-nav" aria-label="${esc(cfg.label)}">${navHtml}</nav>
        <div class="sb-foot"><button class="sb-out" type="button" data-logout>${icon("logout")}Logout</button></div>
      </aside><div class="sb-scrim" data-close-nav></div>
      <div class="main"><header class="tb">
          <button class="tb-burger" type="button" aria-label="Open menu" data-open-nav>${icon("menu")}</button>
          <label class="tb-search">${icon("search")}<span class="sr">Search</span><input type="search" placeholder="${esc(cfg.searchHint || "Search")}" autocomplete="off"></label>
          <div class="tb-right"><div style="position:relative"><button class="tb-bell" type="button" aria-label="Notifications" aria-haspopup="true" data-bell>${icon("bell")}<span class="dot"></span></button></div>
            <div class="tb-user">${me.avatar}<div><b>${esc(me.name)}</b><small>${esc(me.sub)}</small></div></div></div>
        </header><main class="view" id="view" tabindex="-1"></main></div>`;
    document.body.appendChild(app);

    let view = $("#view", app);
    const search = $(".tb-search input", app);
    let ctx = null;
    function go() {
      const [id, ...rest] = location.hash.slice(1).split("/");
      const first = cfg.nav.find(n => n.id);
      const nav = cfg.nav.find(n => n.id === id);
      if (!nav) { history.replaceState(null, "", "#" + first.id); return go(); }
      $$(".sb-item", app).forEach(a => { const on = a.dataset.nav === id; a.classList.toggle("is-active", on); on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"); });
      app.classList.remove("nav-open");
      document.title = nav.label + " · THE HAWK " + cfg.label;
      // fresh element per view so listeners from the previous view never stack up
      const fresh = view.cloneNode(false); view.replaceWith(fresh); view = fresh;
      search.value = "";
      ctx = { param: rest.join("/"), me: ses, onSearch: null };
      cfg.views[id](view, ctx);
      animateRings(view); countUp(view);
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", go);
    search.addEventListener("input", () => { if (ctx && ctx.onSearch) ctx.onSearch(search.value.trim().toLowerCase()); });
    app.addEventListener("click", e => {
      if (e.target.closest("[data-open-nav]")) app.classList.add("nav-open");
      if (e.target.closest("[data-close-nav]")) app.classList.remove("nav-open");
      if (e.target.closest("[data-logout]")) { try { sessionStorage.removeItem("hawk.session"); } catch (er) {} location.href = "login.html"; }
      const bell = e.target.closest("[data-bell]");
      const open = $(".drop", app);
      if (bell) {
        if (open) { open.remove(); return; }
        bell.parentElement.insertAdjacentHTML("beforeend", `<div class="drop" role="menu"><h4>Notifications</h4>${(X.notes[cfg.role] || []).map(n => `<div class="note"><span class="kpi-i">${gi(n[0], 40)}</span><div><b>${esc(n[1])}</b><p>${esc(n[2])}</p><small>${esc(n[3])}</small></div></div>`).join("")}</div>`);
        $(".dot", bell) && $(".dot", bell).remove();
      } else if (open && !e.target.closest(".drop")) open.remove();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { const d = $(".drop", app); if (d) d.remove(); app.classList.remove("nav-open"); } });
    go();
  }

  window.Dash = {
    start, $, $$, esc, pad, fmtDate, icon, gi, crest, avatar, bar, ring, animateRings, spark, tag, statusTag, head, kpi, empty, selCard, addCard, selGrid, field, formData, table,
    seg, chips, onPick, modal, toast, confirmBox, countUp, statsCard, statRowsFor, statRow, glyph, evalRows, bindEvalRows, MONTHS, IMG
  };
})();
