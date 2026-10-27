/* THE HAWK portal — view builders shared by more than one role.
   Each renders into a root element and wires its own events. */
(function () {
  "use strict";
  const D = window.Dash, X = window.HAWKX;
  const { esc, pad, fmtDate, icon, gi, avatar, bar, ring, spark, statusTag, tag, kpi, statsCard, evalRows, statRow, crest, selCard, addCard, selGrid, $, $$ } = D;
  const CATS = ["U6", "U7", "U8", "U9", "U10", "U11", "U12"];
  const resultOf = r => { const [h, a] = r.score, us = r.home ? h : a, them = r.home ? a : h; return us > them ? "W" : us < them ? "L" : "D"; };
  const scoreTxt = r => r.score[0] + " – " + r.score[1];
  const resTag = r => { const res = resultOf(r); return `<span class="tag plain ${res === "W" ? "t-ok" : res === "L" ? "t-bad" : "t-mute"}">${res} · ${scoreTxt(r)}</span>`; };
  const catName = c => c === "all" ? "All players" : c === "pending" ? "Awaiting approval" : "Under " + c.slice(1);
  // read-only or editable text row in the Athlantix list style
  const txtRow = (label, value, edit) => `<div class="row txt${edit ? "" : " ro"}">${D.glyph(label)}<label>${esc(label)}</label><b>${value}</b>${edit ? `<button type="button" class="ibtn y" ${edit} aria-label="Edit ${esc(label)}">${icon("edit")}</button>` : ""}</div>`;
  const mask = k => (k || "").replace(/\d{4}$/, "••••");
  const view = (() => { try { return localStorage.getItem("hawk.view") || "grid"; } catch (e) { return "grid"; } })();

  /* ---------- per-player attendance summary ---------- */
  function attendanceOf(pid) {
    const rows = [];
    X.sessions.forEach(s => { const v = (X.attendance[s.id] || {})[pid]; if (v) rows.push({ s, v }); });
    const n = rows.length, P = rows.filter(r => r.v === "P").length, L = rows.filter(r => r.v === "L").length, A = rows.filter(r => r.v === "A").length;
    let streak = 0; for (let i = rows.length - 1; i >= 0 && rows[i].v !== "A"; i--) streak++;
    return { rows, n, P, L, A, rate: n ? (P + L * .5) / n * 100 : 0, streak };
  }

  /* ---------- match list (Athlantix rows) ---------- */
  function matchList(per, p) {
    return `<div class="mlist">${per.map(x => `<div class="mrow">
      <span class="mr-d"><b>${fmtDate(x.r.date).slice(0, 2)}</b><small>${fmtDate(x.r.date).slice(3, 6)}</small></span>
      <span class="mr-o">${crest(x.r.opp, 34)}<span><b>${esc(x.r.opp.name)}</b><small>${esc(x.r.comp)}</small></span></span>
      ${resTag(x.r)}
      ${x.played ? `<span class="mr-s"><b>${x.mins}'</b><small>Mins</small></span><span class="mr-s"><b>${p.key === "gk" ? x.saves : x.goals}</b><small>${p.key === "gk" ? "Saves" : "Goals"}</small></span><span class="mr-s"><b>${x.assists}</b><small>Assists</small></span><span class="mr-r${x.rating >= 8 ? " hi" : ""}">${x.rating}</span>` : `<span class="mr-na">Not in squad</span>`}
    </div>`).join("")}</div>`;
  }

  /* ---------- Player Stats (one player) ---------- */
  function playerStats(root, p, opts) {
    opts = opts || {};
    const ms = X.matchStats[p.id], total = X.sumStats(ms);
    const per = X.results.map((r, i) => Object.assign({ r }, ms[i]));
    const last5 = per.filter(x => x.played).slice(0, 5), lastSum = X.sumStats(last5);
    const squad = X.players.map(pl => X.sumStats(X.matchStats[pl.id] || []));
    const mx = k => Math.max(1, ...squad.map(s => s[k]));
    const series = per.slice().reverse().map(x => x.played ? (p.key === "gk" ? x.saves : x.goals + x.assists) : 0);
    let scope = "season";
    root.innerHTML = `${opts.head || ""}
      <div class="ll-tabs">${D.seg("scope", [["season", "Season 2026"], ["last5", "Last 5 matches"]], "season", true)}</div>
      <div id="llBox">${statsCard(p, total, "Season 2026 stats")}</div>
      <div class="grid g-main mt-24">
        <div class="card"><div class="card-h"><h3>Season numbers</h3><p>Bars compare with the best in the squad</p></div><div class="rows one">
          ${statRow("Appearances", total.apps, X.results.length, total.apps + "/" + X.results.length)}
          ${statRow("Minutes played", total.mins, mx("mins"), total.mins)}
          ${p.key === "gk" ? statRow("Saves", total.saves, mx("saves")) : statRow("Goals", total.goals, mx("goals"))}
          ${statRow("Assists", total.assists, mx("assists"))}
          ${statRow("Total passes", total.passes, mx("passes"), total.passes)}
          ${statRow("Duels won", total.duels, mx("duels"))}
          ${statRow("Average rating", total.rating, 10, total.rating || "—")}
        </div></div>
        <div class="grid">
          <div class="card"><div class="card-h"><h3>Form</h3><p>Last 5 played</p></div>
            <div class="flex wrap" style="gap:8px;margin-bottom:20px">${last5.map(x => { const res = resultOf(x.r); return `<span class="tag plain ${res === "W" ? "t-ok" : res === "L" ? "t-bad" : "t-mute"}" style="width:38px;justify-content:center;height:32px;font-size:13px" title="${esc(x.r.opp.name)} ${scoreTxt(x.r)}">${res}</span>`; }).join("") || '<span class="muted">No matches played yet.</span>'}</div>
            <div class="flex" style="justify-content:space-around">${ring(Math.min(100, lastSum.rating * 10), 104, 7, "Form rating")}${ring(total.apps ? Math.round(total.mins / (total.apps * 90) * 100) : 0, 104, 7, "Minutes share")}</div></div>
          <div class="card"><div class="card-h"><h3>${p.key === "gk" ? "Saves" : "Goal involvements"} per match</h3></div>${spark(series.length > 1 ? series : [0, 0], 96)}</div>
        </div>
      </div>
      <div class="card mt-24"><div class="card-h"><h3>Match by match</h3><p>${per.filter(x => x.played).length} of ${per.length} matches played</p></div>${matchList(per, p)}</div>`;
    D.onPick(root, "seg", (g, v) => {
      if (g !== "scope" || v === scope) return; scope = v;
      const box = $("#llBox", root);
      box.innerHTML = statsCard(p, v === "season" ? total : lastSum, v === "season" ? "Season 2026 stats" : "Last 5 matches");
      D.countUp(box);
    });
  }

  /* ---------- Evaluation report (one player) ---------- */
  const GROUP_ICON = { Technical: "ball-football", Tactical: "target-arrow", Physical: "run", Character: "heart-handshake" };
  function evaluationReport(root, p, opts) {
    opts = opts || {};
    const list = X.evaluations.filter(e => e.player === p.id && (opts.showPending || e.status === "Approved"));
    if (!list.length) { root.innerHTML = (opts.head || "") + `<div class="card">${D.empty("clipboard-check", "No evaluation reports yet.")}</div>`; return; }
    let idx = list.length - 1;
    function draw() {
      const ev = list[idx], prev = list[idx - 1], groups = X.attrsFor(p);
      const gAvg = g => { const a = groups[g].map(k => ev.scores[k]); return a.reduce((s, v) => s + v, 0) / a.length; };
      const diff = prev ? +(ev.overall - prev.overall).toFixed(1) : 0;
      root.innerHTML = `${opts.head || ""}
        <div class="card"><div class="prof">${avatar(p, 72, "ring")}<div><h2>${esc(p.name)}</h2><p>${esc(p.pos)} · ${esc(p.cat)} · #${esc(p.num)}</p></div>
          <div class="facts"><div><span>Report</span><b>${esc(ev.label)}</b></div><div><span>Coach</span><b>${esc(ev.coach)}</b></div><div><span>Overall</span><b style="color:var(--blue)">${ev.overall.toFixed(1)} / 10${prev ? ` <small style="color:${diff >= 0 ? "#17844a" : "#c4283c"}">${diff >= 0 ? "+" : "−"}${Math.abs(diff).toFixed(1)}</small>` : ""}</b></div><div><span>Status</span>${statusTag(ev.status)}</div></div></div></div>
        <div class="flex between wrap mt-24" style="gap:12px"><div class="seg" aria-label="Report month">${list.map((e, i) => `<button type="button" class="${i === idx ? "is-on y" : ""}" data-ev="${i}" aria-pressed="${i === idx}">${esc(e.label)}</button>`).join("")}</div>
          ${opts.actions ? opts.actions(ev) : `<button class="btn btn-g btn-sm" data-print>${icon("download")}Download PDF</button>`}</div>
        <div class="grid g-4 mt-24">${Object.keys(groups).map(g => kpi(GROUP_ICON[g] || "star", gAvg(g).toFixed(1) + `<small> / 10</small>`, g)).join("")}</div>
        <div class="card mt-24"><div class="card-h"><h3>Skill ratings</h3><p>Scored 1–10 by the coach</p></div>${evalRows(p, ev.scores, false)}</div>
        <div class="grid g-2 mt-24">
          <div class="card"><div class="card-h"><h3>Coach's comment</h3></div><div class="flex" style="align-items:flex-start;gap:16px"><span class="kpi-i">${gi("file-text", 48)}</span><p style="line-height:1.7;color:var(--text-2)">${esc(ev.comment)}</p></div></div>
          <div class="card"><div class="card-h"><h3>Progress</h3><p>Overall score per report</p></div>${spark(list.map(e => e.overall), 96)}<div class="flex between muted" style="font-size:12px;margin-top:8px">${list.map(e => `<span>${esc(e.label)}</span>`).join("")}</div></div>
        </div>`;
    }
    draw();
    root.addEventListener("click", e => {
      const b = e.target.closest("[data-ev]"); if (b) { idx = +b.dataset.ev; draw(); return; }
      if (e.target.closest("[data-print]")) D.toast("Report PDF downloaded (preview).", "file-text");
    });
  }

  /* ---------- Attendance report (one player) ---------- */
  function attendanceReport(root, p, opts) {
    opts = opts || {};
    const a = attendanceOf(p.id);
    const months = [[2026, 7], [2026, 8], [2026, 9]];
    let mi = 2;
    const byDate = {}; a.rows.forEach(r => { byDate[r.s.date] = r; });
    const LBL = { P: "Present", L: "Late", A: "Absent" };
    function cal(y, m) {
      const first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate(), lead = (first.getDay() + 6) % 7;
      let h = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => `<div class="dh">${d}</div>`).join("");
      for (let i = 0; i < lead; i++) h += `<div class="d out"></div>`;
      for (let d = 1; d <= days; d++) {
        const iso = y + "-" + pad(m + 1) + "-" + pad(d), r = byDate[iso];
        h += r ? `<div class="d has ${r.v}" title="${esc(r.s.title)} · ${LBL[r.v]}">${d}<i>${r.v}</i></div>` : `<div class="d">${d}</div>`;
      }
      return h;
    }
    function draw() {
      const [y, m] = months[mi];
      const monthRows = a.rows.filter(r => r.s.date.startsWith(y + "-" + pad(m + 1)));
      root.innerHTML = `${opts.head || ""}
        <div class="grid g-4">${kpi("calendar-event", `<span data-count="${a.n}">0</span>`, "Sessions this season")}${kpi("circle-check", `<span data-count="${a.P}">0</span>`, "Present")}${kpi("hourglass-high", `<span data-count="${a.L}">0</span>`, "Late")}${kpi("alert-triangle", `<span data-count="${a.A}">0</span>`, "Absent")}</div>
        <div class="grid g-main mt-24">
          <div class="card"><div class="card-h"><h3>${D.MONTHS[m]} ${y}</h3><div class="flex"><button class="ibtn" data-m="-1" aria-label="Previous month"${mi === 0 ? " disabled" : ""}>${icon("chevL")}</button><button class="ibtn" data-m="1" aria-label="Next month"${mi === months.length - 1 ? " disabled" : ""}>${icon("chevR")}</button></div></div>
            <div class="cal">${cal(y, m)}</div>
            <div class="legend mt-16"><span><i style="background:#2fb36a"></i>Present</span><span><i style="background:#f0a020"></i>Late</span><span><i style="background:#e5484d"></i>Absent</span></div></div>
          <div class="card" style="display:flex;flex-direction:column;align-items:center;gap:20px;justify-content:center">${ring(a.rate, 156, 10, "Attendance rate")}
            <div class="flex" style="gap:30px;text-align:center"><div><b style="font-size:22px">${a.streak}</b><p class="muted" style="font-size:12px">Session streak</p></div><div><b style="font-size:22px">${monthRows.filter(r => r.v !== "A").length}/${monthRows.length}</b><p class="muted" style="font-size:12px">This month</p></div></div></div>
        </div>
        <div class="card mt-24"><div class="card-h"><h3>Session log</h3><p>${D.MONTHS[m]} ${y}</p></div>
          ${monthRows.length ? `<div class="mlist">${monthRows.slice().reverse().map(r => `<div class="mrow s"><span class="mr-d"><b>${pad(new Date(r.s.date + "T00:00:00").getDate())}</b><small>${["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][r.s.wd]}</small></span><span class="mr-o"><span><b>${esc(r.s.title)}</b><small>${esc(r.s.time)} · ${esc(r.s.venue)}</small></span></span><span class="muted" style="font-size:13px">${esc(r.s.coach)}</span>${statusTag(LBL[r.v])}</div>`).join("")}</div>` : D.empty("calendar-event", "No sessions this month.")}</div>`;
      D.animateRings(root); D.countUp(root);
    }
    draw();
    root.addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (!b || b.disabled) return; mi = Math.max(0, Math.min(months.length - 1, mi + +b.dataset.m)); draw(); });
  }

  /* ---------- player picker (stats / evaluation selectors) ---------- */
  function playerPicker(root, opts) {
    let cat = "all", q = "";
    function draw() {
      const list = X.players.filter(p => (cat === "all" || p.cat === cat) && (!q || p.name.toLowerCase().includes(q)));
      if (opts.order) list.sort((a, b) => opts.order(a) - opts.order(b));
      $("#pk", root).innerHTML = list.length ? `<div class="sel-grid">${list.map(p => selCard({ href: opts.href(p), html: avatar(p, 84, "ring"), label: p.name, sub: `${esc(p.pos)} · ${esc(p.cat)} · #${esc(p.num)}`, badge: opts.badge ? opts.badge(p) : "" })).join("")}</div>` : D.empty("shirt-sport", "No players match.");
    }
    const cats = [...new Set(X.players.map(p => p.cat))].sort((a, b) => CATS.indexOf(a) - CATS.indexOf(b));
    root.innerHTML = `${opts.head || ""}<div class="toolbar">${D.chips("cat", [["all", "All"]].concat(cats.map(c => [c, c])), "all")}${opts.tools || ""}</div><div id="pk"></div>`;
    D.onPick(root, "chips", (g, v) => { cat = v; draw(); });
    draw();
    return s => { q = s; draw(); };
  }

  /* ---------- add / edit player (coach + admin) ---------- */
  function editPlayer(p, done, opts) {
    opts = opts || {};
    const isNew = !p;
    p = p || { first: "", last: "", cat: opts.cat && CATS.includes(opts.cat) ? opts.cat : "U10", pos: "Midfielder", num: "", school: "", status: "Pending", foot: "Right", guardian: { name: "", email: "", phone: "", relation: "Father" } };
    const m = D.modal({
      title: isNew ? "Add player" : "Edit " + p.name, size: "lg",
      body: `${isNew ? "" : `<div class="prof" style="margin-bottom:22px">${avatar(p, 64, "ring")}<div><h2>${esc(p.name)}</h2><p>${esc(p.id)} · joined ${esc(p.joined)}</p></div></div>`}
        <form class="grid-f" id="pf">${D.field({ name: "first", label: "First name", value: p.first, required: true })}${D.field({ name: "last", label: "Last name", value: p.last, required: true })}
        ${D.field({ name: "cat", label: "Age group", type: "select", options: CATS, value: p.cat })}${D.field({ name: "pos", label: "Position", type: "select", options: ["Goalkeeper", "Defender", "Midfielder", "Forward"], value: p.pos })}
        ${D.field({ name: "num", label: "Jersey number", type: "number", value: p.num, attrs: 'min="1" max="99"' })}${D.field({ name: "foot", label: "Preferred foot", type: "select", options: ["Right", "Left", "Both"], value: p.foot })}
        ${D.field({ name: "school", label: "School", value: p.school, full: true })}
        ${D.field({ name: "gname", label: "Guardian name", value: p.guardian.name })}${D.field({ name: "grel", label: "Relationship", type: "select", options: ["Father", "Mother", "Guardian"], value: p.guardian.relation || "Father" })}
        ${D.field({ name: "gemail", label: "Guardian email", type: "email", value: p.guardian.email, help: "Used with the player's MyKad to sign in." })}${D.field({ name: "gphone", label: "Guardian phone", value: p.guardian.phone })}
        ${D.field({ name: "status", label: "Status", type: "select", options: ["Active", "Pending", "Inactive"], value: p.status })}${opts.admin ? D.field({ name: "mykad", label: "Player MyKad No.", value: p.mykad || "", placeholder: "YYMMDD-PB-####", help: "Guardian sign-in uses this number." }) + D.field({ name: "dob", label: "Date of birth", type: "date", value: p.dob || "" }) : ""}</form>`,
      foot: `<button class="btn btn-g" data-x>Cancel</button><button class="btn btn-y" data-save>${icon("check")}${isNew ? "Add player" : "Save changes"}</button>`
    });
    m.q("[data-save]").addEventListener("click", () => {
      const f = D.formData(m.el);
      if (!f.first || !f.last) { m.q("[name=first]").focus(); return; }
      Object.assign(p, { first: f.first, last: f.last, name: f.first + " " + f.last, cat: f.cat, pos: f.pos, num: f.num, foot: f.foot, school: f.school, status: f.status });
      p.key = { Goalkeeper: "gk", Defender: "df", Midfielder: "mf", Forward: "fw" }[f.pos];
      p.posShort = { gk: "GK", df: "DEF", mf: "MID", fw: "FWD" }[p.key];
      Object.assign(p.guardian, { name: f.gname, relation: f.grel, email: f.gemail, phone: f.gphone });
      if (opts.admin) Object.assign(p, { mykad: f.mykad, dob: f.dob });
      if (isNew) { Object.assign(p, { id: "PLR-" + f.cat + "-" + String(1 + Math.max(0, ...X.players.filter(x => x.id.startsWith("PLR-" + f.cat + "-")).map(x => +x.id.split("-")[2] || 0))).padStart(3, "0"), img: null, age: +f.cat.slice(1) || 10, joined: "2026-10-26", honours: [0, 0, 0, 0], rings: [[0, "—"], [0, "—"]] }); X.players.push(p); X.matchStats[p.id] = X.results.map(r => ({ match: r.id, played: false })); }
      m.close(); D.toast(isNew ? p.name + " added." : "Changes saved.", "circle-check"); done(p, isNew);
    });
  }

  /* ---------- Player Management (age group -> squad -> profile) ---------- */
  function playerManagement(v, ctx, opts) {
    opts = opts || {};
    const scope = p => !opts.cats || opts.cats.includes(p.cat);
    const mine = () => X.players.filter(scope);
    const param = ctx.param || "";
    if (param.startsWith("p/")) return playerProfile(v, X.players.find(p => p.id === param.slice(2)), opts);
    if (param) return squad(v, ctx, param, opts);
    const list = mine(), pending = list.filter(p => p.status === "Pending");
    const cats = CATS.filter(c => list.some(p => p.cat === c));
    v.innerHTML = D.head("Player Management", "Select an age group to see its players.", `<button class="btn btn-y" data-add>${icon("plus")}Add player</button>`) +
      selGrid([
        selCard({ href: "#players/all", ico: "users-group", label: "All players", sub: list.length + " players" }),
        ...cats.map(c => { const n = list.filter(p => p.cat === c), pn = n.filter(p => p.status === "Pending").length; return selCard({ href: "#players/" + c, ico: "shirt-sport", label: catName(c), sub: `${n.length} player${n.length === 1 ? "" : "s"}`, badge: pn ? tag(pn + " pending", "t-warn") : "" }); }),
        ...(pending.length ? [selCard({ href: "#players/pending", ico: "hourglass-high", label: "Awaiting approval", sub: pending.length + " new sign-up" + (pending.length === 1 ? "" : "s"), cls: "is-on" })] : []),
        addCard("Add player", "data-add")
      ]);
    ctx.onSearch = q => { if (q) { location.hash = "#players/all"; } };
    v.addEventListener("click", e => { if (e.target.closest("[data-add]")) editPlayer(null, p => { location.hash = "#players/p/" + p.id; }, opts); });
  }
  function squad(v, ctx, key, opts) {
    const scope = p => !opts.cats || opts.cats.includes(p.cat);
    let status = "all", q = "", mode = view;
    const base = () => X.players.filter(p => scope(p) && (key === "all" || (key === "pending" ? p.status === "Pending" : p.cat === key)));
    v.innerHTML = D.head(catName(key), base().length + " registered", `<button class="btn btn-y" data-add>${icon("plus")}Add player</button>`, "#players") +
      `<div class="toolbar">${key === "pending" ? "<span></span>" : D.seg("status", [["all", "All"], ["Active", "Active"], ["Pending", "Pending"], ["Inactive", "Inactive"]], "all")}
        <div class="flex" style="gap:6px"><span class="muted" id="cnt" style="font-size:13px;margin-right:10px"></span>${D.seg("mode", [["grid", "Cards"], ["list", "List"]], mode)}</div></div><div id="sq"></div>`;
    function draw() {
      const list = base().filter(p => (status === "all" || p.status === status) && (!q || (p.name + p.id + (p.guardian.name || "")).toLowerCase().includes(q)));
      $("#cnt", v).textContent = list.length + " player" + (list.length === 1 ? "" : "s");
      if (!list.length) { $("#sq", v).innerHTML = `<div class="card">${D.empty("shirt-sport", "No players here yet.")}</div>`; return; }
      $("#sq", v).innerHTML = mode === "grid"
        ? `<div class="pl-grid">${list.map(p => `<a class="pl-card${p.status === "Pending" ? " pending" : ""}" href="#players/p/${p.id}"><span class="num">${p.num ? "#" + esc(p.num) : ""}</span>${avatar(p, 92, "ring")}<b>${esc(p.name)}</b><small>${esc(p.pos)} · ${esc(p.cat)}</small>${statusTag(p.status)}</a>`).join("")}${`<button type="button" class="sel-card add-card" data-add style="min-height:0">${gi("plus", 56)}<b>Add player</b></button>`}</div>`
        : `<div class="card">${D.table([
            { label: "Player", render: p => `<a class="who" href="#players/p/${p.id}">${avatar(p, 42)}<span><b>${esc(p.name)}</b><small>${esc(p.id)}</small></span></a>` },
            { label: "Age group", render: p => `<span class="cat">${esc(p.cat)}</span>` },
            { label: "Position", render: p => esc(p.pos) + (p.num ? ` <small class="muted">#${esc(p.num)}</small>` : "") },
            { label: "Guardian", render: p => `<span style="color:var(--navy)">${esc(p.guardian.name || "—")}</span><br><small class="muted">${esc(p.guardian.email || "")}</small>` },
            { label: "Attendance", render: p => { const a = attendanceOf(p.id); return `<span class="score-cell">${bar(a.rate, 100)}<b>${Math.round(a.rate)}%</b></span>`; } },
            { label: "Status", render: p => statusTag(p.status) },
            { label: "", cls: "num", render: p => `<a class="ibtn y" href="#players/p/${p.id}" aria-label="Open ${esc(p.name)}">${icon("chevR")}</a>` }
          ], list)}</div>`;
    }
    D.onPick(v, "seg", (g, val) => { if (g === "status") status = val; if (g === "mode") { mode = val; try { localStorage.setItem("hawk.view", val); } catch (e) {} } draw(); });
    ctx.onSearch = s => { q = s; draw(); };
    v.addEventListener("click", e => { if (e.target.closest("[data-add]")) editPlayer(null, p => { location.hash = "#players/p/" + p.id; }, Object.assign({ cat: key }, opts)); });
    draw();
  }
  function playerProfile(v, p, opts) {
    if (!p) { v.innerHTML = D.head("Player not found", "", "", "#players") + `<div class="card">${D.empty("user", "This player no longer exists.")}</div>`; return; }
    const draw = () => {
      const a = attendanceOf(p.id), s = X.sumStats(X.matchStats[p.id] || []);
      const ev = X.evaluations.filter(e => e.player === p.id).slice(-1)[0];
      const E = 'data-editp';
      v.innerHTML = D.head(p.name, `${esc(p.pos)} · ${catName(p.cat)}`, opts.admin ? `<button class="btn btn-d" data-del>${icon("trash")}Delete</button>` : "", "#players/" + p.cat) +
        `<div class="pf"><div class="card pf-side">${avatar(p, 132, "ring")}<h2>${esc(p.name)}</h2><p>${esc(p.id)}</p>
            <div class="tags"><span class="cat">${esc(p.cat)}</span>${statusTag(p.status)}${p.num ? `<span class="tag t-info plain">#${esc(p.num)}</span>` : ""}</div>
            <div class="btns">${p.status === "Pending" ? `<button class="btn btn-y" data-approve>${icon("check")}Approve player</button>` : ""}
              <button class="btn ${p.status === "Pending" ? "btn-g" : "btn-y"}" ${E}>${icon("edit")}Edit details</button>
              ${opts.statsHref ? `<a class="btn btn-g" href="${opts.statsHref(p)}">${icon("stats")}View stats</a>` : ""}
              ${opts.evalHref ? `<a class="btn btn-g" href="${opts.evalHref(p)}">${icon("clipboard")}Evaluation</a>` : ""}</div></div>
          <div class="grid">
            <div class="card"><div class="card-h"><h3>Season snapshot</h3><p>Season 2026</p></div><div class="rows">
              ${statRow("Attendance", a.rate, 100, Math.round(a.rate) + "%")}${statRow("Appearances", s.apps, X.results.length, s.apps + "/" + X.results.length)}
              ${p.key === "gk" ? statRow("Saves", s.saves, 40) : statRow("Goals", s.goals, 12)}${statRow("Avg rating", s.rating, 10, s.rating || "—")}
              ${statRow("Last evaluation", ev ? ev.overall : 0, 10, ev ? ev.overall.toFixed(1) : "—")}${statRow("Assists", s.assists, 8)}</div></div>
            <div class="card"><div class="card-h"><h3>Player details</h3></div><div class="rows">
              ${txtRow("Age group", esc(p.cat), E)}${txtRow("Position", esc(p.pos), E)}${txtRow("Jersey number", p.num ? "#" + esc(p.num) : "—", E)}${txtRow("Preferred foot", esc(p.foot || "—"), E)}
              ${txtRow("Age", esc(p.age), E)}${txtRow("Date of birth", p.dob ? fmtDate(p.dob) : "—", opts.admin ? E : "")}${txtRow("School", esc(p.school || "—"), E)}${txtRow("Joined", p.joined ? fmtDate(p.joined) : "—")}</div></div>
            <div class="card"><div class="card-h"><h3>Guardian &amp; sign-in</h3></div><div class="rows">
              ${txtRow("Guardian", esc(p.guardian.name || "—"), E)}${txtRow("Relationship", esc(p.guardian.relation || "—"), E)}${txtRow("Email", esc(p.guardian.email || "—"), E)}${txtRow("Phone", esc(p.guardian.phone || "—"), E)}
              ${txtRow("Player MyKad", `<span style="font-family:ui-monospace,Consolas,monospace">${esc(opts.admin ? p.mykad || "—" : mask(p.mykad))}</span>`, opts.admin ? E : "")}${txtRow("Portal access", p.status === "Active" ? '<span style="color:#17844a">Enabled</span>' : '<span class="muted">After approval</span>')}</div></div>
          </div></div>`;
      D.animateRings(v);
    };
    draw();
    v.addEventListener("click", e => {
      if (e.target.closest("[data-editp]")) editPlayer(p, draw, opts);
      else if (e.target.closest("[data-approve]")) { p.status = "Active"; D.toast(p.name + " approved. Guardian can now sign in.", "circle-check"); draw(); }
      else if (e.target.closest("[data-del]")) D.confirmBox("Delete " + p.name + "?", "This removes the player, their stats and their guardian's sign-in.", "Delete player", () => { const cat = p.cat; X.players.splice(X.players.indexOf(p), 1); for (let i = X.evaluations.length - 1; i >= 0; i--) if (X.evaluations[i].player === p.id) X.evaluations.splice(i, 1); D.toast(p.name + " deleted.", "circle-check"); location.hash = "#players/" + cat; });
    });
  }

  window.DashShared = { editPlayer, playerManagement, playerStats, evaluationReport, attendanceReport, attendanceOf, playerPicker, resultOf, scoreTxt, matchList, catName, CATS, txtRow };
})();
