/* THE HAWK — design preview content.
   Everything here is placeholder data for the layout. Real players, stats,
   fixtures and the registration number will come from the club's system later.
   Photos are stock placeholders (Pexels) and must be replaced before launch. */
window.HAWK = {
  club: {
    name: "THE HAWK",
    full: "THE HAWK Elite Football Club",
    email: "thehawkpenang15@gmail.com",
    address: "Seberang Perai Tengah, Pulau Pinang.",
    maps: "https://maps.app.goo.gl/Br2zQYD1K63qnXmc6",
    registration: "C-PNG-18706",
    socials: {
      instagram: "https://www.instagram.com/thehawkpenang?igsh=MWd6OHpkZXBqaG9vbw==",
      facebook: "https://www.facebook.com/share/1DwrWtVMUw/?mibextid=wwXIfr",
      tiktok: "https://www.tiktok.com/@thehawkpenang_?_r=1&_t=ZS-98GCtBNppjN"
    }
  },

  // Next match for the hero countdown (Malaysia time)
  nextMatch: { opponent: "Penang United U12", kickoff: "2026-11-08T08:30:00+08:00" },

  // head = [centre x ratio, head width ratio] measured from each cut-out
  players: [
    { first: "Harith", last: "Iskandar", num: 1,  pos: "Goalkeeper", key: "gk", cat: "U12", age: 12, height: "1.55", img: "p-37455471-gk.webp", head: [0.459, 0.191],
      stats: [480, 11, 0], honours: [2, 1, 1, 0], season: [0, 0, 0, 0, 0, 0], rings: [[71, "Save Rate"], [94, "Attendance"]] },
    { first: "Imran", last: "Hakim", num: 21, pos: "Goalkeeper", key: "gk", cat: "U11", age: 11, height: "1.49", img: "p-37455456-gk.webp", head: [0.47, 0.153],
      stats: [300, 7, 0], honours: [1, 0, 1, 0], season: [0, 0, 0, 0, 0, 0], rings: [[64, "Save Rate"], [88, "Attendance"]] },
    { first: "Danish", last: "Aqil", num: 4, pos: "Defender", key: "df", cat: "U12", age: 12, height: "1.58", img: "p-37455467.webp", head: [0.537, 0.212],
      stats: [610, 13, 1], honours: [2, 2, 1, 0], season: [0, 1, 0, 1, 0, 1], rings: [[83, "Tackle Success"], [96, "Attendance"]] },
    { first: "Arjun", last: "Nair", num: 5, pos: "Defender", key: "df", cat: "U12", age: 12, height: "1.61", img: "p-37455483.webp", head: [0.406, 0.196],
      stats: [585, 12, 2], honours: [2, 1, 0, 1], season: [1, 0, 1, 0, 2, 1], rings: [[79, "Tackle Success"], [91, "Attendance"]] },
    { first: "Irfan", last: "Zikri", num: 3, pos: "Defender", key: "df", cat: "U11", age: 11, height: "1.52", img: "p-37455500.webp", head: [0.461, 0.17],
      stats: [430, 10, 0], honours: [1, 1, 1, 0], season: [0, 0, 1, 0, 0, 1], rings: [[74, "Tackle Success"], [89, "Attendance"]] },
    { first: "Aiman", last: "Haziq", num: 8, pos: "Midfielder", key: "mf", cat: "U12", age: 12, height: "1.57", img: "p-37455449.webp", head: [0.517, 0.176], captain: true,
      stats: [690, 14, 6], honours: [3, 2, 1, 2], season: [2, 4, 3, 6, 5, 7], rings: [[86, "Pass Accuracy"], [98, "Attendance"]] },
    { first: "Ryan", last: "Lim", num: 6, pos: "Midfielder", key: "mf", cat: "U12", age: 12, height: "1.54", img: "p-37455475.webp", head: [0.462, 0.221],
      stats: [560, 12, 3], honours: [2, 1, 0, 0], season: [1, 2, 2, 3, 2, 4], rings: [[81, "Pass Accuracy"], [92, "Attendance"]] },
    { first: "Ethan", last: "Tan", num: 14, pos: "Midfielder", key: "mf", cat: "U11", age: 11, height: "1.50", img: "p-37455488.webp", head: [0.458, 0.199],
      stats: [410, 9, 2], honours: [1, 1, 0, 0], season: [0, 1, 1, 2, 1, 3], rings: [[77, "Pass Accuracy"], [90, "Attendance"]] },
    { first: "Hafiy", last: "Rizqi", num: 16, pos: "Midfielder", key: "mf", cat: "U11", age: 11, height: "1.48", img: "p-37455490.webp", head: [0.571, 0.179],
      stats: [380, 9, 1], honours: [1, 0, 1, 0], season: [0, 1, 0, 1, 1, 2], rings: [[75, "Pass Accuracy"], [87, "Attendance"]] },
    { first: "Rayyan", last: "Hakimi", num: 9, pos: "Forward", key: "fw", cat: "U12", age: 12, height: "1.59", img: "p-37455454.webp", head: [0.453, 0.173],
      stats: [640, 13, 11], honours: [3, 1, 0, 2], season: [3, 5, 4, 8, 7, 11], rings: [[38, "Conversion Rate"], [57, "Shooting Accuracy"]] },
    { first: "Zayyan", last: "Amsyar", num: 7, pos: "Forward", key: "fw", cat: "U12", age: 12, height: "1.56", img: "p-37455473.webp", head: [0.519, 0.205],
      stats: [600, 13, 8], honours: [2, 2, 0, 1], season: [2, 3, 5, 4, 6, 8], rings: [[31, "Conversion Rate"], [49, "Shooting Accuracy"]] },
    { first: "Marcus", last: "Lee", num: 11, pos: "Forward", key: "fw", cat: "U11", age: 11, height: "1.51", img: "p-37455485.webp", head: [0.467, 0.214],
      stats: [450, 10, 5], honours: [1, 1, 0, 1], season: [1, 1, 2, 3, 3, 5], rings: [[27, "Conversion Rate"], [44, "Shooting Accuracy"]] },
    { first: "Kai", last: "Chong", num: 17, pos: "Forward", key: "fw", cat: "U11", age: 11, height: "1.47", img: "p-37455455.webp", head: [0.33, 0.191],
      stats: [350, 8, 3], honours: [1, 0, 0, 1], season: [0, 1, 1, 2, 2, 3], rings: [[24, "Conversion Rate"], [41, "Shooting Accuracy"]] }
  ],

  staff: [
    { first: "Hafiz", last: "Rahman", num: "HC", pos: "Head Coach", key: "coach", img: "s-12775225.webp", head: [0.452, 0.183],
      stats: [9, 640, 3], labels: ["Years Coaching", "Sessions Led", "Licences"], honours: [6, 4, 2, 3], season: [2, 3, 3, 4, 5, 6], rings: [[88, "Win Rate"], [97, "Attendance"]], info: ["AFC C Licence", "Since 2017"] },
    { first: "Mohd", last: "Firdaus", num: "SC", pos: "Senior Coach", key: "coach", img: "s-32454037.webp", head: [0.477, 0.182],
      stats: [7, 410, 2], labels: ["Years Coaching", "Sessions Led", "Licences"], honours: [4, 3, 1, 2], season: [1, 2, 3, 3, 4, 5], rings: [[81, "Win Rate"], [95, "Attendance"]], info: ["U10–U12", "Since 2019"] },
    { first: "Aizat", last: "Hamdan", num: "GK", pos: "Goalkeeper Coach", key: "coach", img: "s-17984122.webp", head: [0.515, 0.161],
      stats: [5, 290, 1], labels: ["Years Coaching", "Sessions Led", "Licences"], honours: [2, 2, 1, 1], season: [1, 1, 2, 2, 3, 3], rings: [[76, "Save Rate"], [93, "Attendance"]], info: ["Goalkeeping", "Since 2021"] },
    { first: "Jason", last: "Tan", num: "FC", pos: "Fitness Coach", key: "coach", img: "s-6551144.webp", head: [0.493, 0.256],
      stats: [6, 350, 2], labels: ["Years Coaching", "Sessions Led", "Licences"], honours: [3, 1, 1, 1], season: [1, 2, 2, 3, 3, 4], rings: [[84, "Fitness Index"], [96, "Attendance"]], info: ["Strength & Speed", "Since 2020"] },
    { first: "Adam", last: "Musa", num: "AC", pos: "Assistant Coach", key: "coach", img: "s-21222662.webp", head: [0.459, 0.154],
      stats: [3, 180, 1], labels: ["Years Coaching", "Sessions Led", "Licences"], honours: [1, 1, 0, 1], season: [0, 1, 1, 1, 2, 2], rings: [[72, "Win Rate"], [90, "Attendance"]], info: ["U6–U9", "Since 2023"] },
    { first: "Ravi", last: "Kumar", num: "CP", pos: "Club President", key: "mgmt", img: "s-32526679.webp", head: [0.605, 0.203],
      stats: [9, 24, 180], labels: ["Years At Club", "Events Run", "Players"], honours: [6, 4, 2, 3], season: [40, 60, 85, 110, 150, 180], rings: [[92, "Retention"], [100, "Commitment"]], info: ["Founder", "Since 2017"] },
    { first: "Siti", last: "Aminah", num: "SE", pos: "Secretary", key: "mgmt", img: "s-33716224.webp", head: [0.501, 0.22],
      stats: [6, 18, 140], labels: ["Years At Club", "Events Run", "Registrations"], honours: [2, 1, 1, 1], season: [20, 35, 60, 80, 110, 140], rings: [[95, "On-time Docs"], [98, "Response"]], info: ["Administration", "Since 2020"] },
    { first: "Nurul", last: "Huda", num: "TM", pos: "Team Manager", key: "mgmt", img: "s-11792251.webp", head: [0.486, 0.254],
      stats: [4, 30, 26], labels: ["Years At Club", "Tournaments", "Trips Planned"], honours: [3, 2, 1, 0], season: [3, 5, 8, 12, 18, 26], rings: [[90, "Logistics"], [97, "Attendance"]], info: ["Match Days", "Since 2022"] }
  ],

  // shared by the player detail view ("Soon matches")
  soonMatches: [
    { date: "08 NOV", time: "08:30", comp: "Piala Belia", home: "hawk", away: { name: "Penang Utd", c: ["#c8102e", "#ffffff"], t: "PU" } },
    { date: "15 NOV", time: "10:00", comp: "Junior Cup", home: { name: "Bukit Mertajam", c: ["#0a7d3b", "#f6c400"], t: "BM" }, away: "hawk" }
  ],

  fixtures: [
    { day: "08", mon: "NOV", wd: "SUN", time: "08:30 AM", comp: "Piala Belia Seberang Prai", cat: "U12", home: "hawk", away: { name: "Penang United", c: ["#c8102e", "#ffffff"], t: "PU" }, venue: "Stadium Bandaraya, Seberang Jaya" },
    { day: "15", mon: "NOV", wd: "SUN", time: "10:00 AM", comp: "Penang Junior Cup", cat: "U10", home: { name: "Bukit Mertajam FA", c: ["#0a7d3b", "#f6c400"], t: "BM" }, away: "hawk", venue: "Stadium Negeri, Batu Kawan" },
    { day: "29", mon: "NOV", wd: "SUN", time: "09:00 AM", comp: "Liga Remaja Utara", cat: "U11", home: "hawk", away: { name: "Kepala Batas Jr", c: ["#6b2fa3", "#ffffff"], t: "KB" }, venue: "Padang Bandar Perda" }
  ],

  training: [
    { day: "28", mon: "OCT", wd: "WED", time: "5:00 – 6:30 PM", title: "Ball Mastery & Passing", cats: ["U8", "U9", "U10"], venue: "Padang Bandar Perda", coach: "Coach Hafiz" },
    { day: "30", mon: "OCT", wd: "FRI", time: "8:00 – 10:00 AM", title: "Finishing Clinic", cats: ["U11", "U12"], venue: "Stadium Bandaraya", coach: "Coach Firdaus" },
    { day: "31", mon: "OCT", wd: "SAT", time: "9:00 – 10:00 AM", title: "Fun Footwork (Little Hawks)", cats: ["U6", "U7"], venue: "Padang Bandar Perda", coach: "Coach Adam" },
    { day: "02", mon: "NOV", wd: "MON", time: "5:00 – 7:00 PM", title: "Match Preparation", cats: ["U10", "U11", "U12"], venue: "Arena Futsal Juru", coach: "Coach Hafiz" }
  ],

  achievements: [
    { year: "2026", title: "Champions", comp: "Piala Remaja Pulau Pinang U12", place: "Batu Kawan", date: "17 Aug 2026", kind: "cup" },
    { year: "2026", title: "Runners-up", comp: "MSN Junior League U10", place: "Kepala Batas", date: "09 May 2026", kind: "medal" },
    { year: "2025", title: "Fair Play Award", comp: "Penang Junior Cup", place: "Seberang Jaya", date: "06 Dec 2025", kind: "shield" },
    { year: "2025", title: "Champions", comp: "Karnival Bola Sepak U9", place: "Bukit Mertajam", date: "20 Sep 2025", kind: "cup" }
  ],

  gallery: [
    { img: "g-8941578.jpg", cap: "Matchday walk-out", tag: "U12" },
    { img: "g-8941651.jpg", cap: "Finishing drills", tag: "Training" },
    { img: "g-8941613.jpg", cap: "Team talk", tag: "Coaching" },
    { img: "g-7307392.jpg", cap: "Sunset session", tag: "Training" },
    { img: "g-8941579.jpg", cap: "Ready for kick-off", tag: "U10" },
    { img: "g-10347890.jpg", cap: "Keeper training", tag: "GK" },
    { img: "g-8941620.jpg", cap: "Little Hawks festival", tag: "U7" },
    { img: "g-26546638.jpg", cap: "Small-sided games", tag: "Training" }
  ]
};
