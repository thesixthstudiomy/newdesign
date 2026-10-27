/* THE HAWK Portal — sign-in (design preview: checks demo accounts in the browser).
   Each account type has its own fields, rendered from its own preset — the
   other roles' fields are never in the page. */
(function () {
  "use strict";
  const X = window.HAWKX;
  const $ = s => document.querySelector(s);
  const ICO = {
    mail: '<path d="M3 5h18v14H3z" stroke-linejoin="round"/><path d="M3.8 6.5l8.2 6 8.2-6"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.6" cy="11" r="2"/><path d="M5.8 16c.5-1.5 1.6-2.3 2.8-2.3s2.3.8 2.8 2.3M14 10h4M14 13.5h3"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.4"/><path d="M8 10.5V8a4 4 0 018 0v2.5M12 14.5v2.2"/>',
    eye: '<path d="M2.5 12s3.5-6.6 9.5-6.6 9.5 6.6 9.5 6.6-3.5 6.6-9.5 6.6S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    eyeOff: '<path d="M3 3l18 18M10.6 5.5A10 10 0 0112 5.4c6 0 9.5 6.6 9.5 6.6a17 17 0 01-3 3.8M6.2 7.4A17 17 0 002.5 12s3.5 6.6 9.5 6.6a9 9 0 004.3-1.1"/><path d="M9.9 10a2.8 2.8 0 004 4"/>'
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
  const svg = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICO[n]}</svg>`;

  // Demo presets (prefilled for the preview). Real accounts come from the server later.
  const ROLES = {
    guardian: {
      label: "Guardian", page: "guardian.html",
      fields: [
        { name: "email", label: "Guardian email", type: "email", icon: "mail", auto: "email", value: "guardian@thehawk.demo", placeholder: "you@email.com" },
        { name: "mykad", label: "Player MyKad No.", type: "password", icon: "id", value: "140823-07-0583", placeholder: "YYMMDD-PB-####", mykad: true, help: "Your child's 12-digit MyKad number." }
      ],
      demo: "Demo guardian (Aiman Haziq's father): <code>guardian@thehawk.demo</code> · MyKad <code>140823-07-0583</code>"
    },
    coach: {
      label: "Coach", page: "coach.html",
      fields: [
        { name: "email", label: "Coach email", type: "email", icon: "mail", auto: "username", value: "coach@thehawk.demo", placeholder: "you@thehawk.my" },
        { name: "password", label: "Password", type: "password", icon: "lock", auto: "current-password", value: "Coach@2026", placeholder: "Your password" }
      ],
      demo: "Demo coach (Hafiz Rahman): <code>coach@thehawk.demo</code> · <code>Coach@2026</code>"
    },
    admin: {
      label: "Admin", page: "admin.html",
      fields: [
        { name: "email", label: "Admin email", type: "email", icon: "mail", auto: "username", value: "admin@thehawk.demo", placeholder: "you@thehawk.my" },
        { name: "password", label: "Password", type: "password", icon: "lock", auto: "current-password", value: "Admin@2026", placeholder: "Your password" }
      ],
      demo: "Demo admin: <code>admin@thehawk.demo</code> · <code>Admin@2026</code>"
    }
  };
  const draft = {}; // values typed per role survive switching tabs
  let role = new URLSearchParams(location.search).get("role");
  if (!ROLES[role]) role = "guardian";

  const fieldsBox = $("#fields"), form = $("#lgForm"), btn = $("#lgBtn"), err = $("#lgErr");
  const fmtMykad = v => { const d = v.replace(/\D/g, "").slice(0, 12); return d.length > 8 ? d.slice(0, 6) + "-" + d.slice(6, 8) + "-" + d.slice(8) : d.length > 6 ? d.slice(0, 6) + "-" + d.slice(6) : d; };

  function render() {
    const R = ROLES[role];
    document.querySelectorAll(".role").forEach(b => b.setAttribute("aria-checked", b.dataset.role === role));
    fieldsBox.innerHTML = R.fields.map(f => {
      const v = (draft[role] && draft[role][f.name] != null) ? draft[role][f.name] : f.value;
      return `<label class="f" for="f-${f.name}"><span>${f.label}</span><span class="f-in">${svg(f.icon)}<input id="f-${f.name}" name="${f.name}" type="${f.type}" value="${esc(v)}" placeholder="${f.placeholder}" autocomplete="${f.auto || "off"}"${f.mykad ? ' inputmode="numeric" maxlength="14"' : ""} required>${f.type === "password" ? `<button type="button" class="f-eye" data-eye aria-label="Show ${f.label.toLowerCase()}">${svg("eye")}</button>` : ""}</span>${f.help ? `<small>${f.help}</small>` : ""}</label>`;
    }).join("");
    fieldsBox.style.animation = "none"; void fieldsBox.offsetWidth; fieldsBox.style.animation = "";
    $("#forgot").textContent = role === "guardian" ? "Need help?" : "Forgot password?";
    $("#lgBtnTxt").textContent = "Sign in as " + R.label;
    $("#demo").innerHTML = "<b>Design preview.</b> " + R.demo;
    err.textContent = "";
    history.replaceState(null, "", "?role=" + role);
  }
  document.getElementById("roles").addEventListener("click", e => {
    const b = e.target.closest(".role"); if (!b || b.dataset.role === role) return;
    draft[role] = Object.fromEntries(Array.from(fieldsBox.querySelectorAll("input")).map(i => [i.name, i.value]));
    role = b.dataset.role; render();
  });
  document.getElementById("roles").addEventListener("keydown", e => {
    if (!/Arrow(Left|Right)/.test(e.key)) return;
    const keys = Object.keys(ROLES), i = keys.indexOf(role), n = keys[(i + (e.key === "ArrowRight" ? 1 : keys.length - 1)) % keys.length];
    document.querySelector(`.role[data-role=${n}]`).click(); document.querySelector(`.role[data-role=${n}]`).focus();
  });
  fieldsBox.addEventListener("click", e => {
    const b = e.target.closest("[data-eye]"); if (!b) return;
    const inp = b.parentElement.querySelector("input"), show = inp.type === "password";
    inp.type = show ? "text" : "password"; b.innerHTML = svg(show ? "eyeOff" : "eye"); b.setAttribute("aria-label", (show ? "Hide " : "Show ") + b.getAttribute("aria-label").replace(/^(Show|Hide) /, ""));
  });
  fieldsBox.addEventListener("input", e => {
    if (e.target.name === "mykad") { const p = e.target.selectionStart, before = e.target.value.length; e.target.value = fmtMykad(e.target.value); const d = e.target.value.length - before; e.target.setSelectionRange(p + d, p + d); }
    e.target.classList.remove("bad"); err.textContent = "";
  });

  /* ---------- Hawk Check (captcha) ---------- */
  const hc = $("#hc"), track = $("#hcTrack"), ball = $("#hcBall"), goal = $("#hcGoal"), msg = $("#hcMsg"), token = $("#hcToken");
  const BALL = 44, PAD = 6, GOAL = 64;
  let gx = 0, x = 0, misses = 0, verified = false, drag = null;
  // the page is zoomed to 80% on desktop; pointer moves are in screen px, the ball in page px
  const zoom = () => ball.currentCSSZoom || parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  const maxX = () => track.clientWidth - BALL - PAD * 2;
  function newChallenge() {
    verified = false; misses = 0; token.value = ""; hc.dataset.state = "idle"; msg.textContent = "";
    const W = track.clientWidth; gx = Math.round(W * (.52 + Math.random() * .3)); gx = Math.min(gx, W - GOAL - 8);
    goal.style.left = gx + "px"; setX(0); btn.disabled = true; ball.setAttribute("tabindex", "0");
  }
  function setX(v) { x = Math.max(0, Math.min(maxX(), v)); ball.style.transform = `translateX(${x}px) rotate(${x * 1.6}deg)`; track.style.setProperty("--trail", (x + PAD + BALL / 2) + "px"); ball.setAttribute("aria-valuenow", Math.round(x / maxX() * 100)); }
  function judge(samples, ms) {
    const c = x + PAD + BALL / 2, inGoal = c > gx + 12 && c < gx + GOAL - 8;
    // people move unevenly; scripted drags are instant or perfectly even
    let human = ms > 220 && samples.length >= 4;
    if (human && samples.length > 6) {
      const v = []; for (let i = 1; i < samples.length; i++) { const dt = samples[i].t - samples[i - 1].t || 1; v.push((samples[i].x - samples[i - 1].x) / dt); }
      const m = v.reduce((a, b) => a + b, 0) / v.length, sd = Math.sqrt(v.reduce((a, b) => a + (b - m) * (b - m), 0) / v.length);
      if (sd < .002) human = false;
    }
    if (inGoal && human) {
      verified = true; hc.dataset.state = "ok"; msg.textContent = "Goal! You're verified.";
      setX(gx + GOAL / 2 - PAD - BALL / 2 + 4);
      token.value = "hc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      btn.disabled = false; ball.setAttribute("tabindex", "-1");
    } else {
      misses++; hc.dataset.state = "bad"; msg.textContent = inGoal ? "Too quick. Try again." : misses >= 3 ? "Missed. New goal position." : "Missed! Try again.";
      setTimeout(() => { hc.dataset.state = "idle"; ball.style.transition = "transform .45s cubic-bezier(.2,.75,.2,1)"; setX(0); setTimeout(() => ball.style.transition = "", 460); if (misses >= 3) { const m = msg.textContent; newChallenge(); msg.textContent = m; } }, 420);
    }
  }
  ball.addEventListener("pointerdown", e => {
    if (verified) return; e.preventDefault(); ball.setPointerCapture(e.pointerId);
    drag = { sx: e.clientX, x0: x, t0: performance.now(), samples: [{ t: 0, x }] }; hc.dataset.state = "idle"; msg.textContent = "";
  });
  ball.addEventListener("pointermove", e => {
    if (!drag) return; setX(drag.x0 + (e.clientX - drag.sx) / zoom()); drag.samples.push({ t: performance.now() - drag.t0, x });
  });
  const end = () => { if (!drag) return; const d = drag; drag = null; judge(d.samples, performance.now() - d.t0); };
  ball.addEventListener("pointerup", end); ball.addEventListener("pointercancel", end);
  let kb = null;
  ball.addEventListener("keydown", e => {
    if (verified) return;
    if (/Arrow(Right|Left)/.test(e.key)) { e.preventDefault(); if (!kb) kb = { t0: performance.now(), samples: [] }; setX(x + (e.key === "ArrowRight" ? 1 : -1) * maxX() * .04); kb.samples.push({ t: performance.now() - kb.t0, x }); }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const k = kb || { t0: performance.now(), samples: [] }; kb = null; judge(k.samples.length >= 4 ? k.samples : [], performance.now() - k.t0); }
  });
  $("#hcNew").addEventListener("click", newChallenge);
  window.addEventListener("resize", () => { if (!verified) newChallenge(); });

  /* ---------- submit ---------- */
  form.addEventListener("submit", e => {
    e.preventDefault(); err.textContent = "";
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website) return; // honeypot
    if (!verified || !data.hawk_check) { err.textContent = "Please complete the Hawk Check first."; return; }
    const email = (data.email || "").trim().toLowerCase();
    const bad = (name, text) => { const i = form.querySelector(`[name=${name}]`); if (i) { i.classList.add("bad"); i.focus(); } err.textContent = text; };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("email", "Enter a valid email address.");
    let ses = null;
    if (role === "guardian") {
      const ic = (data.mykad || "").replace(/\D/g, "");
      if (ic.length !== 12) return bad("mykad", "MyKad number must be 12 digits.");
      const p = X.players.find(pl => pl.guardian.email.toLowerCase() === email && pl.mykad.replace(/\D/g, "") === ic);
      if (!p) return bad("mykad", "We couldn't match that email and MyKad number.");
      ses = { role, email, player: p.id, name: p.guardian.name };
    } else {
      const ok = role === "coach" ? email === "coach@thehawk.demo" && data.password === "Coach@2026" : email === "admin@thehawk.demo" && data.password === "Admin@2026";
      if (!ok) return bad("password", "Wrong email or password.");
      ses = role === "coach" ? { role, email, staff: X.coaches[0].id, name: X.coaches[0].name } : { role, email, name: "Club Admin" };
    }
    btn.disabled = true; btn.classList.add("is-busy"); $("#lgBtnTxt").textContent = "Signing in…";
    try { sessionStorage.setItem("hawk.session", JSON.stringify(Object.assign(ses, { at: Date.now() }))); } catch (er) {}
    setTimeout(() => { location.href = ROLES[role].page; }, 650);
  });

  render();
  // wait for layout before placing the goal
  requestAnimationFrame(newChallenge);
})();
