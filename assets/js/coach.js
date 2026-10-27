/* THE HAWK portal — Coach dashboard (design preview, in-memory data) */
(function () {
  "use strict";
  const D = window.Dash, S = window.DashShared, X = window.HAWKX;
  const { esc, fmtDate, icon, gi, avatar, statusTag, tag, head, kpi, selCard, selGrid, $, $$ } = D;
  let coach = null;
  const myCats = () => (coach.cats || []).every(c => S.CATS.includes(c)) && coach.cats.length ? coach.cats : null;

  /* ---------- Player Management ---------- */
  const playerManagement = (v, ctx) => S.playerManagement(v, ctx, { cats: myCats(), statsHref: p => "#stats/" + p.id, evalHref: p => "#evaluation/" + p.id });

  /* ---------- Player Stats ---------- */
  function playerStats(v, ctx) {
    const p = ctx.param && X.players.find(x => x.id === ctx.param);
    if (p) { S.playerStats(v, p, { head: head(p.name, p.pos + " · " + p.cat + " · #" + p.num, `<a class="btn btn-g" href="#evaluation/${p.id}">${icon("clipboard")}Evaluate</a>`, "#stats") }); return; }
    const tot = X.players.map(pl => ({ p: pl, s: X.sumStats(X.matchStats[pl.id]) }));
    const top = k => tot.slice().sort((a, b) => b.s[k] - a.s[k]).slice(0, 3);
    const board = (title, ico, k) => `<div class="card"><div class="card-h"><h3><span class="kpi-i" >${gi(ico, 40)}</span>${title}</h3></div>${top(k).map((t, i) => `<a class="lead" href="#stats/${t.p.id}"><span class="pos">${i + 1}</span>${avatar(t.p, 38)}<span><b style="font-size:14px;font-weight:500">${esc(t.p.name)}</b><br><small class="muted">${esc(t.p.cat)} · ${esc(t.p.pos)}</small></span><span class="v">${t.s[k]}</span></a>`).join("")}</div>`;
    v.innerHTML = head("Player Stats", "Squad leaders this season. Select any player to open their stats card.") +
      `<div class="grid g-3">${board("Top scorers", "trophy", "goals")}${board("Most assists", "heart-handshake", "assists")}${board("Best rated", "star", "rating")}</div>
      <div class="sec-title"><h2>Select a player</h2></div><div id="pick"></div>`;
    ctx.onSearch = S.playerPicker($("#pick", v), { href: pl => "#stats/" + pl.id });
  }

  /* ---------- Performance Evaluation Report Submission ---------- */
  const MONTH = "Oct 2026", MONTH_DATE = "2026-10-26";
  function evaluation(v, ctx) {
    const p = ctx.param && X.players.find(x => x.id === ctx.param);
    if (p) return evaluationForm(v, p);
    const done = id => X.evaluations.some(e => e.player === id && e.label === MONTH);
    const subm = X.players.filter(pl => done(pl.id)).length;
    v.innerHTML = head("Performance Evaluation", "Submit the " + MONTH + " report for each player. Reports go to the admin for review.") +
      `<div class="grid g-3">${kpi("clipboard-check", `${subm}<small> / ${X.players.length}</small>`, "Reports submitted")}${kpi("hourglass-high", X.players.length - subm, "Still to do")}${kpi("calendar-event", "31 Oct", "Deadline")}</div>
      <div class="sec-title"><h2>Select a player</h2></div><div id="pick"></div>`;
    ctx.onSearch = S.playerPicker($("#pick", v), {
      href: pl => "#evaluation/" + pl.id,
      order: pl => done(pl.id) ? 1 : 0, // reports still due come first
      badge: pl => done(pl.id) ? tag("Submitted", "t-ok") : tag("Due", "t-warn")
    });
  }
  function evaluationForm(v, p) {
    const prev = X.evaluations.filter(e => e.player === p.id).slice(-1)[0];
    const existing = X.evaluations.find(e => e.player === p.id && e.label === MONTH);
    const scores = Object.assign({}, (existing || prev || {}).scores || {});
    Object.values(X.attrsFor(p)).flat().forEach(a => { if (scores[a] == null) scores[a] = 5; });
    const avg = () => { const a = Object.values(scores); return (a.reduce((s, x) => s + x, 0) / a.length).toFixed(1); };
    v.innerHTML = head(p.name, p.pos + " · " + p.cat + " · " + MONTH + " report", "", "#evaluation") +
      `<div class="card"><div class="prof">${avatar(p, 72, "ring")}<div><h2>${esc(p.name)}</h2><p>${esc(p.id)} · #${esc(p.num)}</p></div><div class="facts"><div><span>Report</span><b>${MONTH}</b></div><div><span>Last overall</span><b>${prev ? prev.overall.toFixed(1) : "—"}</b></div><div><span>Overall now</span><b id="ov" style="color:var(--blue)">${avg()}</b></div></div></div></div>
      <div class="card mt-24"><div class="card-h"><h3>Skill ratings</h3><p>Tap the pencil to change a score from 1 to 10. Starts from last month's report.</p></div><div id="er">${D.evalRows(p, scores, true)}</div></div>
      <div class="grid g-2 mt-24"><div class="card">${D.field({ name: "comment", label: "Coach's comment (shared with the guardian)", type: "textarea", value: existing ? existing.comment : "", placeholder: "Strengths, what to work on next, and one encouraging note." })}</div>
        <div class="card">${D.field({ name: "focus", label: "Focus for next month", type: "select", options: ["Weaker foot", "First touch under pressure", "Scanning", "Positioning without the ball", "Communication", "Finishing"], value: "First touch under pressure" })}
          <label class="toggle mt-16"><input type="checkbox" name="share" checked><i></i>Notify guardian when approved</label></div></div>
      <div class="flex mt-24" style="justify-content:flex-end;gap:10px"><a class="btn btn-g" href="#evaluation">Cancel</a><button class="btn btn-g" data-draft>Save draft</button><button class="btn btn-y" data-submit>${icon("send")}${existing ? "Resubmit report" : "Submit report"}</button></div>`;
    D.bindEvalRows($("#er", v), (a, val) => { scores[a] = val; $("#ov", v).textContent = avg(); });
    v.addEventListener("click", e => {
      if (e.target.closest("[data-draft]")) D.toast("Draft saved.", "file-text");
      if (!e.target.closest("[data-submit]")) return;
      const f = D.formData(v);
      if (!f.comment) { const t = $("[name=comment]", v); t.focus(); t.style.borderColor = "#ff5a6a"; D.toast("Add a short comment for the guardian.", "file-text"); return; }
      const ev = { id: "EV-NEW-" + p.id, player: p.id, date: MONTH_DATE, label: MONTH, coach: coach.name, scores: Object.assign({}, scores), overall: +avg(), comment: f.comment, status: "Pending review" };
      if (existing) Object.assign(existing, ev); else X.evaluations.push(ev);
      D.toast("Report for " + p.first + " submitted for review.", "circle-check"); location.hash = "#evaluation";
    });
  }

  /* ---------- Attendance Report Submission (all players) ---------- */
  const submitted = {}; // sessionId -> true (this preview only)
  const LBL = { P: "Present", L: "Late", A: "Absent" };
  function attendance(v, ctx) {
    const sessions = [X.openSession].concat(X.sessions.slice(-7).reverse());
    const s = ctx.param && sessions.find(o => o.id === ctx.param);
    if (s) return roster(v, s);
    const rate = o => { const r = Object.values(X.attendance[o.id] || {}); return r.length ? Math.round(r.filter(x => x !== "A").length / r.length * 100) : null; };
    const rateTag = o => { const r = rate(o); return r == null ? tag("No record", "t-mute") : tag(r + "% present", r >= 90 ? "t-ok" : r >= 75 ? "t-warn" : "t-bad"); };
    const isOpen = o => o.id === X.openSession.id && !submitted[o.id];
    v.innerHTML = head("Attendance Report", "Select a session, mark every player, then submit.") +
      selGrid(sessions.map(o => selCard({
        href: "#attendance/" + o.id, ico: isOpen(o) ? "calendar-event" : "calendar-check", label: o.title,
        sub: `${fmtDate(o.date, true)}<br>${esc(o.time)}`, cls: isOpen(o) ? "is-on" : "",
        badge: isOpen(o) ? tag("Open", "t-info") : rateTag(o)
      })));
  }
  function roster(v, s) {
    const isOpen = s.id === X.openSession.id && !submitted[s.id];
    const marks = X.attendance[s.id] = X.attendance[s.id] || {};
    const players = X.players.filter(p => p.status !== "Inactive");
    const cnt = k => players.filter(p => marks[p.id] === k).length;
    function draw() {
      v.innerHTML = head(s.title, `${fmtDate(s.date, true)} · ${esc(s.time)} · ${esc(s.venue)}`, isOpen ? `<button class="btn btn-g" data-all="P">${icon("check")}All present</button><button class="btn btn-g" data-all="">Clear</button>` : statusTag("Submitted"), "#attendance") +
        `<div class="grid g-4">${kpi("users-group", players.length, "Squad")}${kpi("circle-check", `<span id="cP">${cnt("P")}</span>`, "Present")}${kpi("hourglass-high", `<span id="cL">${cnt("L")}</span>`, "Late")}${kpi("alert-triangle", `<span id="cA">${cnt("A")}</span>`, "Absent")}</div>
        <div class="card mt-24"><div class="card-h"><h3>All players</h3><p>${isOpen ? "Tap P, L or A for each player" : "Submitted · read only"}</p></div><div class="roster">
          ${players.map(p => `<div class="ro-row"><span class="who">${avatar(p, 44)}<span><b>${esc(p.name)}</b><small>${esc(p.pos)} · #${esc(p.num)}</small></span></span>
            <span class="meta"><span class="cat">${esc(p.cat)}</span> &nbsp;${Math.round(S.attendanceOf(p.id).rate)}% this season</span>
            <span class="pa" role="group" aria-label="${esc(p.name)} attendance" data-pid="${p.id}">${["P", "L", "A"].map(k => `<button type="button" data-v="${k}" class="${marks[p.id] === k ? "is-on" : ""}" aria-pressed="${marks[p.id] === k}" title="${LBL[k]}"${isOpen ? "" : " disabled"}>${k}</button>`).join("")}</span></div>`).join("")}</div>
          ${isOpen ? `<div class="flex mt-24" style="justify-content:space-between;flex-wrap:wrap;gap:12px"><p class="muted" id="left"></p><button class="btn btn-y" data-submit>${icon("send")}Submit attendance</button></div>` : ""}</div>`;
      upd();
    }
    const upd = () => { ["P", "L", "A"].forEach(k => { const el = $("#c" + k, v); if (el) el.textContent = cnt(k); }); const l = players.filter(p => !marks[p.id]).length, el = $("#left", v); if (el) el.textContent = l ? l + " player" + (l > 1 ? "s" : "") + " not marked yet" : "Everyone is marked."; };
    v.addEventListener("click", e => {
      const b = e.target.closest(".pa [data-v]");
      if (b && isOpen) { const pid = b.parentElement.dataset.pid; marks[pid] = marks[pid] === b.dataset.v ? undefined : b.dataset.v; $$("[data-v]", b.parentElement).forEach(x => { const on = marks[pid] === x.dataset.v; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on); }); upd(); return; }
      const all = e.target.closest("[data-all]");
      if (all && isOpen) { players.forEach(p => { marks[p.id] = all.dataset.all || undefined; }); draw(); return; }
      if (e.target.closest("[data-submit]")) {
        const l = players.filter(p => !marks[p.id]).length;
        if (l) { D.toast("Mark all " + l + " remaining players first.", "alert-triangle"); return; }
        submitted[s.id] = true; D.toast("Attendance submitted for " + fmtDate(s.date) + ".", "circle-check"); location.hash = "#attendance";
      }
    });
    draw();
  }

  D.start({
    role: "coach", label: "COACH", searchHint: "Search players",
    user: ses => { coach = X.coaches.find(c => c.id === ses.staff) || X.coaches[0]; return { name: coach.name, sub: coach.pos, avatar: avatar(coach, 42) }; },
    nav: [
      { id: "players", label: "Player Management", icon: "users" },
      { id: "stats", label: "Player Stats", icon: "stats" },
      { id: "evaluation", label: "Performance Evaluation", icon: "clipboard" },
      { id: "attendance", label: "Attendance Report", icon: "calcheck" }
    ],
    views: { players: playerManagement, stats: playerStats, evaluation, attendance }
  });
})();
