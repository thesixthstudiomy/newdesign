/* THE HAWK — design preview interactions (no backend; data from data.js) */
(function () {
  "use strict";
  const D = window.HAWK;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const IMG = "assets/img/";
  const lic = (id, cls) => `<svg class="lic ${cls || ""}" aria-hidden="true"><use href="#li-${id}"/></svg>`;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = n => String(n).padStart(2, "0");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  document.documentElement.classList.add("js");

  /* ---------- Top bar ---------- */
  const topbar = $(".topbar"), burger = $("#burger"), nav = $("#mainnav");
  const onScroll = () => topbar.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  burger.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open); burger.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", e => { if (e.target.closest("a")) { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); } });
  // highlight the section in view
  const navLinks = $$(".mainnav a[href^='#']");
  const spy = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["about", "players", "fixtures", "achievements", "gallery", "contact"].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---------- Countdown ---------- */
  const kickoff = new Date(D.nextMatch.kickoff).getTime();
  $("#cdVs").textContent = "VS " + D.nextMatch.opponent;
  const cd = { d: $("#cdD"), h: $("#cdH"), m: $("#cdM"), s: $("#cdS") };
  const tick = () => {
    let t = Math.max(0, Math.floor((kickoff - Date.now()) / 1000));
    cd.d.textContent = pad(Math.floor(t / 86400)); t %= 86400;
    cd.h.textContent = pad(Math.floor(t / 3600)); t %= 3600;
    cd.m.textContent = pad(Math.floor(t / 60)); cd.s.textContent = pad(t % 60);
  };
  tick(); setInterval(tick, 1000);

  /* ---------- Crests ---------- */
  const crestSvg = (c, t) =>
    `<svg viewBox="0 0 40 46" aria-hidden="true"><path d="M20 1.5l17 5.6v14.2c0 11.3-7.6 19.6-17 23.2C10.6 40.9 3 32.6 3 21.3V7.1z" fill="${c[0]}" stroke="${c[1]}" stroke-width="2"/><path d="M20 6.5l12.4 4.1v10.7c0 8.2-5.4 14.4-12.4 17.3-7-2.9-12.4-9.1-12.4-17.3V10.6z" fill="none" stroke="${c[1]}" stroke-opacity=".45" stroke-width="1"/><text x="20" y="26.5" text-anchor="middle" font-family="Saira,sans-serif" font-weight="800" font-size="12" fill="${c[1]}">${t}</text></svg>`;
  const team = (t, cls) => t === "hawk"
    ? { name: "The Hawk", logo: `<img src="${IMG}logo.webp" alt="">`, hawk: true }
    : { name: t.name, logo: crestSvg(t.c, t.t), hawk: false };

  /* ---------- Fixtures & training ---------- */
  $("#fxList").innerHTML = D.fixtures.map(f => {
    const h = team(f.home), a = team(f.away);
    return `<article class="fx-row">
      <div class="fx-date"><small>${f.wd}</small><b>${f.day}</b><span>${f.mon}</span></div>
      <div class="fx-main"><div class="fx-comp">${esc(f.comp)}<span class="fx-cat">${f.cat}</span></div>
        <div class="fx-teams"><span class="fx-team${h.hawk ? " is-hawk" : ""}">${h.logo}${esc(h.name)}</span><span class="fx-vs">VS</span><span class="fx-team${a.hawk ? " is-hawk" : ""}">${a.logo}${esc(a.name)}</span></div></div>
      <div class="fx-info"><span><svg><use href="#i-clock"/></svg>${f.time}</span><span><svg><use href="#i-pin"/></svg>${esc(f.venue)}</span></div>
      <a class="fx-btn" href="#fixtures">Match info<svg><use href="#i-chev"/></svg></a>
    </article>`;
  }).join("");
  $("#trainGrid").innerHTML = D.training.map(t => `<article class="tr-card">
      <div class="tr-when"><b>${t.day}</b><span>${t.wd}<br>${t.mon}</span></div>
      <h4>${esc(t.title)}</h4>
      <div class="tr-meta"><span><svg><use href="#i-clock"/></svg>${t.time}</span><span><svg><use href="#i-pin"/></svg>${esc(t.venue)}</span><span><svg><use href="#i-whistle"/></svg>${esc(t.coach)}</span></div>
      <div class="tr-cats">${t.cats.map(c => `<i>${c}</i>`).join("")}</div></article>`).join("");

  /* ---------- Achievements ---------- */
  const honIco = { cup: "trophy", medal: "medal", shield: "award" };
  $("#honGrid").innerHTML = D.achievements.map(a => `<article class="hon-card">
      <span class="hon-year">${a.year}</span>${lic(honIco[a.kind] || "trophy", "hon-ico")}
      <h3>${esc(a.title)}</h3><p class="hon-comp">${esc(a.comp)}</p>
      <div class="hon-meta"><span><svg><use href="#i-pin"/></svg>${esc(a.place)}</span><span><svg><use href="#i-cal"/></svg>${a.date}</span></div></article>`).join("");

  /* ---------- Gallery + lightbox ---------- */
  $("#galGrid").innerHTML = D.gallery.map((g, i) => `<figure class="gal-item" tabindex="0" data-i="${i}"><img src="${IMG}${g.img}" alt="${esc(g.cap)}" loading="lazy"><figcaption>${esc(g.cap)}<i>${g.tag}</i></figcaption></figure>`).join("");
  const lb = $("#lightbox");
  const openLb = i => { const g = D.gallery[i]; $("#lbImg").src = IMG + g.img; $("#lbImg").alt = g.cap; $("#lbCap").textContent = g.cap; lb.hidden = false; $("#lbClose").focus(); };
  $("#galGrid").addEventListener("click", e => { const f = e.target.closest(".gal-item"); if (f) openLb(+f.dataset.i); });
  $("#galGrid").addEventListener("keydown", e => { const f = e.target.closest(".gal-item"); if (f && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openLb(+f.dataset.i); } });
  const closeLb = () => { lb.hidden = true; };
  $("#lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });

  /* ---------- Reveal + count-up ---------- */
  const rev = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); rev.unobserve(en.target); } }), { rootMargin: "0px 0px -10% 0px" });
  $$(".reveal").forEach(el => rev.observe(el));
  const cnt = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cnt.unobserve(en.target);
    const el = en.target, to = +el.dataset.count, t0 = performance.now(), dur = reduce ? 1 : 1400;
    const step = now => { const k = Math.min(1, (now - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  $$("[data-count]").forEach(el => cnt.observe(el));

  /* =====================================================================
     PLAYERS — card selector
     ===================================================================== */
  const squad = $("#players"), stage = $("#stage"), track = $("#track");
  const nameEl = $("#stageName"), posEl = $("#stagePos"), countEl = $("#stageCount");
  const FILTERS = {
    players: [["all", "All"], ["gk", "Goalkeepers"], ["df", "Defenders"], ["mf", "Midfielders"], ["fw", "Forwards"]],
    staff: [["all", "All"], ["coach", "Coaches"], ["mgmt", "Officials"]]
  };
  const PLURAL = { gk: "Goalkeepers", df: "Defenders", mf: "Midfielders", fw: "Forwards" };
  let tab = "players", active = new Set(), list = [], idx = 0, cards = [], M = {};

  const source = () => tab === "players" ? D.players : D.staff;
  const startIndex = () => { const c = list.findIndex(p => p.captain); return c >= 0 ? c : Math.floor(list.length / 2); };

  function renderFilters() {
    $("#filters").innerHTML = FILTERS[tab].map(([k, l]) =>
      `<button class="pill${(k === "all" ? active.size === 0 : active.has(k)) ? " is-on" : ""}" data-f="${k}" aria-pressed="${k === "all" ? active.size === 0 : active.has(k)}">${l}</button>`).join("");
  }
  function buildList(keepItem) {
    const all = source();
    list = active.size ? all.filter(p => active.has(p.key)) : all.slice();
    if (!list.length) { active.clear(); list = all.slice(); }
    const k = keepItem ? list.indexOf(keepItem) : -1;
    idx = k >= 0 ? k : startIndex();
    track.innerHTML = list.map((p, i) => `<div class="pc" data-i="${i}" role="button" tabindex="-1" aria-label="${esc(p.first + " " + p.last)}, ${esc(p.pos)}">
        <div class="pc-shape"></div>
        <img class="pc-img" src="${IMG}${p.img}" alt="" draggable="false" loading="lazy">
        ${p.captain ? `<span class="pc-cap">CAPTAIN</span>` : ""}
        <span class="pc-big">${p.num}</span>
        <span class="pc-num">${p.num}</span>
        <span class="pc-name">${esc(p.first + " " + p.last)}</span>
      </div>`).join("");
    cards = $$(".pc", track);
    layout(true);
  }

  // geometry measured from the reference: centre card ~0.715 w/h, side cards at 74% and 58%
  function metrics() {
    const W = stage.clientWidth, H = stage.clientHeight, mobile = W < 700;
    const ch = mobile ? Math.min(H * .72, W * .86) : Math.max(260, Math.min(H * .74, 480));
    const cw = ch * .715, s1 = .74, s2 = .58;
    const gap = mobile ? cw * .04 : cw * .13;
    const dx1 = cw / 2 + cw * s1 / 2 + gap, dx2 = dx1 + cw * s1 / 2 + cw * s2 / 2 + gap, dx3 = dx2 + cw * s2 / 2 + cw * .5;
    const extra = mobile ? 0 : Math.min(76, cw * .23);          // room for the vertical position label
    const cy = H * .5 + ch * .06;
    return { W, H, ch, cw, s1, s2, dx1, dx2, dx3, extra, cy, mobile };
  }
  function offsetOf(i) {
    const n = list.length; let o = i - idx;
    if (n >= 5) { if (o > n / 2) o -= n; if (o < -n / 2) o += n; }
    return o;
  }
  function layout(instant) {
    M = metrics();
    stage.style.setProperty("--cw", M.cw + "px"); stage.style.setProperty("--ch", M.ch + "px");
    squad.style.setProperty("--ch", M.ch + "px");
    cards.forEach((el, i) => {
      const o = offsetOf(i), a = Math.abs(o), side = Math.sign(o);
      let x = 0, s = 1, y = 0, op = 1, z = 30;
      if (a === 1) { x = side * M.dx1; s = M.s1; y = M.ch * .09; z = 20; }
      else if (a === 2) { x = side * M.dx2; s = M.s2; y = M.ch * .1; z = 10; op = M.mobile ? 0 : .95; }
      else if (a >= 3) { x = side * M.dx3; s = .5; y = M.ch * .1; z = 1; op = 0; }
      if (o > 0) x += M.extra;
      el.style.transform = `translate(${x}px, ${M.cy - M.H / 2 + y}px) scale(${s})`;
      el.style.opacity = op; el.style.zIndex = z;
      el.style.pointerEvents = op ? "" : "none";
      el.classList.toggle("is-center", o === 0);
      el.setAttribute("tabindex", o === 0 ? "0" : "-1");
      // size + centre the cut-out on the face
      const p = list[i], img = el.querySelector(".pc-img");
      const norm = Math.max(.5, Math.min(1.12, .19 / p.head[1]));
      const ih = Math.max(M.ch * 1.12 * norm, M.ch * 1.06);
      img.style.height = ih + "px"; img.style.transform = `translateX(${-p.head[0] * 100}%)`;
      if (instant) { el.style.transition = "none"; void el.offsetWidth; el.style.transition = ""; }
    });
    const p = list[idx];
    nameEl.style.setProperty("--name-y", (M.cy + M.ch * .5 - M.ch * .135) + "px");
    posEl.style.setProperty("--pos-x", (M.W / 2 + M.cw / 2 + M.extra * .62) + "px");
    posEl.style.setProperty("--pos-y", (M.cy + M.ch * .06) + "px");
    countEl.textContent = pad(idx + 1) + " / " + pad(list.length);
    setNames(p);
  }
  let nameTimer;
  function setNames(p) {
    const f = $(".sn-first", nameEl), l = $(".sn-last", nameEl);
    if (l.textContent === p.last && f.textContent === p.first) return;
    clearTimeout(nameTimer); nameEl.classList.add("is-swap");
    nameTimer = setTimeout(() => {
      f.textContent = p.first; l.textContent = p.last;
      posEl.textContent = tab === "players" ? PLURAL[p.key] : p.pos;
      nameEl.classList.remove("is-swap");
    }, f.textContent ? 260 : 0);
  }
  function go(n) { if (!list.length) return; idx = (n + list.length) % list.length; layout(false); }
  const next = () => go(idx + 1), prev = () => go(idx - 1);

  // filters + tabs
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    const k = b.dataset.f, cur = list[idx];
    if (k === "all") active.clear(); else active.has(k) ? active.delete(k) : active.add(k);
    renderFilters(); buildList(cur);
  });
  $$(".squad-bar [data-tab]").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.tab === tab) return;
    tab = b.dataset.tab; active.clear();
    $$(".squad-bar [data-tab]").forEach(x => { const on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", on); });
    $("#dtBack").lastChild.textContent = tab === "players" ? "All players" : "All staff";
    renderFilters(); buildList();
  }));

  // click: side card → bring to centre; centre card → stats
  track.addEventListener("click", e => {
    const c = e.target.closest(".pc"); if (!c) return;
    const i = +c.dataset.i;
    if (i === idx) openDetail(); else go(i);
  });
  // hover + scroll wheel switches player
  let wheelLock = 0, wheelAcc = 0;
  stage.addEventListener("wheel", e => {
    if (squad.classList.contains("is-detail") || M.mobile) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    // only while the section is mostly on screen, and let the page carry on
    // scrolling once the first / last player is reached (no scroll trap)
    const r = squad.getBoundingClientRect();
    if (Math.abs(r.top - topbar.offsetHeight) > r.height * .35) return;
    if ((d > 0 && idx >= list.length - 1) || (d < 0 && idx <= 0)) return;
    e.preventDefault();
    const now = Date.now();
    wheelAcc += d;
    if (now < wheelLock || Math.abs(wheelAcc) < 18) return;
    wheelAcc > 0 ? next() : prev(); wheelAcc = 0; wheelLock = now + 430;
  }, { passive: false });
  // swipe / drag
  let sx = null, sy = null;
  stage.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; });
  window.addEventListener("pointerup", e => {
    if (sx === null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); stage.dataset.swiped = "1"; setTimeout(() => delete stage.dataset.swiped, 50); }
  });
  track.addEventListener("click", e => { if (stage.dataset.swiped) e.stopImmediatePropagation(); }, true);
  // keyboard
  stage.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetail(); }
  });
  $("#nextBtn").addEventListener("click", next);
  $("#prevBtn").addEventListener("click", prev);
  $("#statsBtn").addEventListener("click", () => openDetail());
  window.addEventListener("resize", () => { layout(true); if (squad.classList.contains("is-detail")) placeDetailImg(); });

  /* =====================================================================
     PLAYERS — stats view
     ===================================================================== */
  const detail = $("#detail"), dtImg = $("#dtImg"), ghost = $("#flipGhost");
  const HON = ["trophy", "medal", "award", "star"];
  const HON_T = ["Champions", "Medals", "Fair play", "Player of the match"];
  const CIRC = 2 * Math.PI * 52;

  function spark(vals) {
    const W = 300, H = 60, mx = Math.max(1, ...vals), n = vals.length;
    const pts = vals.map((v, i) => [i * (W / (n - 1)), H - 6 - (v / mx) * (H - 14)]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return d;
  }
  function fillDetail(p) {
    const isP = tab === "players";
    $("#dtTag").textContent = p.pos;
    $("#dtName").textContent = p.first + " " + p.last;
    $("#dtNum").textContent = p.num;
    $("#dtHonours").innerHTML = p.honours.map((c, i) => `<div class="dt-hon" title="${HON_T[i]}">${lic(HON[i])}<i>${c}</i></div>`).join("");
    $(".dt-col .dt-lbl:nth-of-type(2)", detail).textContent = isP ? "Goals amount per season" : (p.key === "coach" ? "Wins per season" : "Members per season");
    const path = $("#dtSpark path"); path.setAttribute("d", spark(p.season));
    const len = path.getTotalLength ? path.getTotalLength() : 400;
    path.style.transition = "none"; path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    const nums = isP
      ? [[p.stats[0], "Minutes Played"], [p.stats[1], "Appearances"], [p.stats[2], "Goals"],
         [`${p.height}<small>m</small>`, "Height"], [p.age, "Age"], [p.cat, "Category"]]
      : [[p.stats[0], p.labels[0]], [p.stats[1], p.labels[1]], [p.stats[2], p.labels[2]],
         [p.info[0], "Speciality", 1], [p.info[1], "With the club", 1], [p.honours.reduce((a, b) => a + b, 0), "Trophies"]];
    $("#dtNums").innerHTML = nums.map(([v, l, txt]) => `<div class="dt-n"><b${txt ? ' class="is-text"' : ""}>${v}</b><span>${l}</span></div>`).join("");
    $("#dtMatches").innerHTML = D.soonMatches.map(m => {
      const h = team(m.home), a = team(m.away);
      return `<div class="dt-match"><div class="dt-team">${h.logo}${esc(h.name)}</div><div class="dt-time"><small>${m.date}</small>${m.time}<em>${esc(m.comp)}</em></div><div class="dt-team">${a.logo}${esc(a.name)}</div></div>`;
    }).join("");
    [["#ring1", p.rings[0]], ["#ring2", p.rings[1]]].forEach(([sel, r]) => {
      const el = $(sel), c = $(".r-val", el);
      c.style.transition = "none"; c.style.strokeDashoffset = CIRC; void c.getBoundingClientRect(); c.style.transition = "";
      $("b", el).textContent = r[0] + "%"; $("span", el).textContent = r[1];
    });
    dtImg.src = IMG + p.img; dtImg.alt = p.first + " " + p.last;
    dtImg.dataset.cx = p.head[0];
  }
  function animateBits(p) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const path = $("#dtSpark path"); path.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.2,.75,.2,1) .5s"; path.style.strokeDashoffset = 0;
      [["#ring1", p.rings[0]], ["#ring2", p.rings[1]]].forEach(([sel, r]) => { $(".r-val", $(sel)).style.strokeDashoffset = CIRC * (1 - r[0] / 100); });
    }));
  }
  function placeDetailImg() { dtImg.style.transform = `translateX(${-(+dtImg.dataset.cx || .5) * 100}%)`; }
  const settle = (el, ms) => new Promise(r => { let done = false; const f = () => { if (!done) { done = true; r(); } }; el.addEventListener("transitionend", f, { once: true }); setTimeout(f, ms); });

  // tag the detail parts for a staggered entrance
  [[".dt-back", 0], [".dt-meta", .05], [".dt-head", .1], [".dt-panel", .18], [".dt-nav", .22], ["#ring1", .28], ["#ring2", .34]].forEach(([s, d]) => { const el = $(s, detail); el.classList.add("dt-anim"); el.style.setProperty("--d", d + "s"); });
  [".dt-meta", ".dt-head", ".dt-panel", ".dt-right .ring"].forEach(s => $$(s, detail).forEach(el => el.classList.add("dt-swap")));

  let busy = false;
  async function openDetail() {
    if (busy || squad.classList.contains("is-detail") || !list.length) return;
    busy = true;
    const p = list[idx], card = cards[idx], from = card.querySelector(".pc-img");
    // bring the section fully into view first
    const top = squad.getBoundingClientRect().top;
    const navH = topbar.offsetHeight;
    if (!M.mobile && Math.abs(top - navH) > 4) { window.scrollTo({ top: window.scrollY + top - navH, behavior: reduce ? "auto" : "smooth" }); await new Promise(r => setTimeout(r, 560)); }
    fillDetail(p); placeDetailImg();
    await new Promise(r => { if (dtImg.complete && dtImg.naturalWidth) r(); else { dtImg.onload = r; dtImg.onerror = r; } });
    const a = from.getBoundingClientRect();
    squad.classList.add("is-detail"); detail.setAttribute("aria-hidden", "false");
    if (!M.mobile && !reduce) {
      dtImg.classList.remove("is-on");
      const b = dtImg.getBoundingClientRect();
      ghost.src = from.src; ghost.style.display = "block";
      ghost.style.width = a.width + "px"; ghost.style.height = a.height + "px";
      ghost.style.transition = "none"; ghost.style.transform = `translate(${a.left}px,${a.top}px)`;
      void ghost.offsetWidth;
      ghost.style.transition = "transform .85s cubic-bezier(.2,.75,.2,1), width .85s cubic-bezier(.2,.75,.2,1), height .85s cubic-bezier(.2,.75,.2,1)";
      ghost.style.transform = `translate(${b.left}px,${b.top}px)`; ghost.style.width = b.width + "px"; ghost.style.height = b.height + "px";
      await settle(ghost, 900);
      dtImg.classList.add("is-on"); ghost.style.display = "none";
    } else dtImg.classList.add("is-on");
    animateBits(p);
    $("#dtBack").focus({ preventScroll: true, focusVisible: false });
    busy = false;
  }
  async function closeDetail() {
    if (busy || !squad.classList.contains("is-detail")) return;
    busy = true;
    layout(true);
    const card = cards[idx], to = card.querySelector(".pc-img");
    if (!M.mobile && !reduce) {
      const a = dtImg.getBoundingClientRect();
      ghost.src = dtImg.src; ghost.style.display = "block"; ghost.style.transition = "none";
      ghost.style.width = a.width + "px"; ghost.style.height = a.height + "px"; ghost.style.transform = `translate(${a.left}px,${a.top}px)`;
      dtImg.classList.remove("is-on");
      squad.classList.remove("is-detail");
      card.style.transition = "none"; card.style.opacity = "0";
      void ghost.offsetWidth;
      const b = to.getBoundingClientRect();
      ghost.style.transition = "transform .75s cubic-bezier(.2,.75,.2,1), width .75s cubic-bezier(.2,.75,.2,1), height .75s cubic-bezier(.2,.75,.2,1)";
      ghost.style.transform = `translate(${b.left}px,${b.top}px)`; ghost.style.width = b.width + "px"; ghost.style.height = b.height + "px";
      await settle(ghost, 800);
      card.style.transition = ""; card.style.opacity = "1"; ghost.style.display = "none";
    } else squad.classList.remove("is-detail");
    detail.setAttribute("aria-hidden", "true");
    layout(true);
    stage.focus({ preventScroll: true });
    busy = false;
  }
  async function switchDetail(dir) {
    if (busy) return; busy = true;
    detail.classList.add("is-switch"); dtImg.classList.remove("is-on");
    await new Promise(r => setTimeout(r, 220));
    idx = (idx + dir + list.length) % list.length;
    const p = list[idx]; fillDetail(p); placeDetailImg();
    await new Promise(r => { if (dtImg.complete && dtImg.naturalWidth) r(); else { dtImg.onload = r; dtImg.onerror = r; } });
    detail.classList.remove("is-switch"); dtImg.classList.add("is-on"); animateBits(p);
    busy = false;
  }
  $("#dtBack").addEventListener("click", closeDetail);
  $("#dtNext").addEventListener("click", () => switchDetail(1));
  $("#dtPrev").addEventListener("click", () => switchDetail(-1));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { if (!lb.hidden) closeLb(); else closeDetail(); }
    if (!squad.classList.contains("is-detail")) return;
    if (e.key === "ArrowRight") switchDetail(1); else if (e.key === "ArrowLeft") switchDetail(-1);
  });

  renderFilters(); buildList();
  // re-layout once fonts settle (name sizes depend on them)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout(true));
})();
