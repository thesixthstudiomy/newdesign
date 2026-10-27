/* THE HAWK portal — Admin dashboard (design preview, in-memory data).
   Eleven sections; each renders on demand into a fresh view element. */
(function () {
  "use strict";
  const D = window.Dash, S = window.DashShared, X = window.HAWKX;
  const { esc, pad, fmtDate, icon, gi, avatar, statusTag, head, kpi, crest, $, $$ } = D;
  const CATS = ["U6", "U7", "U8", "U9", "U10", "U11", "U12"];
  const REG_BASE = "https://thehawkpenang.com/register/";
  const slugify = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "tournament";
  const uid = p => p + "-" + Date.now().toString(36).slice(-5).toUpperCase();
  const mchips = (name, opts, sel) => `<div class="mchips" role="group">${opts.map(o => `<label><input type="checkbox" name="${name}" value="${esc(o)}"${(sel || []).includes(o) ? " checked" : ""}><span>${esc(o)}</span></label>`).join("")}</div>`;
  const checked = (root, name) => $$(`input[name="${name}"]:checked`, root).map(i => i.value);
  const dmy = iso => { const d = new Date(iso + "T00:00:00"); return { d: pad(d.getDate()), m: D.MONTHS[d.getMonth()].toUpperCase(), w: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d.getDay()] }; };
  const acts = (...b) => `<span class="acts">${b.join("")}</span>`;
  const ib = (attr, ico, label, y) => `<button type="button" class="ibtn${y ? " y" : ""}" ${attr} aria-label="${esc(label)}" title="${esc(label)}">${icon(ico)}</button>`;

  /* =====================================================================
     1. Player Management
     ===================================================================== */
  const players = (v, ctx) => S.playerManagement(v, ctx, { admin: true, statsHref: p => "#performance/" + p.id, evalHref: () => "#evaluation" });

  /* =====================================================================
     2. Coach Management  /  3. Team Management (shared staff editor)
     ===================================================================== */
  const COACH_ROLES = ["Head Coach", "Senior Coach", "Assistant Coach", "Goalkeeper Coach", "Fitness Coach"];
  const MGMT_ROLES = ["Club President", "Vice President", "Secretary", "Treasurer", "Team Manager", "Committee Member"];
  function editStaff(s, kind, done) {
    const isNew = !s, roles = kind === "coach" ? COACH_ROLES : MGMT_ROLES;
    s = s || { first: "", last: "", pos: roles[kind === "coach" ? 2 : 5], email: "", phone: "", cats: [], key: kind === "coach" ? "coach" : "mgmt", status: "Invited", lastLogin: "—" };
    const m = D.modal({
      title: isNew ? (kind === "coach" ? "Add coach" : "Add team member") : "Edit " + s.name,
      body: `${isNew ? "" : `<div class="prof" style="margin-bottom:20px">${avatar(s, 64, "ring")}<div><h2>${esc(s.name)}</h2><p>${esc(s.id)} · ${statusTag(s.status)}</p></div></div>`}
        <form class="grid-f">${D.field({ name: "first", label: "First name", value: s.first, required: true })}${D.field({ name: "last", label: "Last name", value: s.last, required: true })}
        ${D.field({ name: "pos", label: "Role", type: "select", options: roles, value: s.pos })}${D.field({ name: "phone", label: "Phone", value: s.phone })}
        ${D.field({ name: "email", label: "Email (sign-in)", type: "email", value: s.email, full: true, help: isNew ? "We'll email an invite to set their password." : "" })}
        ${kind === "coach" ? `<div class="fld full"><span>Age groups they coach</span>${mchips("cats", CATS, s.cats)}</div>` : ""}</form>`,
      foot: `<button class="btn btn-g" data-x>Cancel</button><button class="btn btn-y" data-save>${icon(isNew ? "send" : "check")}${isNew ? "Send invite" : "Save changes"}</button>`
    });
    m.q("[data-save]").addEventListener("click", () => {
      const f = D.formData(m.el);
      if (!f.first || !f.last) { m.q("[name=first]").focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { m.q("[name=email]").focus(); D.toast("Enter a valid email.", "bell-ringing"); return; }
      Object.assign(s, { first: f.first, last: f.last, name: f.first + " " + f.last, pos: f.pos, phone: f.phone, email: f.email });
      if (kind === "coach") s.cats = checked(m.el, "cats");
      if (isNew) { s.id = uid(kind === "coach" ? "COA" : "MGT"); (kind === "coach" ? X.coaches : X.management).push(s); X.staff.push(s); }
      m.close(); D.toast(isNew ? "Invite sent to " + f.email + "." : "Changes saved.", isNew ? "bell" : "check"); done();
    });
  }
  function coaches(v, ctx) {
    let q = "";
    v.innerHTML = head("Coach Management", "Coaching staff, their age groups and portal access.", `<button class="btn btn-y" data-add>${icon("plus")}Add coach</button>`) +
      `<div class="grid g-4">${kpi("stopwatch", X.coaches.length, "Coaches")}${kpi("circle-check", X.coaches.filter(c => c.status === "Active").length, "Active accounts")}${kpi("bell-ringing", X.coaches.filter(c => c.status === "Invited").length, "Invites pending")}${kpi("shirt-sport", (X.players.length / Math.max(1, X.coaches.length)).toFixed(1), "Players per coach")}</div><div class="pl-grid mt-24" id="sg"></div>`;
    function draw() {
      const list = X.coaches.filter(c => !q || (c.name + c.pos + c.email).toLowerCase().includes(q));
      $("#sg", v).innerHTML = list.length ? list.map(c => `<div class="pl-card scard">${avatar(c, 88, c.status === "Active" ? "ring" : "")}<b>${esc(c.name)}</b><small>${esc(c.pos)}</small>
        <div class="chips">${(c.cats || []).map(x => `<span class="chip">${esc(x)}</span>`).join("") || '<span class="chip">No squad yet</span>'}</div>${statusTag(c.status)}
        <div class="meta"><span title="${esc(c.email)}">${esc(c.email)}</span><span>Last sign-in: ${esc(c.lastLogin)}</span></div>
        ${acts(ib(`data-edit="${c.id}"`, "edit", "Edit " + c.name, true), ib(`data-reset="${c.id}"`, c.status === "Invited" ? "send" : "lock", c.status === "Invited" ? "Resend invite" : "Send password reset"), ib(`data-del="${c.id}"`, "trash", "Remove " + c.name))}</div>`).join("") + `<button type="button" class="sel-card add-card" data-add style="min-height:0">${gi("user-plus", 56)}<b>Add coach</b></button>` : D.empty("stopwatch", "No coaches match.");
    }
    ctx.onSearch = s => { q = s; draw(); };
    v.addEventListener("click", e => {
      const get = a => X.coaches.find(c => c.id === e.target.closest(`[${a}]`).getAttribute(a));
      if (e.target.closest("[data-add]")) editStaff(null, "coach", draw);
      else if (e.target.closest("[data-edit]")) editStaff(get("data-edit"), "coach", draw);
      else if (e.target.closest("[data-reset]")) { const c = get("data-reset"); D.toast((c.status === "Invited" ? "Invite resent to " : "Password reset link sent to ") + c.email + ".", "bell-ringing"); }
      else if (e.target.closest("[data-del]")) { const c = get("data-del"); D.confirmBox("Remove " + c.name + "?", "They lose portal access immediately. Their past evaluations stay on record.", "Remove coach", () => { X.coaches.splice(X.coaches.indexOf(c), 1); D.toast(c.name + " removed.", "circle-check"); draw(); }); }
    });
    draw();
  }
  function team(v, ctx) {
    let q = "";
    v.innerHTML = head("Team Management", "Club officials shown on the website's Management list, in this order.", `<button class="btn btn-y" data-add>${icon("plus")}Add member</button>`) + `<div class="pl-grid" id="tt"></div>`;
    function draw() {
      const list = X.management.filter(s => !q || (s.name + s.pos).toLowerCase().includes(q));
      $("#tt", v).innerHTML = list.map(s => { const i = X.management.indexOf(s); return `<div class="pl-card scard"><span class="num">${pad(i + 1)}</span>${avatar(s, 92, s.hidden ? "" : "ring")}<b>${esc(s.name)}</b><small>${esc(s.pos)}</small>
        <label class="toggle" style="margin-top:12px;font-size:12.5px;color:var(--muted)"><input type="checkbox" data-pub="${s.id}"${s.hidden ? "" : " checked"}><i></i>On website</label>
        <div class="meta"><span>${esc(s.email)}</span><span>${esc(s.phone || "—")}</span></div>
        ${acts(ib(`data-up="${s.id}"${i === 0 ? " disabled" : ""}`, "chevL", "Move earlier"), ib(`data-down="${s.id}"${i === X.management.length - 1 ? " disabled" : ""}`, "chevR", "Move later"), ib(`data-edit="${s.id}"`, "edit", "Edit " + s.name, true), ib(`data-del="${s.id}"`, "trash", "Remove " + s.name))}</div>`; }).join("") +
        `<button type="button" class="sel-card add-card" data-add style="min-height:0">${gi("user-plus", 56)}<b>Add member</b></button>`;
    }
    ctx.onSearch = s => { q = s; draw(); };
    v.addEventListener("click", e => {
      const el = e.target.closest("[data-up],[data-down],[data-edit],[data-del],[data-add]"); if (!el) return;
      if (el.hasAttribute("data-add")) return editStaff(null, "mgmt", draw);
      const id = el.dataset.up || el.dataset.down || el.dataset.edit || el.dataset.del, s = X.management.find(x => x.id === id), i = X.management.indexOf(s);
      if (el.hasAttribute("data-up") && i > 0) { X.management.splice(i, 1); X.management.splice(i - 1, 0, s); draw(); }
      else if (el.hasAttribute("data-down") && i < X.management.length - 1) { X.management.splice(i, 1); X.management.splice(i + 1, 0, s); draw(); }
      else if (el.hasAttribute("data-edit")) editStaff(s, "mgmt", draw);
      else if (el.hasAttribute("data-del")) D.confirmBox("Remove " + s.name + "?", "They'll be taken off the website's Management list.", "Remove", () => { X.management.splice(i, 1); D.toast(s.name + " removed.", "circle-check"); draw(); });
    });
    v.addEventListener("change", e => { const t = e.target.closest("[data-pub]"); if (!t) return; const s = X.management.find(x => x.id === t.dataset.pub); s.hidden = !t.checked; D.toast(s.name + (t.checked ? " is shown" : " is hidden") + " on the website.", "circle-check"); draw(); });
    draw();
  }

  /* =====================================================================
     4. Match Management (Match or Tournament)
     ===================================================================== */
  function fixtureRow(f, isResult) {
    const d = dmy(f.date), h = f.home ? "hawk" : f.opp, a = f.home ? f.opp : "hawk";
    const name = t => t === "hawk" ? "The Hawk" : t.name;
    return `<div class="fx"><div class="fx-d"><small>${d.w}</small><b>${d.d}</b><span>${d.m}</span></div>
      <div class="fx-c">${D.tag(f.type, f.type === "Tournament" ? "t-warn" : "t-info")}<b>${esc(f.comp)}</b><small>${esc(f.cat)}${f.round ? " · " + esc(f.round) : ""}</small></div>
      <div class="fx-t">${crest(h, 30)}<span>${esc(name(h))}</span>${isResult ? `<span class="sc">${f.score[0]} – ${f.score[1]}</span>` : '<span class="vs">VS</span>'}${crest(a, 30)}<span>${esc(name(a))}</span></div>
      <div class="fx-v"><span>${icon("clock")}${esc(f.time || "—")}</span><span>${icon("pin")}${esc(f.venue)}</span></div>
      ${acts(isResult ? ib(`data-res="${f.id}"`, "edit", "Edit result", true) : ib(`data-score="${f.id}"`, "check", "Enter result") + ib(`data-edit="${f.id}"`, "edit", "Edit fixture", true), ib(`data-del="${f.id}"`, "trash", "Delete"))}</div>`;
  }
  function editFixture(f, done) {
    const isNew = !f;
    f = f || { type: "Match", date: "2026-11-22", time: "09:00 AM", comp: "Friendly", cat: "U12", opp: { name: "", t: "", c: ["#c8102e", "#ffffff"] }, home: true, venue: "Padang Bandar Perda" };
    let type = f.type;
    const typeFields = () => type === "Tournament"
      ? D.field({ name: "tour", label: "Tournament", type: "select", options: X.tournaments.map(t => [t.name, t.name]).concat([["__other", "Other (external) tournament…"]]), value: f.comp }) + D.field({ name: "round", label: "Round", type: "select", options: ["Group stage", "Round of 16", "Quarter-final", "Semi-final", "Final", "Third place"], value: f.round || "Group stage" })
      : D.field({ name: "comp", label: "Competition", value: f.comp, placeholder: "e.g. Liga Remaja Utara, Friendly" }) + D.field({ name: "round", label: "Matchday (optional)", value: f.round || "", placeholder: "e.g. Matchday 4" });
    const m = D.modal({
      title: isNew ? "Add fixture" : "Edit fixture", size: "lg",
      body: `<div class="fld" style="margin-bottom:18px"><span>This fixture is a</span>${D.seg("ftype", [["Match", "Match"], ["Tournament", "Tournament"]], type, true)}</div>
        <form class="grid-f"><div class="grid-f full" id="tf" style="grid-column:1/-1">${typeFields()}</div>
        ${D.field({ name: "opp", label: "Opponent", value: f.opp.name, required: true, placeholder: "Team name" })}${D.field({ name: "cat", label: "Age group", type: "select", options: CATS, value: f.cat })}
        ${D.field({ name: "date", label: "Date", type: "date", value: f.date })}${D.field({ name: "time", label: "Kick-off", value: f.time, placeholder: "08:30 AM" })}
        ${D.field({ name: "venue", label: "Venue", value: f.venue, full: true })}
        <div class="fld"><span>Home or away</span>${D.seg("ha", [["home", "Home"], ["away", "Away"]], f.home ? "home" : "away")}</div>
        ${D.field({ name: "color", label: "Opponent colour", type: "color", value: f.opp.c[0], attrs: 'style="padding:4px;height:42px"' })}</form>`,
      foot: `<button class="btn btn-g" data-x>Cancel</button><button class="btn btn-y" data-save>${icon("check")}${isNew ? "Add fixture" : "Save"}</button>`
    });
    let home = f.home;
    D.onPick(m.el, "seg", (g, val) => { if (g === "ftype") { type = val; $("#tf", m.el).innerHTML = typeFields(); } if (g === "ha") home = val === "home"; });
    m.q("[data-save]").addEventListener("click", () => {
      const v = D.formData(m.el);
      if (!v.opp) { m.q("[name=opp]").focus(); return; }
      const comp = type === "Tournament" ? (v.tour === "__other" ? "External tournament" : v.tour) : (v.comp || "Friendly");
      Object.assign(f, { type, comp, round: v.round, cat: v.cat, date: v.date, time: v.time, venue: v.venue, home, opp: { name: v.opp, t: v.opp.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase(), c: [v.color, "#ffffff"] }, status: "Scheduled" });
      if (isNew) { f.id = uid("F"); X.fixtures.push(f); }
      m.close(); D.toast(isNew ? type + " added to the calendar." : "Fixture saved.", "calendar-event"); done();
    });
  }
  function enterScore(f, done, isResult) {
    const sc = f.score || [0, 0];
    const m = D.modal({
      title: (isResult ? "Edit result" : "Enter result") + " · " + (f.home ? "The Hawk vs " + f.opp.name : f.opp.name + " vs The Hawk"),
      body: `<div class="flex" style="justify-content:center;gap:22px;margin-bottom:20px">${crest(f.home ? "hawk" : f.opp, 54)}<input class="in" name="h" type="number" min="0" max="30" value="${sc[0]}" aria-label="Home goals" style="width:76px;height:64px;text-align:center;font-size:26px;font-weight:600"><span class="muted" style="font-size:24px">–</span><input class="in" name="a" type="number" min="0" max="30" value="${sc[1]}" aria-label="Away goals" style="width:76px;height:64px;text-align:center;font-size:26px;font-weight:600">${crest(f.home ? f.opp : "hawk", 54)}</div>
        ${D.field({ name: "scorers", label: "Hawk scorers (optional)", placeholder: "e.g. Rayyan Hakimi 2, Zayyan Amsyar" })}`,
      foot: `<button class="btn btn-g" data-x>Cancel</button><button class="btn btn-y" data-save>${icon("check")}Save result</button>`
    });
    m.q("[data-save]").addEventListener("click", () => {
      const v = D.formData(m.el); f.score = [+v.h || 0, +v.a || 0];
      if (!isResult) { X.fixtures.splice(X.fixtures.indexOf(f), 1); X.results.unshift(f); }
      m.close(); D.toast("Result saved: " + f.score.join(" – ") + ".", "trophy"); done();
    });
  }
  function matches(v, ctx) {
    let type = "all", tab = "upcoming", q = "";
    v.innerHTML = head("Match Management", "Fixtures and results. Mark each one as a Match or a Tournament game.", `<button class="btn btn-y" data-add>${icon("plus")}Add fixture</button>`) +
      `<div class="grid g-4" id="mk"></div><div class="flex between wrap mt-24" style="gap:12px;margin-bottom:14px">${D.seg("tab", [["upcoming", "Upcoming"], ["results", "Results"]], "upcoming", true)}${D.seg("type", [["all", "All"], ["Match", "Matches"], ["Tournament", "Tournament"]], "all")}</div><div id="fl"></div>`;
    function draw() {
      const W = X.results.filter(r => S.resultOf(r) === "W").length, Dr = X.results.filter(r => S.resultOf(r) === "D").length, L = X.results.length - W - Dr;
      $("#mk", v).innerHTML = kpi("calendar-event", X.fixtures.length, "Upcoming fixtures") + kpi("trophy", `${W}<small class="muted" style="font-size:13px"> W · ${Dr} D · ${L} L</small>`, "Season record") + kpi("ball-football", X.results.reduce((s, r) => s + (r.home ? r.score[0] : r.score[1]), 0), "Goals scored") + kpi("shield-check", X.results.filter(r => (r.home ? r.score[1] : r.score[0]) === 0).length, "Clean sheets");
      const src = tab === "upcoming" ? X.fixtures.slice().sort((a, b) => a.date.localeCompare(b.date)) : X.results;
      const list = src.filter(f => (type === "all" || f.type === type) && (!q || (f.opp.name + f.comp + f.venue).toLowerCase().includes(q)));
      $("#fl", v).innerHTML = list.length ? list.map(f => fixtureRow(f, tab === "results")).join("") : `<div class="card">${D.empty("calendar-event", tab === "upcoming" ? "No upcoming fixtures. Add one above." : "No results yet.")}</div>`;
    }
    D.onPick(v, "seg", (g, val) => { if (g === "tab") tab = val; if (g === "type") type = val; draw(); });
    ctx.onSearch = s => { q = s; draw(); };
    v.addEventListener("click", e => {
      const el = e.target.closest("[data-add],[data-edit],[data-score],[data-res],[data-del]"); if (!el) return;
      if (el.hasAttribute("data-add")) return editFixture(null, draw);
      const id = el.dataset.edit || el.dataset.score || el.dataset.res || el.dataset.del;
      const inRes = X.results.some(r => r.id === id), list = inRes ? X.results : X.fixtures, f = list.find(x => x.id === id);
      if (el.hasAttribute("data-edit")) editFixture(f, draw);
      else if (el.hasAttribute("data-score")) enterScore(f, draw, false);
      else if (el.hasAttribute("data-res")) enterScore(f, draw, true);
      else D.confirmBox("Delete this fixture?", (f.home ? "The Hawk vs " : "") + f.opp.name + (f.home ? "" : " vs The Hawk") + " on " + fmtDate(f.date) + ".", "Delete", () => { list.splice(list.indexOf(f), 1); D.toast("Fixture deleted.", "circle-check"); draw(); });
    });
    draw();
  }

  /* =====================================================================
     5. Tournament Management (create + share)
     ===================================================================== */
  let justCreated = null;
  function qrSvg(text) {
    if (typeof window.qrcode !== "function") return "";
    const q = window.qrcode(0, "M"); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }
  function shareTournament(t) {
    const url = REG_BASE + t.slug;
    const m = D.modal({
      title: "Share registration · " + t.name,
      body: `<div class="share"><div class="qr">${qrSvg(url)}</div><div><p class="muted" style="margin-bottom:12px">Teams register with this link. Print the QR code on posters and social posts.</p>
        <div class="linkbox"><code>${esc(url)}</code><button class="btn btn-g btn-sm" data-copy>${icon("copy")}Copy</button></div>
        <div class="flex wrap mt-16" style="gap:8px"><button class="btn btn-g btn-sm" data-dl>${icon("download")}Download QR</button><button class="btn btn-g btn-sm" data-wa>${icon("send")}Share to WhatsApp</button></div></div></div>`,
      foot: `<button class="btn btn-y" data-x>Done</button>`
    });
    m.el.addEventListener("click", e => {
      if (e.target.closest("[data-copy]")) { (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => D.toast("Link copied.", "circle-check"), () => D.toast("Copy: " + url, "file-text")); }
      if (e.target.closest("[data-dl]")) D.toast("QR code downloaded (preview).", "circle-check");
      if (e.target.closest("[data-wa]")) D.toast("WhatsApp share opened (preview).", "send");
    });
  }
  function entries(t) {
    const names = ["Penang United", "Bukit Mertajam FA", "Kepala Batas Jr", "Juru Rangers", "Batu Kawan FC", "Prai Lions", "Nibong Tebal SC", "Seberang Stars", "Butterworth City", "Permatang Pauh FA", "Bayan Lepas Jr", "Air Itam Eagles", "Sungai Ara FC", "Tasek Gelugor", "Simpang Ampat", "Bagan Ajam", "Jawi Juniors", "Valdor FC", "Bertam Rovers", "Kubang Semang", "Bukit Tambun", "Machang Bubok", "Pinang Tunggal", "Tanjung Bungah"];
    const rows = names.slice(0, t.teams).map((n, i) => ({ n, cat: t.cats[i % t.cats.length], mgr: ["Encik Azman", "Mr Lim", "Puan Rohana", "Mr Kumar", "Encik Faizal"][i % 5], players: 10 + (i * 7) % 6, paid: i % 5 !== 3 }));
    D.modal({
      title: t.name + " · " + t.teams + " teams", size: "lg",
      body: D.table([
        { label: "#", render: (r, i) => `<b class="muted">${pad(i + 1)}</b>` }, { label: "Team", render: r => `<b>${esc(r.n)}</b>` }, { label: "Cat.", render: r => `<span class="cat">${esc(r.cat)}</span>` },
        { label: "Team manager", render: r => esc(r.mgr) }, { label: "Players", cls: "num", render: r => r.players }, { label: "Fee", render: r => D.tag(r.paid ? "Paid" : "Unpaid", r.paid ? "t-ok" : "t-warn") }
      ], rows, "No teams registered yet."),
      foot: `<button class="btn btn-g" data-x>Close</button><button class="btn btn-y" onclick="Dash.toast('Team list PDF downloaded (preview).','memo')">${icon("download")}Print team list</button>`
    });
  }
  function tournamentForm(v, t) {
    const isNew = !t;
    t = t || { name: "", start: "2026-12-19", end: "2026-12-20", venue: "Padang Bandar Perda", cats: ["U10", "U12"], fee: 100, maxTeams: 16, teams: 0, deadline: "2026-12-10", status: "Open", desc: "", host: true };
    v.innerHTML = head(isNew ? "Create tournament" : "Edit tournament", "Fill in the details. A registration link and QR code are created when you publish.", "", "#tournaments") +
      `<div class="form-split"><form class="grid" id="tf" novalidate>
        <div class="card"><div class="sec-t">${gi("trophy", 36)}Details</div><div class="grid-f">
          ${D.field({ name: "name", label: "Tournament name", value: t.name, full: true, required: true, placeholder: "e.g. Hawk Junior Cup 2027" })}
          ${D.field({ name: "start", label: "Start date", type: "date", value: t.start })}${D.field({ name: "end", label: "End date", type: "date", value: t.end })}
          ${D.field({ name: "venue", label: "Venue", value: t.venue, full: true })}
          ${D.field({ name: "desc", label: "Description (shown on the registration page)", type: "textarea", value: t.desc || "", full: true, placeholder: "Format, rules, prizes, contact person…" })}</div></div>
        <div class="card"><div class="sec-t">${gi("shirt-sport", 36)}Age groups</div>${mchips("cats", CATS, t.cats)}</div>
        <div class="card"><div class="sec-t">${gi("ticket", 36)}Registration</div><div class="grid-f">
          ${D.field({ name: "fee", label: "Entry fee per team (RM)", type: "number", value: t.fee, attrs: 'min="0" step="5"' })}${D.field({ name: "maxTeams", label: "Maximum teams", type: "number", value: t.maxTeams, attrs: 'min="2" max="64"' })}
          ${D.field({ name: "deadline", label: "Registration closes", type: "date", value: t.deadline })}
          <div class="fld"><span>Registration</span><label class="toggle" style="height:42px"><input type="checkbox" name="open"${t.status !== "Closed" ? " checked" : ""}><i></i>Open for sign-ups</label></div></div></div>
        <div class="flex" style="justify-content:flex-end;gap:10px"><a class="btn btn-g" href="#tournaments">Cancel</a><button class="btn btn-y" type="submit">${icon(isNew ? "send" : "check")}${isNew ? "Publish tournament" : "Save changes"}</button></div>
      </form>
      <div class="sticky"><p class="muted" style="font-size:12px;margin-bottom:10px">PREVIEW</p><div id="pv"></div></div></div>`;
    const form = $("#tf", v);
    const read = () => { const f = D.formData(form); return Object.assign({}, t, { name: f.name || "Untitled tournament", start: f.start, end: f.end, venue: f.venue, desc: f.desc, cats: checked(form, "cats"), fee: +f.fee || 0, maxTeams: +f.maxTeams || 0, deadline: f.deadline, status: f.open ? "Open" : "Closed", slug: t.slug || slugify(f.name) }); };
    const preview = () => { $("#pv", v).innerHTML = tcard(read(), true); };
    form.addEventListener("input", preview); form.addEventListener("change", preview); preview();
    form.addEventListener("submit", e => {
      e.preventDefault();
      const n = read();
      if (!D.formData(form).name) { $("[name=name]", form).focus(); D.toast("Give the tournament a name.", "bell-ringing"); return; }
      if (!n.cats.length) { D.toast("Pick at least one age group.", "bell-ringing"); return; }
      if (n.end < n.start) { $("[name=end]", form).focus(); D.toast("End date is before the start date.", "bell-ringing"); return; }
      if (isNew) { n.id = uid("T"); n.slug = slugify(n.name); X.tournaments.unshift(n); justCreated = n.id; }
      else Object.assign(t, n);
      D.toast(isNew ? "Tournament published." : "Tournament saved.", "trophy"); location.hash = "#tournaments";
    });
  }
  function tcard(t, preview) {
    const full = t.teams >= t.maxTeams, st = t.status === "Open" && full ? "Full" : t.status;
    return `<div class="card tcard"><div class="tcard-top">${gi("trophy", 48)}${statusTag(st)}<h3>${esc(t.name)}</h3><p>${icon("cal")}${fmtDate(t.start)}${t.end && t.end !== t.start ? " – " + fmtDate(t.end) : ""}</p><p>${icon("pin")}${esc(t.venue)}</p></div>
      <div class="tcard-b"><div class="chips">${t.cats.map(c => `<span class="chip">${esc(c)}</span>`).join("")}</div>
        <div class="prog"><span>Teams</span>${D.bar(t.teams, t.maxTeams || 1)}<b>${t.teams}/${t.maxTeams}</b></div>
        <div class="kv"><div><span>Fee</span><b>RM ${t.fee}</b></div><div><span>Closes</span><b>${fmtDate(t.deadline).slice(0, 6)}</b></div><div><span>Revenue</span><b>RM ${t.fee * t.teams}</b></div></div></div>
      ${preview ? `<div class="tcard-f"><span class="muted" style="font-size:12px">${esc(REG_BASE + (t.slug || "…"))}</span></div>` : `<div class="tcard-f"><button class="btn btn-y btn-sm" data-share="${t.id}">${icon("qr")}Share</button><button class="btn btn-g btn-sm" data-entries="${t.id}">${icon("users")}Entries</button><a class="btn btn-g btn-sm" href="#tournaments/${t.id}">${icon("edit")}Edit</a><button class="btn btn-g btn-sm" data-toggle="${t.id}">${icon(t.status === "Open" ? "lock" : "check")}${t.status === "Open" ? "Close" : "Reopen"}</button></div>`}</div>`;
  }
  function tournaments(v, ctx) {
    if (ctx.param === "new") return tournamentForm(v, null);
    if (ctx.param) { const t = X.tournaments.find(x => x.id === ctx.param); if (t) return tournamentForm(v, t); }
    let q = "";
    const open = X.tournaments.filter(t => t.status === "Open");
    v.innerHTML = head("Tournament Management", "Tournaments hosted by THE HAWK, with online team registration.", `<a class="btn btn-y" href="#tournaments/new">${icon("plus")}Create tournament</a>`) +
      `<div class="grid g-4">${kpi("trophy", X.tournaments.length, "Tournaments")}${kpi("ticket", open.length, "Open for registration")}${kpi("shield-check", X.tournaments.reduce((s, t) => s + t.teams, 0), "Teams registered")}${kpi("chart-bar", "RM " + X.tournaments.reduce((s, t) => s + t.teams * t.fee, 0).toLocaleString(), "Entry fees")}</div><div class="tgrid mt-24" id="tg"></div>`;
    function draw() {
      const list = X.tournaments.filter(t => !q || t.name.toLowerCase().includes(q));
      $("#tg", v).innerHTML = list.length ? list.map(t => tcard(t)).join("") : `<div class="card">${D.empty("trophy", "No tournaments yet.")}</div>`;
    }
    ctx.onSearch = s => { q = s; draw(); };
    v.addEventListener("click", e => {
      const el = e.target.closest("[data-share],[data-entries],[data-toggle]"); if (!el) return;
      const t = X.tournaments.find(x => x.id === (el.dataset.share || el.dataset.entries || el.dataset.toggle));
      if (el.hasAttribute("data-share")) shareTournament(t);
      else if (el.hasAttribute("data-entries")) entries(t);
      else { t.status = t.status === "Open" ? "Closed" : "Open"; D.toast("Registration " + (t.status === "Open" ? "reopened." : "closed."), "circle-check"); draw(); }
    });
    draw();
    if (justCreated) { const t = X.tournaments.find(x => x.id === justCreated); justCreated = null; if (t) setTimeout(() => shareTournament(t), 250); }
  }

  /* =====================================================================
     6. Achievements Management
     ===================================================================== */
  const AWARDS = [["cup", "trophy", "Trophy"], ["medal", "medal-2", "Medal"], ["shield", "award", "Award"], ["gold", "crown", "Gold"], ["star", "star", "Special"]];
  const awardIco = k => (AWARDS.find(a => a[0] === k) || AWARDS[0])[1];
  function editAchievement(a, done) {
    const isNew = !a;
    a = a || { title: "Champions", comp: "", place: "", date: "", year: "2026", kind: "cup", cat: "U12" };
    const iso = a.iso || (() => { const d = new Date(a.date); return isNaN(d) ? "" : d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); })();
    const m = D.modal({
      title: isNew ? "Add achievement" : "Edit achievement",
      body: `<div class="fld" style="margin-bottom:18px"><span>Award type</span><div class="ipick" role="radiogroup">${AWARDS.map(([k, ico, l]) => `<label><input type="radio" name="kind" value="${k}"${a.kind === k ? " checked" : ""}><span>${gi(ico, 40)}${l}</span></label>`).join("")}</div></div>
        <form class="grid-f">${D.field({ name: "title", label: "Title", type: "select", options: ["Champions", "Runners-up", "Third place", "Fair Play Award", "Best Player", "Top Scorer", "Best Goalkeeper"], value: a.title })}${D.field({ name: "cat", label: "Age group", type: "select", options: CATS.concat(["All"]), value: a.cat })}
        ${D.field({ name: "comp", label: "Competition", value: a.comp, full: true, required: true, placeholder: "e.g. Piala Remaja Pulau Pinang U12" })}
        ${D.field({ name: "place", label: "Location", value: a.place })}${D.field({ name: "date", label: "Date", type: "date", value: iso })}</form>`,
      foot: `<button class="btn btn-g" data-x>Cancel</button><button class="btn btn-y" data-save>${icon("check")}${isNew ? "Add" : "Save"}</button>`
    });
    m.q("[data-save]").addEventListener("click", () => {
      const f = D.formData(m.el), kind = (m.q("input[name=kind]:checked") || {}).value || "cup";
      if (!f.comp) { m.q("[name=comp]").focus(); return; }
      const d = f.date ? new Date(f.date + "T00:00:00") : null;
      Object.assign(a, { title: f.title, cat: f.cat, comp: f.comp, place: f.place, kind, iso: f.date, date: d ? pad(d.getDate()) + " " + D.MONTHS[d.getMonth()] + " " + d.getFullYear() : "", year: d ? String(d.getFullYear()) : a.year });
      if (isNew) { a.id = uid("A"); X.achievements.unshift(a); }
      m.close(); D.toast(isNew ? "Achievement added to the Hall of Fame." : "Achievement saved.", awardIco(kind)); done();
    });
  }
  function achievements(v, ctx) {
    let year = "all", q = "";
    const years = [...new Set(X.achievements.map(a => a.year))].sort().reverse();
    v.innerHTML = head("Achievements Management", "Trophies and awards shown in the website's Hall of Fame.", `<button class="btn btn-y" data-add>${icon("plus")}Add achievement</button>`) +
      `<div class="grid g-4">${kpi("trophy", X.achievements.filter(a => a.kind === "cup").length, "Trophies")}${kpi("medal-2", X.achievements.filter(a => a.kind === "medal").length, "Medals")}${kpi("award", X.achievements.filter(a => a.kind === "shield" || a.kind === "star").length, "Awards")}${kpi("calendar-event", years.length, "Seasons")}</div>
      <div class="flex mt-24" style="margin-bottom:14px">${D.chips("year", [["all", "All years"]].concat(years.map(y => [y, y])), "all")}</div><div class="agrid" id="ag"></div>`;
    function draw() {
      const list = X.achievements.filter(a => (year === "all" || a.year === year) && (!q || (a.title + a.comp + a.place).toLowerCase().includes(q)));
      $("#ag", v).innerHTML = list.length ? list.map(a => `<div class="card acard"><span class="yr">${esc(a.year)}</span>${gi(awardIco(a.kind), 62)}<h3>${esc(a.title)}</h3><p>${esc(a.comp)}</p>
        <div class="m"><span>${icon("pin")}${esc(a.place || "—")}</span><span>${icon("cal")}${esc(a.date || "—")}</span><span class="cat">${esc(a.cat)}</span></div>
        ${acts(ib(`data-edit="${a.id}"`, "edit", "Edit", true), ib(`data-del="${a.id}"`, "trash", "Delete"))}</div>`).join("") : `<div class="card">${D.empty("trophy", "No achievements for this year.")}</div>`;
    }
    D.onPick(v, "chips", (g, val) => { year = val; draw(); });
    ctx.onSearch = s => { q = s; draw(); };
    v.addEventListener("click", e => {
      if (e.target.closest("[data-add]")) return editAchievement(null, draw);
      const el = e.target.closest("[data-edit],[data-del]"); if (!el) return;
      const a = X.achievements.find(x => x.id === (el.dataset.edit || el.dataset.del));
      if (el.hasAttribute("data-edit")) editAchievement(a, draw);
      else D.confirmBox("Delete this achievement?", a.title + " · " + a.comp, "Delete", () => { X.achievements.splice(X.achievements.indexOf(a), 1); D.toast("Achievement deleted.", "circle-check"); draw(); });
    });
    draw();
  }

  /* =====================================================================
     7. Gallery Management
     ===================================================================== */
  const TAGS = ["Matchday", "Training", "Coaching", "Tournament", "Events", "GK"];
  const gsrc = g => g.src || D.IMG + g.img;
  function uploadModal(files, done) {
    const urls = files.map(f => URL.createObjectURL(f));
    const m = D.modal({
      title: "Upload " + files.length + " photo" + (files.length > 1 ? "s" : ""),
      body: `<div class="up-prev">${urls.map(u => `<img src="${u}" alt="">`).join("")}</div><form class="grid-f">${D.field({ name: "cap", label: "Caption", placeholder: "e.g. Matchday walk-out", full: true })}${D.field({ name: "tag", label: "Album", type: "select", options: TAGS })}${D.field({ name: "cat", label: "Age group", type: "select", options: ["All"].concat(CATS) })}</form>
        <p class="muted mt-16" style="font-size:12px">Photos are resized and compressed automatically before they go on the website.</p>`,
      foot: `<button class="btn btn-g" data-x>Cancel</button><button class="btn btn-y" data-save>${icon("upload")}Upload</button>`,
      onClose: () => {}
    });
    m.q("[data-save]").addEventListener("click", () => {
      const f = D.formData(m.el);
      urls.forEach((u, i) => X.gallery.unshift({ src: u, cap: f.cap || files[i].name.replace(/\.[^.]+$/, ""), tag: f.tag }));
      m.close(); D.toast(files.length + " photo" + (files.length > 1 ? "s" : "") + " added to the gallery.", "camera"); done();
    });
  }
  function gallery(v, ctx) {
    let tag = "all", q = "";
    v.innerHTML = head("Gallery Management", "Photos shown in the website gallery.") +
      `<label class="drop-z" id="dz" tabindex="-1">${gi("camera", 48)}<b>Drop photos here or click to upload</b><span>JPG, PNG or WebP · up to 20 at a time</span><input type="file" accept="image/*" multiple id="fi"></label>
      <div class="flex between wrap mt-24" style="gap:12px;margin-bottom:14px">${D.chips("tag", [["all", "All"]].concat(TAGS.map(t => [t, t])), "all")}<p class="muted" id="gc"></p></div><div class="gal" id="gg"></div>`;
    function draw() {
      const list = X.gallery.filter(g => (tag === "all" || g.tag === tag) && (!q || g.cap.toLowerCase().includes(q)));
      $("#gc", v).textContent = list.length + " photo" + (list.length === 1 ? "" : "s");
      $("#gg", v).innerHTML = list.length ? list.map(g => { const i = X.gallery.indexOf(g); return `<figure><img src="${esc(gsrc(g))}" alt="${esc(g.cap)}" loading="lazy"><span class="tagc">${esc(g.tag)}</span><span class="gx">${ib(`data-cap="${i}"`, "edit", "Edit caption", true)}${ib(`data-del="${i}"`, "trash", "Delete photo")}</span><figcaption>${esc(g.cap)}</figcaption></figure>`; }).join("") : D.empty("photo", "No photos in this album yet.");
    }
    const dz = $("#dz", v), fi = $("#fi", v);
    const take = list => { const files = Array.from(list || []).filter(f => /^image\//.test(f.type)).slice(0, 20); if (files.length) uploadModal(files, draw); else D.toast("Only image files can be uploaded.", "bell-ringing"); };
    fi.addEventListener("change", () => { take(fi.files); fi.value = ""; });
    ["dragenter", "dragover"].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.add("is-over"); }));
    ["dragleave", "drop"].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.remove("is-over"); }));
    dz.addEventListener("drop", e => take(e.dataTransfer && e.dataTransfer.files));
    D.onPick(v, "chips", (g, val) => { tag = val; draw(); });
    ctx.onSearch = s => { q = s; draw(); };
    v.addEventListener("click", e => {
      const el = e.target.closest("[data-cap],[data-del]"); if (!el) return;
      const g = X.gallery[+(el.dataset.cap || el.dataset.del)];
      if (el.hasAttribute("data-del")) return D.confirmBox("Delete this photo?", g.cap, "Delete", () => { X.gallery.splice(X.gallery.indexOf(g), 1); D.toast("Photo deleted.", "circle-check"); draw(); });
      const m = D.modal({ title: "Edit photo", body: `<img src="${esc(gsrc(g))}" alt="" style="width:100%;max-height:260px;object-fit:cover;border-radius:14px;margin-bottom:16px"><form class="grid-f">${D.field({ name: "cap", label: "Caption", value: g.cap, full: true })}${D.field({ name: "tag", label: "Album", type: "select", options: TAGS, value: g.tag })}</form>`, foot: `<button class="btn btn-g" data-x>Cancel</button><button class="btn btn-y" data-save>${icon("check")}Save</button>` });
      m.q("[data-save]").addEventListener("click", () => { const f = D.formData(m.el); g.cap = f.cap || g.cap; g.tag = f.tag; m.close(); D.toast("Photo updated.", "circle-check"); draw(); });
    });
    draw();
  }

  /* =====================================================================
     8. Attendance
     ===================================================================== */
  function attendance(v, ctx) {
    const cats = S.CATS.filter(c => X.players.some(p => p.cat === c));
    if (!ctx.param) {
      const rateOf = list => { const a = list.map(p => S.attendanceOf(p.id)).filter(x => x.n); return a.length ? a.reduce((s, x) => s + x.rate, 0) / a.length : 0; };
      const low = X.players.map(p => ({ p, a: S.attendanceOf(p.id) })).sort((a, b) => a.a.rate - b.a.rate).slice(0, 5);
      v.innerHTML = head("Attendance", "Select an age group to see every session and player.", `<button class="btn btn-g" data-export>${icon("download")}Export</button>`) +
        D.selGrid([D.selCard({ href: "#attendance/all", html: D.ring(rateOf(X.players), 96, 7), label: "All age groups", sub: X.players.length + " players" })].concat(cats.map(c => { const l = X.players.filter(p => p.cat === c); return D.selCard({ href: "#attendance/" + c, html: D.ring(rateOf(l), 96, 7), label: S.catName(c), sub: l.length + " players" }); }))) +
        `<div class="sec-title"><h2>Needs a check-in</h2><p>Lowest attendance this season</p></div><div class="card">${low.map((x, i) => `<button type="button" class="lead" data-p="${x.p.id}"><span class="pos">${i + 1}</span>${avatar(x.p, 40)}<span><b style="font-size:14px;font-weight:500">${esc(x.p.name)}</b><br><small class="muted">${x.a.A} absent · ${x.a.L} late · ${esc(x.p.cat)}</small></span><span class="v" style="color:${x.a.rate < 80 ? "#c4283c" : "inherit"}">${Math.round(x.a.rate)}%</span></button>`).join("")}</div>`;
      v.addEventListener("click", e => { const r = e.target.closest("[data-p]"); if (r) openAttendance(r.dataset.p); if (e.target.closest("[data-export]")) D.toast("Attendance report exported (preview).", "file-text"); });
      return;
    }
    let cat = ctx.param, q = "";
    // last 10 sessions that had players on the register
    const recent = X.sessions.filter(s => Object.keys(X.attendance[s.id] || {}).length).slice(-10);
    const sessRate = s => { const r = Object.values(X.attendance[s.id] || {}); return r.length ? r.filter(x => x !== "A").length / r.length * 100 : 0; };
    const all0 = X.players.map(p => ({ p, a: S.attendanceOf(p.id) }));
    const all = all0.filter(x => cat === "all" || x.p.cat === cat);
    const avg = all.length ? all.reduce((s, x) => s + x.a.rate, 0) / all.length : 0;
    v.innerHTML = head(cat === "all" ? "All age groups" : S.catName(cat), "Training attendance. Select a player for their full record.", `<button class="btn btn-g" data-export>${icon("download")}Export</button>`, "#attendance") +
      `<div class="grid g-4">${kpi("calendar-event", X.sessions.length, "Sessions this season")}${kpi("circle-check", Math.round(avg) + "%", "Average attendance")}${kpi("award", all.filter(x => x.a.A === 0).length, "No absences")}${kpi("bell-ringing", all.filter(x => x.a.rate < 80).length, "Below 80%")}</div>
      <div class="grid g-main mt-24"><div class="card"><div class="card-h"><h3>Attendance per session</h3><p>Last 10 sessions</p></div><div class="bchart">${recent.map(s => { const r = Math.round(sessRate(s)); return `<div title="${esc(s.title)}"><b>${r}%</b><i style="height:${Math.max(6, r * 1.3)}px"></i><span>${dmy(s.date).d}/${new Date(s.date).getMonth() + 1}</span></div>`; }).join("")}</div></div>
        <div class="card"><div class="card-h"><h3>Needs a check-in</h3><p>Lowest attendance</p></div>${all.slice().sort((a, b) => a.a.rate - b.a.rate).slice(0, 4).map((x, i) => `<button type="button" class="lead" data-p="${x.p.id}" style="width:100%;text-align:left"><span class="pos">${i + 1}</span>${avatar(x.p, 34)}<span><b style="font-size:13.5px">${esc(x.p.name)}</b><br><small class="muted">${x.a.A} absent · ${x.a.L} late</small></span><span class="v" style="color:${x.a.rate < 80 ? "#c4283c" : "inherit"}">${Math.round(x.a.rate)}%</span></button>`).join("")}</div></div>
      <div class="card mt-24"><div class="card-h wrap"><h3>Players × sessions</h3><div class="legend"><span><i style="background:#2fb36a"></i>Present</span><span><i style="background:#f0a020"></i>Late</span><span><i style="background:#e5484d"></i>Absent</span><span><i style="background:#eef1f8;box-shadow:inset 0 0 0 1px #d9deeb"></i>Not in session</span></div></div><div id="hm"></div></div>`;
    function draw() {
      const list = all.filter(x => !q || x.p.name.toLowerCase().includes(q));
      $("#hm", v).innerHTML = list.length ? `<div class="tbl-wrap"><table class="tbl hm"><thead><tr><th>Player</th>${recent.map(s => `<th title="${esc(s.title)}">${dmy(s.date).d}<small>${D.MONTHS[new Date(s.date).getMonth()]}</small></th>`).join("")}<th class="num">Season</th></tr></thead><tbody>${list.map(x => `<tr data-p="${x.p.id}" tabindex="0"><td><span class="who" style="min-width:160px">${avatar(x.p, 32)}<b>${esc(x.p.name)}</b></span></td>${recent.map(s => { const m = (X.attendance[s.id] || {})[x.p.id] || "N"; return `<td><span class="heat ${m}" title="${{ P: "Present", L: "Late", A: "Absent", N: "Not in session" }[m]}"></span></td>`; }).join("")}<td class="num"><b>${Math.round(x.a.rate)}%</b></td></tr>`).join("")}</tbody></table></div>` : D.empty("calendar-event", "No players match.");
    }
    const open = openAttendance;
    ctx.onSearch = s => { q = s; draw(); };
    v.addEventListener("click", e => { const r = e.target.closest("[data-p]"); if (r) open(r.dataset.p); if (e.target.closest("[data-export]")) D.toast("Attendance report exported (preview).", "file-text"); });
    v.addEventListener("keydown", e => { const r = e.target.closest("tr[data-p]"); if (r && e.key === "Enter") open(r.dataset.p); });
    draw();
  }

  function openAttendance(id) { const p = X.players.find(x => x.id === id); const m = D.modal({ title: p.name + " · attendance", size: "lg", body: '<div id="ar"></div>' }); S.attendanceReport($("#ar", m.el), p, {}); }

  /* =====================================================================
     9. Player Evaluation (review coach reports)
     ===================================================================== */
  function reviewEval(ev, done) {
    const p = X.players.find(x => x.id === ev.player);
    const m = D.modal({
      title: "Review · " + p.name + " · " + ev.label, size: "lg",
      body: `<div class="prof" style="margin-bottom:20px">${avatar(p, 60, "ring")}<div><h2>${esc(p.name)}</h2><p>${esc(p.pos)} · ${esc(p.cat)} · by ${esc(ev.coach)}</p></div><div class="facts"><div><span>Overall</span><b style="color:var(--blue)">${ev.overall.toFixed(1)}</b></div><div><span>Status</span>${statusTag(ev.status)}</div></div></div>
        ${D.evalRows(p, ev.scores, false)}
        <div class="card mt-24" style="background:var(--soft)"><div class="flex" style="align-items:flex-start;gap:14px">${gi("file-text", 36)}<div><b style="font-size:13px">Coach's comment</b><p style="margin-top:4px;color:var(--text-2);line-height:1.6">${esc(ev.comment)}</p></div></div></div>
        <div class="mt-16">${D.field({ name: "note", label: "Note to the coach (needed if you return the report)", type: "textarea", placeholder: "e.g. Please add more detail on positioning." })}</div>`,
      foot: `<button class="btn btn-g" data-x>Close</button><button class="btn btn-d" data-ret>${icon("refresh")}Return to coach</button><button class="btn btn-y" data-ok>${icon("check")}Approve &amp; publish</button>`
    });
    m.q("[data-ok]").addEventListener("click", () => { ev.status = "Approved"; m.close(); D.toast("Approved. " + p.guardian.name + " can now see the report.", "circle-check"); done(); });
    m.q("[data-ret]").addEventListener("click", () => { const n = D.formData(m.el).note; if (!n) { const t = m.q("[name=note]"); t.focus(); t.style.borderColor = "#ff5a6a"; return; } ev.status = "Returned"; ev.note = n; m.close(); D.toast("Returned to " + ev.coach + ".", "send"); done(); });
  }
  function evaluation(v, ctx) {
    let month = "Oct 2026", st = "all", q = "";
    const months = [...new Set(X.evaluations.map(e => e.label))];
    v.innerHTML = head("Player Evaluation", "Coach reports are reviewed here before guardians can see them.") + `<div class="grid g-4" id="ek"></div>
      <div class="flex between wrap mt-24" style="gap:12px;margin-bottom:14px">${D.seg("month", months.map(m => [m, m]).concat([["all", "All"]]), month, true)}${D.chips("st", [["all", "All"], ["Pending review", "Pending review"], ["Approved", "Approved"], ["Returned", "Returned"]], "all")}</div><div class="card"><div id="et"></div></div>`;
    function draw() {
      const inMonth = X.evaluations.filter(e => month === "all" || e.label === month);
      const avg = inMonth.length ? inMonth.reduce((s, e) => s + e.overall, 0) / inMonth.length : 0;
      $("#ek", v).innerHTML = kpi("hourglass-high", X.evaluations.filter(e => e.status === "Pending review").length, "Waiting for review") + kpi("circle-check", inMonth.filter(e => e.status === "Approved").length, "Approved" + (month === "all" ? "" : " · " + month)) + kpi("award", avg.toFixed(1), "Average overall") + kpi("clipboard-check", month === "all" ? "—" : X.players.length - inMonth.length, "Not yet submitted");
      const list = inMonth.filter(e => (st === "all" || e.status === st) && (!q || (X.players.find(p => p.id === e.player) || {}).name.toLowerCase().includes(q))).sort((a, b) => (a.status === "Pending review" ? -1 : 0) - (b.status === "Pending review" ? -1 : 0));
      $("#et", v).innerHTML = D.table([
        { label: "Player", render: e => { const p = X.players.find(x => x.id === e.player); return `<span class="who">${avatar(p, 38)}<span><b>${esc(p.name)}</b><small>${esc(p.pos)} · ${esc(p.cat)}</small></span></span>`; } },
        { label: "Report", render: e => esc(e.label) },
        { label: "Coach", render: e => esc(e.coach) },
        { label: "Overall", render: e => `<span class="score-cell">${D.bar(e.overall, 10)}<b>${e.overall.toFixed(1)}</b></span>` },
        { label: "Submitted", render: e => fmtDate(e.date) },
        { label: "Status", render: e => statusTag(e.status) },
        { label: "", cls: "num", render: e => `<button class="btn ${e.status === "Pending review" ? "btn-y" : "btn-g"} btn-sm" data-rev="${e.id}">${icon(e.status === "Pending review" ? "check" : "eye")}${e.status === "Pending review" ? "Review" : "View"}</button>` }
      ], list, "No reports match.");
    }
    D.onPick(v, "seg", (g, val) => { month = val; draw(); });
    D.onPick(v, "chips", (g, val) => { st = val; draw(); });
    ctx.onSearch = s => { q = s; draw(); };
    v.addEventListener("click", e => { const b = e.target.closest("[data-rev]"); if (b) reviewEval(X.evaluations.find(x => x.id === b.dataset.rev), draw); });
    draw();
  }

  /* =====================================================================
     10. Player Performance
     ===================================================================== */
  function performance(v, ctx) {
    const one = ctx.param && X.players.find(p => p.id === ctx.param);
    if (one) return S.playerStats(v, one, { head: head(one.name, one.pos + " · " + one.cat + " · #" + one.num, "", "#performance") });
    let sort = "rating", q = "";
    const tot = X.players.map(p => ({ p, s: X.sumStats(X.matchStats[p.id]) }));
    const byCat = {}; tot.forEach(t => { byCat[t.p.cat] = (byCat[t.p.cat] || 0) + t.s.goals; });
    const mx = Math.max(1, ...Object.values(byCat));
    const top = (k) => tot.slice().sort((a, b) => b.s[k] - a.s[k]).slice(0, 3);
    const board = (title, ico, k) => `<div class="card"><div class="card-h"><h3>${gi(ico, 34)}${title}</h3></div>${top(k).map((t, i) => `<a class="lead" href="#performance/${t.p.id}"><span class="pos">${i + 1}</span>${avatar(t.p, 34)}<span><b style="font-size:13.5px">${esc(t.p.name)}</b><br><small class="muted">${esc(t.p.cat)}</small></span><span class="v">${t.s[k]}</span></a>`).join("")}</div>`;
    const recent = X.results.slice(0, 3);
    v.innerHTML = head("Player Performance", "Season 2026 across all matches and tournaments.") +
      `<div class="grid g-3">${recent.map(r => `<div class="mt">${`<div class="t">${crest(r.home ? "hawk" : r.opp, 40)}${esc(r.home ? "The Hawk" : r.opp.name)}</div>`}<div class="s"><small>${fmtDate(r.date).slice(0, 6).toUpperCase()}</small>${r.score[0]} – ${r.score[1]}<em>${esc(r.comp)}</em></div><div class="t">${crest(r.home ? r.opp : "hawk", 40)}${esc(r.home ? r.opp.name : "The Hawk")}</div></div>`).join("")}</div>
      <div class="grid g-main mt-24"><div class="card"><div class="card-h"><h3>Goals by age group</h3><p>Season 2026</p></div><div class="bchart">${Object.keys(byCat).sort().map(c => `<div><b>${byCat[c]}</b><i style="height:${Math.max(6, byCat[c] / mx * 140)}px"></i><span>${c}</span></div>`).join("")}</div></div>
        <div class="grid">${board("Top scorers", "trophy", "goals")}</div></div>
      <div class="grid g-2 mt-24">${board("Most assists", "heart-handshake", "assists")}${board("Best match rating", "star", "rating")}</div>
      <div class="card mt-24"><div class="card-h wrap"><h3>Squad table</h3>${D.seg("sort", [["rating", "Rating"], ["goals", "Goals"], ["assists", "Assists"], ["mins", "Minutes"]], "rating", true)}</div><div id="st"></div></div>`;
    function draw() {
      const list = tot.filter(t => !q || t.p.name.toLowerCase().includes(q)).sort((a, b) => b.s[sort] - a.s[sort]);
      $("#st", v).innerHTML = D.table([
        { label: "#", render: (t, i) => `<b class="muted">${pad(i + 1)}</b>` },
        { label: "Player", render: t => `<a class="who" href="#performance/${t.p.id}">${avatar(t.p, 36)}<span><b>${esc(t.p.name)}</b><small>${esc(t.p.posShort || t.p.pos)} · ${esc(t.p.cat)}</small></span></a>` },
        { label: "Apps", cls: "num", render: t => t.s.apps }, { label: "Mins", cls: "num", render: t => t.s.mins },
        { label: "Goals", cls: "num", render: t => t.s.goals }, { label: "Assists", cls: "num", render: t => t.s.assists },
        { label: "Passes", cls: "num", render: t => t.s.passes }, { label: "Duels", cls: "num", render: t => t.s.duels },
        { label: "Rating", cls: "num", render: t => `<b style="color:${t.s.rating >= 7.8 ? "var(--blue-2)" : "inherit"}">${t.s.rating || "—"}</b>` }
      ], list);
    }
    D.onPick(v, "seg", (g, val) => { sort = val; draw(); });
    ctx.onSearch = s => { q = s; draw(); };
    draw();
  }

  /* =====================================================================
     11. Settings
     ===================================================================== */
  const SETTINGS = [["club", "shield-check", "Club profile", "Name, registration no., contact"], ["site", "world", "Website", "Countdown, banner, registrations"], ["admins", "user-shield", "Admin accounts", "Who can manage the club"], ["security", "shield-lock", "Security", "Password and sign-in"], ["notify", "bell-ringing", "Notifications", "What we email you about"]];
  function settings(v, ctx) {
    const cur = SETTINGS.find(x => x[0] === ctx.param);
    if (!cur) {
      v.innerHTML = head("Settings", "Select a setting to change.") + D.selGrid(SETTINGS.map(([id, ico, l, sub]) => D.selCard({ href: "#settings/" + id, ico, label: l, sub })));
      return;
    }
    const C = window.HAWK.club, NM = window.HAWK.nextMatch;
    const admins = settings.admins = settings.admins || [{ name: "Club Admin", email: "admin@thehawk.demo", role: "Super Admin", last: "Today" }, { name: "Siti Aminah", email: "siti.aminah@thehawk.demo", role: "Admin", last: "24 Oct 2026" }];
    // only the selected section is rendered
    const sec = (id, ico, title, body, save) => id !== cur[0] ? "" : `<div class="card set-sec" id="set-${id}">${body}${save ? `<div class="flex mt-24" style="justify-content:flex-end"><button class="btn btn-y" data-save="${id}">${icon("check")}Save changes</button></div>` : ""}</div>`;
    v.innerHTML = head(cur[2], cur[3], "", "#settings") +
      `<div class="narrow"><div class="grid">
      ${sec("club", "shield", "Club profile", `<div class="grid-f">${D.field({ name: "cname", label: "Club name", value: C.full, full: true })}${D.field({ name: "reg", label: "Registration no.", value: "C-PNG-18706" })}${D.field({ name: "est", label: "Established", value: "2017" })}${D.field({ name: "cemail", label: "Contact email", type: "email", value: C.email })}${D.field({ name: "cphone", label: "Phone / WhatsApp", value: "012-448 2391" })}${D.field({ name: "addr", label: "Address", value: C.address, full: true })}${D.field({ name: "maps", label: "Google Maps link", value: C.maps, full: true })}</div>`, true)}
      ${sec("site", "ball-football", "Website", `<div class="grid-f">${D.field({ name: "opp", label: "Next match opponent (hero countdown)", value: NM.opponent })}${D.field({ name: "kick", label: "Kick-off", type: "datetime-local", value: NM.kickoff.slice(0, 16) })}${D.field({ name: "banner", label: "Announcement bar (optional)", value: "", placeholder: "e.g. Registration for 2027 is now open!", full: true })}</div>
        <div class="tg-list mt-16"><label class="toggle"><input type="checkbox" checked><i></i><span>Show player stats publicly<small>Guardians can switch this off for their child.</small></span></label><label class="toggle"><input type="checkbox" checked><i></i><span>Accept new player registrations<small>Shows the "Join The Hawk" form on the website.</small></span></label></div>`, true)}
      ${sec("admins", "key", "Admin accounts", `<div id="adm"></div><div class="flex mt-16" style="justify-content:flex-end"><button class="btn btn-g" data-addadmin>${icon("plus")}Add admin</button></div>`, false)}
      ${sec("security", "lock", "Security", `<div class="grid-f">${D.field({ name: "cur", label: "Current password", type: "password", full: true, attrs: 'autocomplete="current-password"' })}<label class="fld" for="f-npw"><span>New password</span><input class="in" id="f-npw" name="npw" type="password" autocomplete="new-password"><span class="strength" id="pw"><i></i><i></i><i></i><i></i></span><small id="pwt">At least 10 characters with a number and a symbol.</small></label>${D.field({ name: "npw2", label: "Confirm new password", type: "password", attrs: 'autocomplete="new-password"' })}
        ${D.field({ name: "timeout", label: "Sign out after inactivity", type: "select", options: ["15 minutes", "30 minutes", "1 hour", "8 hours"], value: "30 minutes" })}<div class="fld"><span>Two-step sign-in</span><label class="toggle" style="height:42px"><input type="checkbox" checked><i></i>Email code on new devices</label></div></div>`, true)}
      ${sec("notify", "bell", "Notifications", `<div class="tg-list">${[["New player registration", "Email me when a guardian signs a player up.", 1], ["Evaluation submitted", "When a coach submits a report for review.", 1], ["Tournament team registered", "Each new team for hosted tournaments.", 0], ["Attendance below 80%", "Weekly summary of players who need a check-in.", 1]].map(([t, s, on]) => `<label class="toggle"><input type="checkbox"${on ? " checked" : ""}><i></i><span>${t}<small>${s}</small></span></label>`).join("")}</div>`, true)}
      </div></div>`;
    const drawAdmins = () => { if (!$("#adm", v)) return; $("#adm", v).innerHTML = D.table([{ label: "Name", render: a => `<b>${esc(a.name)}</b>` }, { label: "Email", render: a => `<span class="muted">${esc(a.email)}</span>` }, { label: "Role", render: a => D.tag(a.role, a.role === "Super Admin" ? "t-warn" : "t-info") }, { label: "Last sign-in", render: a => esc(a.last) }, { label: "", cls: "num", render: (a, i) => i ? ib(`data-deladmin="${i}"`, "trash", "Remove " + a.name) : '<small class="muted">You</small>' }], admins); };
    drawAdmins();
    const pw = $("#f-npw", v);
    if (pw) pw.addEventListener("input", () => { const s = pw.value; let n = 0; if (s.length >= 10) n++; if (/\d/.test(s)) n++; if (/[^A-Za-z0-9]/.test(s)) n++; if (/[A-Z]/.test(s) && /[a-z]/.test(s)) n++; $("#pw", v).className = "strength" + (s ? " s" + Math.max(1, n) : ""); $("#pwt", v).textContent = s ? ["Too weak", "Weak", "Okay", "Strong", "Very strong"][n] : "At least 10 characters with a number and a symbol."; });
    v.addEventListener("click", e => {
      const s = e.target.closest("[data-save]");
      if (s) {
        if (s.dataset.save === "site") { const f = D.formData($("#set-site", v)); NM.opponent = f.opp; if (f.kick) NM.kickoff = f.kick + ":00+08:00"; }
        if (s.dataset.save === "security") { const f = D.formData($("#set-security", v)); if (f.npw && f.npw !== f.npw2) { D.toast("New passwords don't match.", "bell-ringing"); return; } if (f.npw && !f.cur) { D.toast("Enter your current password.", "bell-ringing"); return; } }
        D.toast({ club: "Club profile saved.", site: "Website settings saved.", security: "Security settings saved.", notify: "Notification settings saved." }[s.dataset.save], "circle-check"); return;
      }
      if (e.target.closest("[data-addadmin]")) {
        const m = D.modal({ title: "Add admin", body: `<form class="grid-f">${D.field({ name: "name", label: "Name", full: true })}${D.field({ name: "email", label: "Email", type: "email", full: true })}${D.field({ name: "role", label: "Role", type: "select", options: ["Admin", "Super Admin"] })}</form>`, foot: `<button class="btn btn-g" data-x>Cancel</button><button class="btn btn-y" data-ok>${icon("send")}Send invite</button>` });
        m.q("[data-ok]").addEventListener("click", () => { const f = D.formData(m.el); if (!f.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { m.q(f.name ? "[name=email]" : "[name=name]").focus(); return; } admins.push({ name: f.name, email: f.email, role: f.role, last: "Invited" }); m.close(); D.toast("Invite sent to " + f.email + ".", "bell-ringing"); drawAdmins(); });
      }
      const d = e.target.closest("[data-deladmin]");
      if (d) { const a = admins[+d.dataset.deladmin]; D.confirmBox("Remove " + a.name + "?", "They lose admin access immediately.", "Remove", () => { admins.splice(+d.dataset.deladmin, 1); drawAdmins(); D.toast(a.name + " removed.", "circle-check"); }); }
    });
  }

  D.start({
    role: "admin", label: "ADMIN", searchHint: "Search players, staff, matches…",
    user: () => ({ name: "Club Admin", sub: "Super Admin", avatar: `<img src="${D.IMG}logo.webp" alt="" width="38" height="38" style="object-fit:contain">` }),
    nav: [
      { group: "Squad" }, { id: "players", label: "Player Management", icon: "users" }, { id: "coaches", label: "Coach Management", icon: "whistle" }, { id: "team", label: "Team Management", icon: "team" },
      { group: "Fixtures" }, { id: "matches", label: "Match Management", icon: "vs" }, { id: "tournaments", label: "Tournament Management", icon: "trophy" },
      { group: "Club" }, { id: "achievements", label: "Achievements Management", icon: "medal" }, { id: "gallery", label: "Gallery Management", icon: "image" },
      { group: "Reports" }, { id: "attendance", label: "Attendance", icon: "calcheck" }, { id: "evaluation", label: "Player Evaluation", icon: "clipboard-check" }, { id: "performance", label: "Player Performance", icon: "trend" },
      { group: "Account" }, { id: "settings", label: "Settings", icon: "gear" }
    ],
    views: { players, coaches, team, matches, tournaments, achievements, gallery, attendance, evaluation, performance, settings }
  });
})();
