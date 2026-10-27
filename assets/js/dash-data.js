/* THE HAWK portal — sample data for the dashboards (design preview only).
   Builds on window.HAWK from data.js. Everything is generated from a fixed
   seed so the numbers stay the same on every load. Replace with real data later. */
(function () {
  "use strict";
  const H = window.HAWK;
  let seed = 2026;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pick = a => a[Math.floor(rnd() * a.length)];
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());

  // width / height of each cut-out (for avatar crops)
  const AR = {
    "p-37455449.webp": .481, "p-37455454.webp": .478, "p-37455455.webp": .509, "p-37455456-gk.webp": .48, "p-37455467.webp": .463,
    "p-37455471-gk.webp": .536, "p-37455473.webp": .729, "p-37455475.webp": .532, "p-37455483.webp": .621, "p-37455485.webp": .618,
    "p-37455488.webp": .559, "p-37455490.webp": .501, "p-37455500.webp": .594,
    "s-12775225.webp": .614, "s-32454037.webp": .574, "s-17984122.webp": .531, "s-6551144.webp": .641, "s-21222662.webp": .462,
    "s-32526679.webp": .569, "s-33716224.webp": .616, "s-11792251.webp": .7
  };
  const SCHOOLS = ["SK Seberang Jaya", "SJK(C) Chung Hwa", "SK Bukit Mertajam", "SK Taman Senangin", "SJK(T) Ladang Valdor", "SK Permatang Pauh"];
  const GUARDIANS = ["Haziq Rahim", "Lim Wei Ming", "Zikri Abdullah", "Hakim Yusof", "Aqil Rahman", "Tan Boon Keat", "Rizqi Hassan", "Nair Suresh", "Iskandar Musa", "Hakimi Osman", "Amsyar Kamal", "Lee Chee Wai", "Chong Kah Leong"];
  const POS_SHORT = { gk: "GK", df: "DEF", mf: "MID", fw: "FWD" };

  /* ---------- players ---------- */
  const players = H.players.map((p, i) => {
    const birthYear = 2026 - p.age;
    const m = ri(1, 12), d = ri(1, 28);
    const id = "PLR-" + p.cat + "-" + pad(i + 1, 3);
    const g = GUARDIANS[i % GUARDIANS.length];
    return Object.assign({}, p, {
      id, name: p.first + " " + p.last, ar: AR[p.img] || .55, posShort: POS_SHORT[p.key],
      dob: birthYear + "-" + pad(m) + "-" + pad(d),
      mykad: String(birthYear).slice(2) + pad(m) + pad(d) + "-07-" + pad(ri(100, 9899), 4),
      school: SCHOOLS[i % SCHOOLS.length], status: i === 9 ? "Pending" : (i === 12 ? "Inactive" : "Active"),
      joined: (2022 + (i % 4)) + "-0" + ri(1, 9) + "-1" + ri(0, 9), foot: pick(["Right", "Right", "Left"]),
      guardian: { name: g, email: g.toLowerCase().replace(/[^a-z]+/g, ".") + "@email.com", phone: "01" + ri(0, 9) + "-" + ri(200, 999) + " " + ri(1000, 9999), relation: pick(["Father", "Mother", "Father", "Mother", "Guardian"]) }
    });
  });
  // demo guardian account belongs to the captain
  const DEMO_PLAYER = players.find(p => p.captain) || players[0];
  DEMO_PLAYER.mykad = "140823-07-0583"; DEMO_PLAYER.dob = "2014-08-23";
  DEMO_PLAYER.guardian = { name: "Haziq Rahim", email: "guardian@thehawk.demo", phone: "012-448 2391", relation: "Father" };

  /* ---------- staff ---------- */
  const staff = H.staff.map((s, i) => Object.assign({}, s, {
    id: (s.key === "coach" ? "COA-" : "MGT-") + pad(i + 1, 3), name: s.first + " " + s.last, ar: AR[s.img] || .58,
    email: (s.first + "." + s.last).toLowerCase() + "@thehawk.demo", phone: "01" + ri(1, 9) + "-" + ri(200, 999) + " " + ri(1000, 9999),
    status: i === 4 ? "Invited" : "Active", lastLogin: i === 4 ? "—" : ri(1, 26) + " Oct 2026",
    cats: s.key === "coach" ? [["U10", "U11", "U12"], ["U10", "U11", "U12"], ["All (GK)"], ["All"], ["U6", "U7", "U8", "U9"]][i] || ["All"] : []
  }));
  const coaches = staff.filter(s => s.key === "coach");
  const management = staff.filter(s => s.key === "mgmt");
  coaches[0].email = "coach@thehawk.demo";

  /* ---------- opponents, results, per-player match stats ---------- */
  const OPP = [
    { name: "Penang United", t: "PU", c: ["#c8102e", "#ffffff"] }, { name: "Bukit Mertajam FA", t: "BM", c: ["#0a7d3b", "#f6c400"] },
    { name: "Kepala Batas Jr", t: "KB", c: ["#6b2fa3", "#ffffff"] }, { name: "Juru Rangers", t: "JR", c: ["#e86a10", "#1b1b1b"] },
    { name: "Batu Kawan FC", t: "BK", c: ["#0f4c81", "#ffd23f"] }, { name: "Prai Lions", t: "PL", c: ["#b0122b", "#f2c14e"] },
    { name: "Nibong Tebal SC", t: "NT", c: ["#00796b", "#ffffff"] }, { name: "Seberang Stars", t: "SS", c: ["#283593", "#ff4081"] }
  ];
  const COMPS = ["Liga Remaja Utara", "Piala Belia Seberang Prai", "Penang Junior Cup", "Friendly"];
  const results = [];
  const rd = new Date(2026, 6, 19);
  for (let k = 0; k < 9; k++) {
    rd.setDate(rd.getDate() + ri(7, 12));
    const o = OPP[k % OPP.length], hs = ri(0, 4), as = ri(0, 3);
    results.push({ id: "M-" + pad(k + 1, 3), type: k % 4 === 1 ? "Tournament" : "Match", date: iso(rd), opp: o, comp: k % 4 === 1 ? "Piala Belia Seberang Prai" : pick(COMPS), home: k % 2 === 0, cat: pick(["U10", "U11", "U12"]), score: [hs, as], venue: pick(["Padang Bandar Perda", "Stadium Bandaraya", "Arena Futsal Juru", "Stadium Negeri, Batu Kawan"]) });
  }
  results.reverse(); // newest first
  const matchStats = {};
  players.forEach(p => {
    const rel = p.status === "Inactive" ? .3 : .85;
    matchStats[p.id] = results.map(r => {
      if (rnd() > rel) return { match: r.id, played: false };
      const mins = pick([90, 90, 75, 60, 45, 30]), att = p.key === "fw" ? 1 : p.key === "mf" ? .55 : p.key === "df" ? .15 : 0;
      const goals = rnd() < att * .55 ? ri(1, att > .9 ? 3 : 2) : 0;
      return {
        match: r.id, played: true, mins, goals, assists: rnd() < (p.key === "mf" ? .4 : .18) ? ri(1, 2) : 0,
        shots: p.key === "gk" ? 0 : goals + ri(0, Math.round(att * 4)), passes: ri(p.key === "mf" ? 24 : 12, p.key === "mf" ? 48 : 30),
        duels: ri(2, p.key === "df" ? 11 : 7), dribbles: p.key === "gk" ? 0 : ri(0, p.key === "fw" ? 5 : 3),
        tackles: ri(0, p.key === "df" ? 7 : 3), saves: p.key === "gk" ? ri(2, 8) : 0, rating: +(6 + rnd() * 3.2).toFixed(1)
      };
    });
  });
  const sumStats = list => {
    const t = { apps: 0, mins: 0, goals: 0, assists: 0, shots: 0, passes: 0, duels: 0, dribbles: 0, tackles: 0, saves: 0, rating: 0 };
    list.filter(s => s.played).forEach(s => { t.apps++; ["mins", "goals", "assists", "shots", "passes", "duels", "dribbles", "tackles", "saves"].forEach(k => t[k] += s[k]); t.rating += s.rating; });
    t.rating = t.apps ? +(t.rating / t.apps).toFixed(1) : 0; return t;
  };

  /* ---------- training sessions + attendance ---------- */
  const SESS = [["Ball Mastery & Passing", ["U8", "U9", "U10"]], ["Finishing Clinic", ["U11", "U12"]], ["Match Preparation", ["U10", "U11", "U12"]], ["Fun Footwork", ["U6", "U7"]], ["Goalkeeper Session", ["U10", "U11", "U12"]], ["Conditioning & Agility", ["U9", "U10", "U11", "U12"]], ["Small-sided Games", ["U8", "U9", "U10", "U11", "U12"]]];
  const sessions = [];
  const sd = new Date(2026, 7, 1);
  while (sd < new Date(2026, 9, 26)) {
    const wd = sd.getDay();
    if (wd === 3 || wd === 5 || wd === 6) {
      const s = SESS[sessions.length % SESS.length];
      sessions.push({ id: "S-" + pad(sessions.length + 1, 3), date: iso(sd), wd, title: s[0], cats: s[1], time: wd === 6 ? "8:00 – 10:00 AM" : "5:00 – 6:30 PM", venue: wd === 6 ? "Stadium Bandaraya" : "Padang Bandar Perda", coach: pick(["Coach Hafiz", "Coach Firdaus", "Coach Aizat", "Coach Jason"]) });
    }
    sd.setDate(sd.getDate() + 1);
  }
  const attendance = {}; // sessionId -> { playerId: "P" | "L" | "A" }
  const reliability = {};
  players.forEach(p => { reliability[p.id] = p.status === "Inactive" ? .55 : .8 + rnd() * .17; });
  sessions.forEach(s => {
    const row = {};
    players.forEach(p => {
      if (!s.cats.includes(p.cat) && !(s.title === "Goalkeeper Session" && p.key === "gk")) return;
      const r = rnd(), rel = reliability[p.id];
      row[p.id] = r < rel ? "P" : r < rel + (1 - rel) * .45 ? "L" : "A";
    });
    attendance[s.id] = row;
  });
  // the newest Saturday is still open for the coach to submit
  const openSession = { id: "S-NEW", date: "2026-10-28", wd: 3, title: "Ball Mastery & Passing", cats: ["U8", "U9", "U10", "U11", "U12"], time: "5:00 – 6:30 PM", venue: "Padang Bandar Perda", coach: "Coach Hafiz" };

  /* ---------- evaluations ---------- */
  const ATTR = {
    Technical: ["Ball Control", "Passing", "Shooting", "Dribbling", "First Touch"],
    Tactical: ["Positioning", "Decision Making", "Game Awareness"],
    Physical: ["Speed", "Stamina", "Agility"],
    Character: ["Discipline", "Teamwork", "Attitude", "Coachability"]
  };
  const ATTR_GK = Object.assign({}, ATTR, { Technical: ["Handling", "Shot Stopping", "Diving", "Distribution", "Footwork"] });
  const attrsFor = p => p.key === "gk" ? ATTR_GK : ATTR;
  const COMMENTS = [
    "Great attitude in every session. Keep working on the weaker foot and scanning before receiving the ball.",
    "Strong progress this month. Leads by example and communicates well with teammates.",
    "Good energy and commitment. Next focus: first touch under pressure and staying compact without the ball.",
    "Very coachable. Shows real improvement in decision making in small-sided games."
  ];
  const evaluations = [];
  const EV_MONTHS = [["2026-08-29", "Aug 2026"], ["2026-09-26", "Sep 2026"], ["2026-10-24", "Oct 2026"]];
  players.forEach((p, pi) => {
    const base = 5 + rnd() * 2.2;
    EV_MONTHS.forEach(([date, label], mi) => {
      if (mi === 2 && pi % 2 === 0) return; // October still due for half the squad
      const scores = {};
      Object.entries(attrsFor(p)).forEach(([grp, list]) => list.forEach(a => {
        scores[a] = Math.max(4, Math.min(10, Math.round(base + mi * .55 + (rnd() - .4) * 2.2 + (grp === "Character" ? .8 : 0))));
      }));
      const vals = Object.values(scores);
      evaluations.push({
        id: "EV-" + pad(evaluations.length + 1, 4), player: p.id, date, label, coach: pick(coaches.slice(0, 4)).name, scores,
        overall: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1), comment: COMMENTS[(pi + mi) % COMMENTS.length],
        status: mi < 2 ? "Approved" : (pi % 4 === 1 ? "Approved" : "Pending review")
      });
    });
  });

  /* ---------- tournaments, fixtures ---------- */
  const tournaments = [
    { id: "T-001", name: "Piala Belia Seberang Prai 2026", slug: "piala-belia-2026", start: "2026-11-08", end: "2026-11-09", venue: "Stadium Bandaraya, Seberang Jaya", cats: ["U10", "U12"], fee: 150, maxTeams: 24, teams: 19, deadline: "2026-11-01", status: "Open", host: true },
    { id: "T-002", name: "Hawk Junior Invitational", slug: "hawk-invitational-2026", start: "2026-12-12", end: "2026-12-13", venue: "Padang Bandar Perda", cats: ["U8", "U9", "U10"], fee: 120, maxTeams: 16, teams: 6, deadline: "2026-12-01", status: "Open", host: true },
    { id: "T-003", name: "Karnival Bola Sepak Mini", slug: "karnival-mini-2026", start: "2026-09-20", end: "2026-09-20", venue: "Bukit Mertajam", cats: ["U6", "U7"], fee: 80, maxTeams: 12, teams: 12, deadline: "2026-09-10", status: "Closed", host: true }
  ];
  const fixtures = H.fixtures.map((f, i) => ({
    id: "F-" + pad(i + 1, 3), type: /Piala Belia/.test(f.comp) ? "Tournament" : "Match", date: "2026-11-" + f.day, time: f.time, comp: f.comp, cat: f.cat,
    opp: typeof f.home === "string" ? f.away : f.home, home: f.home === "hawk", venue: f.venue, status: "Scheduled"
  }));

  /* ---------- notifications ---------- */
  const notes = {
    guardian: [["clipboard-check", "New evaluation published", "Oct 2026 report for " + DEMO_PLAYER.first + " is ready.", "2h ago"], ["calendar", "Training moved", "Wed 28 Oct session starts at 5:30 PM.", "1d ago"], ["trophy", "Match day", "Piala Belia kicks off 08 Nov, 08:30 AM.", "3d ago"]],
    coach: [["calendar", "Attendance due", "Submit attendance for Sat 24 Oct.", "1h ago"], ["clipboard-check", "4 evaluations pending", "October reports close on 31 Oct.", "5h ago"], ["ball-football", "Squad list", "Piala Belia squad needs confirming.", "2d ago"]],
    admin: [["id-badge-2", "2 new registrations", "Pending player sign-ups need review.", "30m ago"], ["clipboard-check", "Evaluations awaiting review", "6 reports were submitted by coaches.", "4h ago"], ["ticket", "Tournament filling up", "Piala Belia: 19 / 24 teams registered.", "1d ago"]]
  };

  window.HAWKX = {
    players, coaches, management, staff, results, matchStats, sumStats, sessions, attendance, openSession,
    evaluations, ATTR, attrsFor, tournaments, fixtures, notes, opponents: OPP, demoPlayer: DEMO_PLAYER,
    achievements: H.achievements.map((a, i) => Object.assign({ id: "A-" + pad(i + 1, 3), cat: ["U12", "U10", "All", "U9"][i] || "All" }, a)),
    gallery: H.gallery
  };
})();
