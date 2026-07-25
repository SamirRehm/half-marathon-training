/* ══════════════════════════════════════════════════════════════════════════
   Split — half-marathon training instrument
   Reads static JSON produced by the daily routine (see the generate-day-data
   skill) and derives every metric client-side. No build step.
   ══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ── constants & tiny helpers ─────────────────────────────────────────── */
const RACE = "2026-10-31";
const KM2MI = 0.621371;
const $ = (id) => document.getElementById(id);
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const pad = (n) => String(n).padStart(2, "0");
const dstr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseD = (s) => new Date(s + "T00:00:00");
const TODAY = dstr(new Date());
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fx = (v, f = 0) => (v == null || !isFinite(v) ? "–" : (+v).toFixed(f));
const signed = (v, f = 1) => (v == null ? "–" : (v > 0 ? "+" : "") + (+v).toFixed(f));
const fmtDur = (s) => { if (s == null) return "–"; s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60; return h ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`; };
const paceStr = (spk) => { if (!isFinite(spk) || spk <= 0) return "–"; const m = Math.floor(spk / 60), s = Math.round(spk % 60); return s === 60 ? `${m + 1}:00` : `${m}:${pad(s)}`; };
const v2pace = (v) => (v > 0.3 ? 1000 / v : null);
const timeToSec = (t) => { if (!t) return null; const p = t.split(":").map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; };
const secToHMS = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = Math.round(s % 60); return `${h}:${pad(m)}:${pad(ss)}`; };
const cadSpm = (c) => (c == null ? null : c < 120 ? c * 2 : c);
const sleepWord = (q) => ({ 1: "excellent", 2: "good", 3: "fair", 4: "poor" }[q] || "–");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* series colours — assigned per entity, fixed, never cycled */
const C = {};
const STATUS = {};
function loadColors() {
  Object.assign(C, {
    blue: css("--s-blue"), green: css("--s-green"), magenta: css("--s-magenta"),
    yellow: css("--s-yellow"), aqua: css("--s-aqua"), orange: css("--s-orange"),
    violet: css("--s-violet"), red: css("--s-red"),
    o: [css("--o1"), css("--o2"), css("--o3"), css("--o4")],
    ink: css("--ink"), ink2: css("--ink2"), mut: css("--mut"), grid: css("--grid"), rule2: css("--rule2"),
    surface: css("--surface"), sunken: css("--sunken"),
  });
  Object.assign(STATUS, { ok: css("--ok"), warn: css("--warn"), serious: css("--serious"), crit: css("--crit") });
}
/* zone colours: ordinal ramp extended over 7 zones (one hue, brightness rises) */
const ZONE_COL = ["#1c4a86", "#256abf", "#3987e5", "#5598e7", "#86b6ef", "#b7d3f6", "#e2edfd"];
const BUCKETS = [
  { key: "easy", label: "easy", max: 80 },
  { key: "steady", label: "steady", max: 88 },
  { key: "threshold", label: "threshold", max: 96 },
  { key: "hard", label: "hard", max: Infinity },
];
const bucketOf = (i) => (i == null || i < 80 ? "easy" : i < 88 ? "steady" : i < 96 ? "threshold" : "hard");
const bucketCol = (k) => C.o[BUCKETS.findIndex((b) => b.key === k)];

/* status helper — colour is never the only channel; each returns glyph+word too */
const S_GLYPH = { ok: "●", warn: "▲", serious: "▲", crit: "■" };
function chip(state, word, title) {
  return `<span class="chip ${state}" ${title ? `title="${esc(title)}"` : ""}><span class="g">${S_GLYPH[state]}</span>${esc(word)}</span>`;
}

/* ── state ────────────────────────────────────────────────────────────── */
let LOG = { days: [] }, ACT = { activities: [] }, ATH = null, WELL = { days: [] };
let byDate = {}, csvByDate = {}, wellByDate = {}, streams = {}, missing = {};
let CSV_MAX = "0000";
let curY, curM, openDate = null;
let panelCharts = [], viewCharts = {}, builtViews = {};
let volRange = "16w";

/* ── load ─────────────────────────────────────────────────────────────── */
const j = (u, fb) => fetch(u).then((r) => (r.ok ? r.json() : fb)).catch(() => fb);
Promise.all([
  j("./daily_log.json", { days: [] }),
  j("./activities.json", { activities: [] }),
  j("./athlete.json", null),
  j("./wellness.json", { days: [] }),
  j("./streams/index.json", { dates: [] }),
]).then(([log, act, ath, well, idx]) => {
  LOG = log || { days: [] }; ACT = act || { activities: [] }; ATH = ath; WELL = well || { days: [] };
  (LOG.days || []).forEach((d) => (byDate[d.date] = d));
  (ACT.activities || []).forEach((a) => { (csvByDate[a.date] = csvByDate[a.date] || []).push(a); if (a.date > CSV_MAX) CSV_MAX = a.date; });
  (WELL.days || []).forEach((w) => (wellByDate[w.d] = w));
  (idx.dates || []).forEach((d) => { if (!(d in streams)) streams[d] = undefined; });
  loadColors();
  boot();
});
const streamDates = () => Object.keys(streams);
async function getStreams(date) {
  if (streams[date]) return streams[date];
  if (missing[date]) return null;
  try { const r = await fetch(`./streams/${date}.json`); if (!r.ok) throw 0; const v = await r.json(); streams[date] = v; return v; }
  catch (e) { missing[date] = 1; return null; }
}
const allStreams = () => Promise.all(streamDates().map(getStreams));

/* ══ analytics library ══════════════════════════════════════════════════ */
function smooth(a, w) {
  if (!a) return a; const n = a.length, out = new Array(n), h = Math.floor(w / 2);
  for (let i = 0; i < n; i++) { let s = 0, c = 0; for (let k = Math.max(0, i - h); k <= Math.min(n - 1, i + h); k++) { const v = a[k]; if (v != null && isFinite(v)) { s += v; c++; } } out[i] = c ? s / c : null; }
  return out;
}
/* Minetti (2002) metabolic cost of running at gradient i; C(0)=3.6 J/kg/m */
const minettiC = (i) => ((155.4 * i - 30.4) * i - 43.3) * i * i * i + 46.3 * i * i + 19.5 * i + 3.6;
function gapSeries(v, grade, mask, icuGap) {
  let g;
  if (grade) {
    g = v.map((x, i) => {
      if (x == null) return null;
      const gr = grade[i]; if (gr == null) return x;
      let ii = clamp(gr / 100, -0.3, 0.3);
      let f = minettiC(ii) / 3.6;
      if (ii < 0) f = 1 + 0.6 * (f - 1); // damp downhill credit toward Strava-model behaviour
      return x * clamp(f, 0.75, 1.9);
    });
  } else g = v.slice();
  if (icuGap) { // calibrate the level to Intervals' own activity GAP so splits reconcile
    let s = 0, c = 0; g.forEach((x, i) => { if (mask[i] && x != null) { s += x; c++; } });
    if (c) { const k = icuGap / (s / c); if (isFinite(k) && Math.abs(k - 1) < 0.25) g = g.map((x) => (x == null ? null : x * k)); }
  }
  return g;
}
const movingMask = (v) => v.map((x) => x != null && x > 0.5);
const dt = (t, i) => (i ? clamp(t[i] - t[i - 1], 0, 10) : 1); // clamp recording gaps
function kmSplits(st, gapv) {
  const { t, d, v, hr, alt } = st; if (!t || !d) return [];
  const altS = alt ? smooth(alt, 9) : null, out = [];
  let k = 1000, secs = 0, hs = 0, ht = 0, gs = 0, gt = 0, gain = 0;
  const flush = (km, dist, partial) => { out.push({ km, secs, pace: secs / dist, gap: gt ? 1000 / (gs / gt) : null, hr: ht ? hs / ht : null, gain, partial }); secs = 0; hs = 0; ht = 0; gs = 0; gt = 0; gain = 0; };
  const add = (i, w) => { const _d = dt(t, i) * w; secs += _d; if (hr && hr[i] != null) { hs += hr[i] * _d; ht += _d; } if (gapv && gapv[i] != null) { gs += gapv[i] * _d; gt += _d; } };
  for (let i = 1; i < t.length; i++) {
    if (v && v[i] != null && v[i] <= 0.5) continue; // stopped: no time, no weight
    if (altS && altS[i] != null && altS[i - 1] != null) { const da = altS[i] - altS[i - 1]; if (da > 0) gain += da; }
    const dd = Math.max(0, d[i] - (d[i - 1] ?? 0));
    if (d[i] >= k && dd > 0) { const fr = clamp((k - d[i - 1]) / dd, 0, 1); add(i, fr); flush(k / 1000, 1, false); add(i, 1 - fr); k += 1000; }
    else add(i, 1);
  }
  const last = d[d.length - 1], tail = (last - (k - 1000)) / 1000;
  if (tail >= 0.2) flush(+(last / 1000).toFixed(2), tail, true);
  return out;
}
function zoneTimes(t, hr, zones) {
  const z = new Array(zones.length).fill(0);
  for (let i = 1; i < t.length; i++) { const h = hr[i]; if (h == null) continue; let k = zones.findIndex((u) => h <= u); if (k < 0) k = zones.length - 1; z[k] += dt(t, i); }
  return z;
}
function decouple(st, gapv) {
  const { t, v, hr } = st; if (!t || !v || !hr) return null;
  const mask = movingMask(v); let mov = 0;
  for (let i = 1; i < t.length; i++) if (mask[i]) mov += dt(t, i);
  if (mov < 12 * 60) return null;
  const half = mov / 2; let acc = 0, s1 = 0, h1 = 0, c1 = 0, s2 = 0, h2 = 0, c2 = 0, v1 = 0, v2 = 0;
  for (let i = 1; i < t.length; i++) {
    if (!mask[i] || hr[i] == null) continue;
    const _d = dt(t, i), g = gapv && gapv[i] != null ? gapv[i] : v[i]; acc += _d;
    if (acc <= half) { s1 += g * _d; h1 += hr[i] * _d; c1 += _d; v1 += v[i] * _d; }
    else { s2 += g * _d; h2 += hr[i] * _d; c2 += _d; v2 += v[i] * _d; }
  }
  if (!c1 || !c2) return null;
  const ef1 = (s1 / c1) / (h1 / c1), ef2 = (s2 / c2) / (h2 / c2);
  return { dec: ((ef1 - ef2) / ef1) * 100, ef1: ef1 * 60, ef2: ef2 * 60, negSplit: v2 / c2 > (v1 / c1) * 1.02, minutes: mov / 60 };
}
function efOverall(st, gapv) {
  const { t, v, hr } = st; if (!t || !v || !hr) return null;
  const mask = movingMask(v); let s = 0, h = 0, c = 0;
  for (let i = 1; i < t.length; i++) { if (!mask[i] || hr[i] == null) continue; const _d = dt(t, i); s += (gapv && gapv[i] != null ? gapv[i] : v[i]) * _d; h += hr[i] * _d; c += _d; }
  return c ? (s / c) * 60 / (h / c) : null; // metres per beat
}
function normPower(t, w) {
  if (!t || !w) return null;
  const ds = []; for (let i = 1; i < Math.min(t.length, 60); i++) ds.push(t[i] - t[i - 1]);
  ds.sort((a, b) => a - b); const md = ds[Math.floor(ds.length / 2)] || 1;
  const win = Math.max(1, Math.round(30 / md)); const roll = []; const buf = []; let s = 0;
  for (let i = 0; i < t.length; i++) { const x = w[i] != null ? w[i] : 0; buf.push(x); s += x; if (buf.length > win) s -= buf.shift(); if (i >= win - 1) roll.push(s / win); }
  if (roll.length < 10) return null;
  return Math.round(Math.pow(roll.reduce((a, x) => a + x ** 4, 0) / roll.length, 0.25));
}
/* session classification — ICU auto-detected intervals preferred, stream fallback */
function classify(a) {
  const m = a.meta || {}, st = a.streams || {};
  if (a.type !== "Run") return { kind: "xt", spans: [], segs: null };
  const dur = () => (m.moving_s >= 3600 || m.distance_m >= 12000 ? "long" : m.intensity == null || m.intensity < 70 ? "recovery" : m.intensity < 80 ? "easy" : m.intensity < 88 ? "steady" : "threshold");
  const iv = (a.intervals || []).filter((x) => x.i0 != null && x.i1 != null);
  /* A session below ~80% of threshold is not a workout however much its splits
     wander — on a hilly easy run the autolap spread alone will happily fake one.
     Intervals' calibrated intensity is the absolute gate; structure detection
     only runs above it. */
  const couldBeWorkout = m.intensity == null || m.intensity >= 80;
  if (iv.length >= 2 && couldBeWorkout) {
    const spd = (x) => x.gap ?? x.v; // grade-adjusted where available: terrain-neutral structure
    const solid = iv.filter((x) => (x.mov || 0) >= 30 && spd(x) > 0);
    if (solid.length >= 2) {
      const vv = solid.map(spd), mn = Math.min(...vv), mx = Math.max(...vv);
      if (mx - mn >= 0.55) { // a genuine gear change (~40+ s/km) — not hill drift on a steady run
        const thr = mn + 0.35 * (mx - mn), isW = (x) => spd(x) > thr && (x.mov || 0) >= 30;
        const reps = iv.filter(isW);
        const slow = solid.filter((x) => !isW(x));
        const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + spd(x), 0) / xs.length : null);
        const wM = mean(reps), sM = mean(slow);
        /* the fast group must stand clear of the slow group — a continuous run's
           autolaps cluster around one pace and fail this by construction */
        if (reps.length && (!sM || wM / sM >= 1.1)) {
          const f = iv.indexOf(reps[0]), l = iv.indexOf(reps[reps.length - 1]);
          const segs = { wu: iv.slice(0, f), reps, recs: iv.slice(f, l + 1).filter((x) => !isW(x)), cd: iv.slice(l + 1) };
          const spans = reps.map((x) => ({ i0: x.i0, i1: x.i1 }));
          const movs = reps.map((x) => x.mov || 0);
          const med = movs.slice().sort((a, b) => a - b)[Math.floor(movs.length / 2)];
          const recMov = segs.recs.reduce((s, x) => s + (x.mov || 0), 0), repMov = movs.reduce((a, b) => a + b, 0);
          if (recMov < Math.max(60, repMov * 0.15)) return { kind: "tempo", spans, segs };
          if (reps.length >= 3 && med <= 420) return { kind: "intervals", spans, segs };
          if (Math.max(...movs) >= 420) return { kind: "tempo", spans, segs };
        }
      }
    }
  }
  if (!st.v || !st.t || st.t.length < 60 || !couldBeWorkout) return { kind: dur(), spans: [], segs: null };
  const vs = smooth(st.v, 9), mask = movingMask(st.v);
  const mv = vs.filter((x, i) => mask[i] && x != null).sort((a, b) => a - b);
  if (mv.length < 50) return { kind: dur(), spans: [], segs: null };
  const q = (p) => mv[Math.floor(p * (mv.length - 1))];
  const p25 = q(0.25), p75 = q(0.75), med = q(0.5);
  /* same bar as the interval branch: a wide absolute spread, not just any wobble */
  if (!med || p75 - p25 < 0.5) return { kind: dur(), spans: [], segs: null };
  const thr = (p25 + p75) / 2, raw = []; let s = -1;
  for (let i = 0; i < vs.length; i++) {
    const on = mask[i] && vs[i] != null && vs[i] > thr;
    if (on && s < 0) s = i;
    if ((!on || i === vs.length - 1) && s >= 0) { if (st.t[i] - st.t[s] >= 40) raw.push({ i0: s, i1: i }); s = -1; }
  }
  const spans = []; raw.forEach((sp) => { const L = spans[spans.length - 1]; if (L && st.t[sp.i0] - st.t[L.i1] < 20) L.i1 = sp.i1; else spans.push({ ...sp }); });
  const durs = spans.map((sp) => st.t[sp.i1] - st.t[sp.i0]);
  if (spans.length >= 3) { const m2 = durs.slice().sort((a, b) => a - b)[Math.floor(durs.length / 2)]; if (m2 >= 35 && m2 <= 720) return { kind: "intervals", spans, segs: null }; }
  const workT = durs.reduce((a, b) => a + b, 0);
  if (spans.length && Math.max(...durs) >= 480 && (!m.moving_s || workT / m.moving_s <= 0.85)) return { kind: "tempo", spans: spans.filter((sp) => st.t[sp.i1] - st.t[sp.i0] >= 240), segs: null };
  return { kind: dur(), spans: [], segs: null };
}
const KIND = { intervals: "intervals", tempo: "tempo", threshold: "threshold effort", long: "long run", steady: "steady", easy: "easy", recovery: "recovery", xt: "cross-train" };
const isWorkout = (k) => ["intervals", "tempo", "threshold"].includes(k);

/* ── merged activity model (CSV history + stream era + log fallback) ──── */
function mergedActivities() {
  const out = [];
  (ACT.activities || []).forEach((a) => out.push({ date: a.date, km: a.km, mi: a.mi, sec: a.sec, hr: a.hr, intensity: a.intensity, load: a.load, name: a.name, type: "Run" }));
  const seen = {};
  streamDates().forEach((d) => {
    if (d <= CSV_MAX) return; const f = streams[d]; if (!f) return;
    f.activities.forEach((a) => { out.push({ date: d, km: a.meta.distance_m / 1000, mi: (a.meta.distance_m / 1000) * KM2MI, sec: a.meta.moving_s, hr: a.meta.avg_hr, intensity: a.meta.intensity, load: a.meta.load, name: a.name, type: a.type, zones: a.meta.hr_zone_secs }); seen[d] = 1; });
  });
  (LOG.days || []).forEach((dd) => {
    if (dd.date <= CSV_MAX || seen[dd.date] || !dd.activity) return;
    const a = dd.activity;
    out.push({ date: dd.date, km: a.km, mi: a.mi, sec: a.sec, hr: a.hr, intensity: a.intensity, load: a.load, name: a.name, type: a.km && a.pace_per_km ? "Run" : "Run", zones: a.hr_zone_sec });
  });
  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}
const weekStart = (ds) => { const d = parseD(ds); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dstr(d); };
function weeklyAgg(acts) {
  const wk = {};
  acts.forEach((a) => {
    if (a.type && a.type !== "Run") return;
    const w = weekStart(a.date);
    const r = wk[w] || (wk[w] = { week: w, mi: 0, sec: 0, load: 0, days: {}, b: { easy: 0, steady: 0, threshold: 0, hard: 0 }, zEasy: 0, zAll: 0, longest: 0 });
    r.mi += a.mi || 0; r.sec += a.sec || 0; r.load += a.load || 0; r.days[a.date] = 1;
    r.b[bucketOf(a.intensity)] += a.mi || 0;
    if ((a.km || 0) > r.longest) r.longest = a.km || 0;
    if (a.zones && a.zones.length >= 2) { const tot = a.zones.reduce((x, y) => x + y, 0); if (tot) { r.zEasy += (a.zones[0] || 0) + (a.zones[1] || 0); r.zAll += tot; } }
  });
  const keys = Object.keys(wk).sort(); if (!keys.length) return [];
  const out = [], cur = parseD(keys[0]), end = parseD(keys[keys.length - 1]);
  while (cur <= end) {
    const w = dstr(cur);
    out.push(wk[w] || { week: w, mi: 0, sec: 0, load: 0, days: {}, b: { easy: 0, steady: 0, threshold: 0, hard: 0 }, zEasy: 0, zAll: 0, longest: 0 });
    cur.setDate(cur.getDate() + 7);
  }
  out.forEach((w) => { w.runDays = Object.keys(w.days).length; w.easyShare = w.mi > 0 ? (w.b.easy / w.mi) * 100 : null; w.zShare = w.zAll ? (w.zEasy / w.zAll) * 100 : null; });
  return out;
}
let WEEKS = [], WKBY = {};
function buildWeeks() { WEEKS = weeklyAgg(mergedActivities()); WKBY = {}; WEEKS.forEach((w) => (WKBY[w.week] = w)); }
/* consecutive uninterrupted weeks (>=3 run-days and >=60% of the trailing median volume) */
function streakWeeks() {
  const w = WEEKS.filter((x) => x.week <= weekStart(TODAY));
  let n = 0;
  for (let i = w.length - 1; i >= 0; i--) {
    const x = w[i];
    if (i === w.length - 1 && x.week === weekStart(TODAY)) continue; // current partial week doesn't count yet
    if (x.runDays >= 3 && x.mi >= 8) n++; else break;
  }
  return n;
}
const lastScored = () => { const s = (LOG.days || []).filter((d) => d.status !== "prescribed" && d.score != null); return s.length ? s[s.length - 1] : null; };
const phaseFor = (ds) => (ATH?.phases || []).find((p) => ds >= p.from && ds <= p.to) || null;

/* ── boot / routing ───────────────────────────────────────────────────── */
async function boot() {
  const days = Math.max(0, Math.ceil((parseD(RACE) - new Date()) / 864e5));
  $("cdDays").textContent = days;
  const ph = phaseFor(TODAY);
  $("cdPhase").textContent = ph ? ph.label + " phase" : "";
  const wkNo = Math.max(1, Math.ceil((parseD(TODAY) - parseD(ATH?.phases?.[0]?.from || "2026-07-04")) / 6048e5) + 1);
  $("cdWeek").textContent = "wk " + wkNo;
  renderPhaseRail();
  await allStreams();      // few files by design; enables week/analysis math up front
  buildWeeks();
  wireTabs(); wirePanel(); wireMethods();
  route(); window.addEventListener("hashchange", route);
}
function renderPhaseRail() {
  const ph = ATH?.phases || []; if (!ph.length) return;
  const t0 = parseD(ph[0].from), t1 = parseD(RACE), span = t1 - t0, now = new Date();
  $("phases").innerHTML = ph.map((p) => {
    const from = parseD(p.from), to = parseD(p.to);
    const w = ((to - from + 864e5) / span) * 100;
    const done = now > to ? 100 : now < from ? 0 : ((now - from) / (to - from)) * 100;
    const on = now >= from && now <= to;
    const mark = on ? `<span class="today-mark" style="left:${clamp(done, 0, 99)}%"></span>` : "";
    return `<div class="ph ${on ? "on" : ""}" style="flex:${w}">
      <div class="bar"><i style="width:${done}%;background:${on ? C.yellow : done ? C.blue : "transparent"};opacity:${done && !on ? 0.55 : 1}"></i></div>
      ${mark}<div class="lb">${esc(p.label)}</div></div>`;
  }).join("");
}
function route() {
  const h = location.hash || "#/today";
  const mDay = h.match(/^#\/day\/(\d{4}-\d{2}-\d{2})/);
  const mCal = h.match(/^#\/calendar(?:\/(\d{4})-(\d{2}))?/);
  if (mDay) { const d = parseD(mDay[1]); curY = d.getFullYear(); curM = d.getMonth(); show("calendar"); renderCalendar(); openDay(mDay[1]); return; }
  closePanel(false);
  if (h.startsWith("#/analysis")) show("analysis");
  else if (h.startsWith("#/goal")) show("goal");
  else if (h.startsWith("#/calendar")) {
    if (mCal && mCal[1]) { curY = +mCal[1]; curM = +mCal[2] - 1; }
    else if (curY == null) { const d = parseD(TODAY); curY = d.getFullYear(); curM = d.getMonth(); }
    show("calendar"); renderCalendar();
  } else show("today");
}
function show(v) {
  document.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.v === v)));
  ["today", "calendar", "analysis", "goal"].forEach((k) => $("v-" + k).classList.toggle("hidden", k !== v));
  if (v === "today" && !builtViews.today) { builtViews.today = 1; renderToday(); }
  if (v === "analysis" && !builtViews.analysis) { builtViews.analysis = 1; renderAnalysis(); }
  if (v === "goal" && !builtViews.goal) { builtViews.goal = 1; renderGoal(); }
}
function wireTabs() {
  document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => { location.hash = t.dataset.v === "calendar" ? `#/calendar/${curY ?? parseD(TODAY).getFullYear()}-${pad((curM ?? parseD(TODAY).getMonth()) + 1)}` : "#/" + t.dataset.v; }));
  $("prevM").onclick = () => { curM--; if (curM < 0) { curM = 11; curY--; } location.hash = `#/calendar/${curY}-${pad(curM + 1)}`; };
  $("nextM").onclick = () => { curM++; if (curM > 11) { curM = 0; curY++; } location.hash = `#/calendar/${curY}-${pad(curM + 1)}`; };
  $("goToday").onclick = () => { const d = parseD(TODAY); curY = d.getFullYear(); curM = d.getMonth(); location.hash = `#/calendar/${curY}-${pad(curM + 1)}`; };
}
function wireMethods() { $("methBtn").onclick = () => $("meth").showModal(); $("methClose").onclick = () => $("meth").close(); }

/* ── sparkline ────────────────────────────────────────────────────────── */
function spark(vals, w = 74, h = 26, color) {
  const v = vals.filter((x) => x != null); if (v.length < 2) return "";
  const mn = Math.min(...v), mx = Math.max(...v), rg = mx - mn || 1;
  const pts = vals.map((x, i) => (x == null ? null : [(i / (vals.length - 1)) * w, h - 2 - ((x - mn) / rg) * (h - 6)])).filter(Boolean);
  return `<svg class="spark" width="${w}" height="${h}" aria-hidden="true"><polyline fill="none" stroke="${color || C.blue}" stroke-width="1.6" stroke-linejoin="round" points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ")}"/></svg>`;
}

/* ══ TODAY ══════════════════════════════════════════════════════════════ */
function renderToday() {
  const today = byDate[TODAY], last = lastScored() || {}, lw = last.wellness || {};
  const wd = WELL.days || [], wLast = wd[wd.length - 1] || {};
  const ph = phaseFor(TODAY);

  /* prescription / result card */
  const rx = $("rxCard");
  if (today && today.status === "prescribed" && today.planned) {
    rx.innerHTML = `<div class="rx"><div class="lead">today · ${esc(today.dow || "")} ${ph ? "· " + esc(ph.label) + " phase" : ""}</div>
      <div class="sess">${esc(today.planned)}</div>
      ${today.plan_rationale ? `<div class="why">${esc(today.plan_rationale)}</div>` : ""}</div>`;
  } else if (today && today.activity) {
    const a = today.activity;
    rx.innerHTML = `<div class="rx done"><div class="lead">today · logged</div>
      <div class="sess">${fx(a.km, 2)} km in ${fmtDur(a.sec)}${a.pace_per_km ? ` · ${esc(a.pace_per_km)}/km` : ""}</div>
      ${today.entry ? `<div class="why">${esc(today.entry)}</div>` : ""}</div>`;
  } else {
    const nx = last.note_next;
    rx.innerHTML = `<div class="rx"><div class="lead">today · not yet prescribed</div>
      <div class="sess">${nx ? esc(nx) : "Awaiting this morning's routine"}</div>
      <div class="why">The daily routine writes today's session each morning after the overnight recovery sync. This card shows the last plan on file until then.</div></div>`;
  }

  /* the call + gaps to goal */
  const predS = timeToSec(last.pred_half || last.prediction);
  $("callNow").textContent = last.pred_half || last.prediction || "–";
  const first = (LOG.days || []).find((d) => d.pred_half || d.prediction);
  const firstS = timeToSec(first?.pred_half || first?.prediction);
  if (predS && firstS) {
    const dlt = firstS - predS;
    $("callTrend").innerHTML = `${dlt > 0 ? chip("ok", `−${secToHMS(dlt).replace(/^0:/, "")} since ${esc((first.date || "").slice(5))}`) : chip("warn", "no change yet")}
      <span>σ ≈ 3% · raced-today odds ~0% by design</span>`;
  }
  $("gapList").innerHTML = (ATH?.race?.goals || []).map((g) => {
    const gap = predS ? predS - g.secs : null;
    const st = gap == null ? "" : gap <= 0 ? "ok" : gap < 300 ? "warn" : "serious";
    return `<div class="gapline"><span class="nm">${esc(g.label)}</span>
      <span class="num" style="color:var(--mut);font-size:11px">${esc(g.time)}</span>
      <span class="gp">${gap == null ? "–" : gap <= 0 ? "reached" : "+" + secToHMS(gap).replace(/^0:/, "")}</span></div>`;
  }).join("");

  /* this morning */
  const hrvB = ATH?.physiology?.hrv_baseline_ms || 87;
  const [r0, r1] = ATH?.physiology?.resting_hr_baseline || [46, 48];
  const form = wLast.ctl != null && wLast.atl != null ? wLast.ctl - wLast.atl : null;
  const hrvSt = wLast.hrv == null ? null : wLast.hrv >= hrvB - 4 ? "ok" : wLast.hrv >= hrvB - 13 ? "warn" : "crit";
  const rhrSt = wLast.rhr == null ? null : wLast.rhr <= r1 ? "ok" : wLast.rhr <= r1 + 3 ? "warn" : "crit";
  const slH = wLast.sleepSecs ? wLast.sleepSecs / 3600 : null;
  const slSt = slH == null ? null : slH >= 7.5 ? "ok" : slH >= 6.5 ? "warn" : "crit";
  const fmSt = form == null ? null : form > -10 ? "ok" : form > -20 ? "warn" : "crit";
  $("readyTiles").innerHTML = [
    tile("HRV", wLast.hrv != null ? wLast.hrv : "–", "ms", `baseline ${hrvB}`, hrvSt, hrvSt === "ok" ? "recovered" : hrvSt === "warn" ? "a little low" : "suppressed", wd.slice(-21).map((x) => x.hrv), C.aqua),
    tile("resting HR", wLast.rhr != null ? wLast.rhr : "–", "bpm", `floor ${r0}–${r1}`, rhrSt, rhrSt === "ok" ? "at floor" : rhrSt === "warn" ? "slightly up" : "elevated", wd.slice(-21).map((x) => x.rhr), C.magenta),
    tile("sleep", slH != null ? slH.toFixed(1) : "–", "h", wLast.sleepScore ? `score ${wLast.sleepScore} · ${sleepWord(wLast.sleepQ)}` : "not logged", slSt, slSt === "ok" ? "good" : slSt === "warn" ? "short" : "poor", wd.slice(-21).map((x) => (x.sleepSecs ? x.sleepSecs / 3600 : null)), C.blue),
    tile("form", form != null ? signed(form, 1) : "–", "", `CTL ${fx(wLast.ctl, 1)} · ATL ${fx(wLast.atl, 1)}`, fmSt, fmSt === "ok" ? "fresh enough" : fmSt === "warn" ? "carrying fatigue" : "deep hole", wd.slice(-21).map((x) => (x.ctl != null && x.atl != null ? x.ctl - x.atl : null)), C.violet),
    tile("VO₂max est", ATH?.physiology?.vo2max_now ?? "–", "", `peak ${ATH?.physiology?.vo2max_peak ?? "–"} (${esc(ATH?.physiology?.vo2max_peak_when || "")})`, null, null, wd.slice(-30).map((x) => x.vo2max), C.aqua),
  ].join("");

  /* week so far */
  const wkNow = WKBY[weekStart(TODAY)] || { mi: 0, runDays: 0, longest: 0, b: { easy: 0, steady: 0, threshold: 0, hard: 0 }, easyShare: null };
  const tgt = ph?.vol_mi || [20, 28];
  const pctv = clamp((wkNow.mi / tgt[1]) * 100, 0, 100);
  const lgTgt = ph?.long_km || [12, 16];
  $("weekTiles").innerHTML = [
    `<div class="tile"><div class="k">volume this week</div><div class="v num">${wkNow.mi.toFixed(1)}<small> mi</small></div>
      <div class="meter"><i style="width:${pctv}%;background:${wkNow.mi >= tgt[0] ? C.blue : C.o[0]}"></i></div>
      <div class="s">${ph ? `${esc(ph.label)} target ${tgt[0]}–${tgt[1]} mi` : ""}</div></div>`,
    `<div class="tile"><div class="k">run days</div><div class="v num">${wkNow.runDays}<small> / 7</small></div><div class="s">${wkNow.runDays >= 5 ? "frequency on plan" : "the easy days are the ramp"}</div></div>`,
    `<div class="tile"><div class="k">longest run</div><div class="v num">${wkNow.longest ? wkNow.longest.toFixed(1) : "–"}<small> km</small></div><div class="s">target ${lgTgt[0]}–${lgTgt[1]} km this phase</div></div>`,
    `<div class="tile"><div class="k">easy share</div><div class="v num">${wkNow.easyShare != null ? Math.round(wkNow.easyShare) : "–"}<small>%</small></div>
      <div class="meter"><i style="width:${wkNow.easyShare || 0}%;background:${(wkNow.easyShare || 0) >= 70 ? STATUS.ok : (wkNow.easyShare || 0) >= 50 ? STATUS.warn : STATUS.crit}"></i></div>
      <div class="s">of weekly miles under 80% intensity</div></div>`,
  ].join("");

  /* build signals */
  const w4 = WEEKS.filter((w) => w.week < weekStart(TODAY)).slice(-4);
  const avg4 = w4.length ? w4.reduce((s, x) => s + x.mi, 0) / w4.length : 0;
  const easy4 = w4.length ? w4.reduce((s, x) => s + (x.easyShare || 0), 0) / w4.length : 0;
  const ramp = wLast.ramp;
  const rampSt = ramp == null ? null : ramp <= 2.5 ? "ok" : ramp <= 4 ? "warn" : "crit";
  const stk = streakWeeks();
  const cp = ATH?.checkpoint;
  const daysToCp = cp ? Math.max(0, Math.ceil((parseD(cp.date) - new Date()) / 864e5)) : null;
  $("sigTiles").innerHTML = [
    `<div class="tile"><div class="k">4-week avg volume</div><div class="v num">${avg4.toFixed(1)}<small> mi/wk</small></div><div class="s">${chip(avg4 >= 30 ? "ok" : avg4 >= 22 ? "warn" : "serious", avg4 >= 30 ? "building" : avg4 >= 22 ? "climbing" : "thin")} vs 35–38 by Labor Day</div></div>`,
    `<div class="tile"><div class="k">ramp rate</div><div class="v num">${signed(ramp, 1)}<small> CTL/wk</small></div><div class="s">${rampSt ? chip(rampSt, rampSt === "ok" ? "healthy" : rampSt === "warn" ? "hot" : "over the line") : ""} +4 is the boom-bust warning</div></div>`,
    `<div class="tile"><div class="k">uninterrupted weeks</div><div class="v num">${stk}</div><div class="s">${chip(stk >= 8 ? "ok" : stk >= 4 ? "warn" : "serious", stk >= 8 ? "gate met" : "need 8")} consistency is failure mode #1</div></div>`,
    `<div class="tile"><div class="k">easy share · 4-wk</div><div class="v num">${Math.round(easy4)}<small>%</small></div><div class="s">${chip(easy4 >= 70 ? "ok" : easy4 >= 50 ? "warn" : "crit", easy4 >= 70 ? "polarised" : easy4 >= 50 ? "creeping" : "intensity-heavy")} the documented deficit</div></div>`,
    `<div class="tile"><div class="k">Labor Day gate</div><div class="v num">${daysToCp ?? "–"}<small> days</small></div><div class="s">the 1:20 decision point · ${esc(cp?.date || "")}</div></div>`,
  ].join("");
}
function tile(label, val, unit, sub, state, word, sparkVals, sparkCol) {
  return `<div class="tile"><div class="k">${esc(label)}</div>
    <div class="v num">${val}${unit ? `<small> ${unit}</small>` : ""}</div>
    <div class="s">${state ? chip(state, word) + " " : ""}${esc(sub)}</div>
    ${sparkVals ? spark(sparkVals, 74, 26, sparkCol) : ""}</div>`;
}

/* ══ CALENDAR ═══════════════════════════════════════════════════════════ */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const scoreColor = (s) => (s == null ? C.rule2 : s >= 72 ? STATUS.ok : s >= 48 ? STATUS.warn : STATUS.crit);
function renderCalendar() {
  $("monthLabel").textContent = `${MONTHS[curM]} ${curY}`;
  const first = new Date(curY, curM, 1), start = (first.getDay() + 6) % 7, dim = new Date(curY, curM + 1, 0).getDate();
  const g = $("calGrid"); g.innerHTML = "";
  let cells = [], weekMi = null;
  const flushWeek = () => {
    const w = weekMi;
    cells.push(w
      ? `<div class="wkcell"><div class="wv num">${w.mi.toFixed(1)}<small style="font-size:9px;color:var(--mut)"> mi</small></div>
          <div class="stack">${BUCKETS.map((b) => (w.b[b.key] > 0 ? `<i style="flex:${w.b[b.key]};background:${bucketCol(b.key)}" title="${b.label} ${w.b[b.key].toFixed(1)} mi"></i>` : "")).join("")}</div>
          <div class="wk2">${w.runDays} d${w.easyShare != null ? ` · ${Math.round(w.easyShare)}% easy` : ""}</div></div>`
      : `<div class="wkcell"></div>`);
    weekMi = null;
  };
  for (let i = 0; i < start; i++) cells.push(`<div class="day blank"></div>`);
  for (let day = 1; day <= dim; day++) {
    const ds = `${curY}-${pad(curM + 1)}-${pad(day)}`;
    cells.push(dayCell(ds, day));
    const wk = WKBY[weekStart(ds)]; if (wk) weekMi = wk;
    const dow = (new Date(curY, curM, day).getDay() + 6) % 7;
    if (dow === 6) flushWeek();
    if (day === dim && dow !== 6) { for (let k = dow + 1; k <= 6; k++) cells.push(`<div class="day blank"></div>`); flushWeek(); }
  }
  g.innerHTML = cells.join("");
  g.querySelectorAll("[data-d]").forEach((el) => (el.onclick = () => (location.hash = `#/day/${el.dataset.d}`)));
}
function dayCell(ds, day) {
  const rec = byDate[ds], csv = csvByDate[ds] || [], sf = streams[ds] || null;
  const plan = rec && rec.status === "prescribed";
  const score = rec && !plan ? rec.score : null;
  let mi = 0, xt = false, hr = null, load = 0, inten = null, pace = null;
  if (sf) sf.activities.forEach((a) => {
    if (a.type === "Run") { mi += (a.meta.distance_m / 1000) * KM2MI; load += a.meta.load || 0; hr = hr || a.meta.avg_hr; if (a.meta.intensity) inten = Math.max(inten || 0, a.meta.intensity); pace = pace || (a.meta.avg_speed ? v2pace(a.meta.avg_speed) : null); }
    else xt = true;
  });
  else if (rec && rec.activity) { const a = rec.activity; mi = a.mi || 0; load = a.load || 0; hr = a.hr; inten = a.intensity; if (a.pace_per_km) pace = timeToSec("0:" + a.pace_per_km); if (a.km && !a.pace_per_km) xt = true; }
  else if (csv.length) csv.forEach((a) => { mi += a.mi || 0; load += a.load || 0; if (a.intensity) inten = Math.max(inten || 0, a.intensity); hr = hr || a.hr; });
  const has = rec || csv.length || sf;
  const paceTxt = rec?.activity?.pace_per_km || (pace ? paceStr(pace) : null);
  let mid = "";
  if (mi > 0) mid = `<div class="mi num">${mi.toFixed(1)}<small> mi</small>${xt ? ' <span title="cross-training">🎾</span>' : ""}</div><div class="sub">${paceTxt ? paceTxt + "/km" : ""}${hr ? ` · ♥${hr}` : ""}</div>`;
  else if (xt) mid = `<div class="mi" style="font-size:12px">cross-train 🎾</div>`;
  else if (plan) mid = `<div class="ptag">plan</div><div class="sub">${esc((rec.planned || "").replace(/[,(].*/, "").slice(0, 40))}</div>`;
  else if (rec) mid = `<div class="mi" style="color:var(--mut);font-size:11.5px">rest</div>`;
  const bc = bucketCol(bucketOf(inten));
  return `<${has ? "button" : "div"} class="day ${has ? "click" : "void"} ${plan ? "plan" : ""} ${ds === TODAY ? "now" : ""}" ${has ? `data-d="${ds}" aria-label="open ${ds}"` : ""}>
    <span class="rail" style="background:${plan ? `repeating-linear-gradient(45deg,${C.blue},${C.blue} 3px,transparent 3px,transparent 6px)` : scoreColor(score)}"></span>
    <span class="dn num">${day}</span>
    ${score != null ? `<span class="sc num" style="color:${scoreColor(score)}">${score}</span>` : ""}
    ${mid}
    ${load ? `<div class="lbar"><i style="width:${clamp(load, 0, 100)}%;background:${bc}"></i></div>` : ""}
    <span class="flags">${sf ? '<span class="wv" title="stream analytics">▁▄▂</span>' : ""}${rec && rec.reviewed === false && !plan ? '<span class="unrev" title="unreviewed draft"></span>' : ""}</span>
  </${has ? "button" : "div"}>`;
}
/* ══ chart plumbing ═════════════════════════════════════════════════════
   Rules honoured throughout: never two y-axes; legend whenever >1 series and
   never for exactly one; text in ink tokens, never a series colour; thin marks;
   crosshair tooltips on every chart; a data-table view for each.            */
function baseOpts() {
  return {
    responsive: true, maintainAspectRatio: false, animation: false, normalized: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0e131f", borderColor: C.rule2, borderWidth: 1, padding: 9,
        titleColor: C.ink, bodyColor: C.ink2, titleFont: { family: "IBM Plex Mono", size: 10 },
        bodyFont: { family: "IBM Plex Mono", size: 11.5 }, displayColors: true, boxWidth: 8, boxHeight: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, border: { color: C.rule2 }, ticks: { maxTicksLimit: 8, font: { family: "IBM Plex Mono", size: 9.5 }, color: C.mut } },
      y: { grid: { color: C.grid }, border: { display: false }, ticks: { font: { family: "IBM Plex Mono", size: 9.5 }, color: C.mut, maxTicksLimit: 6 } },
    },
  };
}
function withLegend(o) {
  o.plugins.legend = { display: true, position: "top", align: "end", labels: { boxWidth: 9, boxHeight: 9, usePointStyle: true, pointStyle: "rectRounded", font: { family: "IBM Plex Mono", size: 9.5 }, color: C.ink2 } };
  return o;
}
/* crosshair on line/area charts */
Chart.register({
  id: "crosshair",
  afterDraw(ch) {
    if (!ch.options.plugins.crosshair) return;
    const act = ch.tooltip?.getActiveElements?.(); if (!act || !act.length) return;
    const { ctx, chartArea: a } = ch, x = act[0].element.x;
    ctx.save(); ctx.strokeStyle = C.rule2; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, a.top); ctx.lineTo(x, a.bottom); ctx.stroke(); ctx.restore();
  },
});
/* shaded work segments on the pace chart */
Chart.register({
  id: "repBands",
  beforeDraw(ch) {
    const o = ch.options.plugins.repBands; if (!o || !o.spans?.length) return;
    const { ctx, chartArea: a, scales: { x } } = ch; if (!a) return;
    ctx.save(); ctx.fillStyle = "rgba(201,133,0,.13)";
    o.spans.forEach((sp) => { const x0 = x.getPixelForValue(sp.i0), x1 = x.getPixelForValue(sp.i1); if (isFinite(x0) && isFinite(x1)) ctx.fillRect(x0, a.top, Math.max(1, x1 - x0), a.height); });
    ctx.restore();
  },
});
/* HR zone bands */
Chart.register({
  id: "zoneBands",
  beforeDraw(ch) {
    const o = ch.options.plugins.zoneBands; if (!o?.zones) return;
    const { ctx, chartArea: a, scales: { y } } = ch; if (!a) return;
    let lo = y.min;
    o.zones.forEach((hi, i) => {
      const y1 = y.getPixelForValue(Math.min(hi, y.max)), y0 = y.getPixelForValue(Math.max(lo, y.min));
      if (y0 > y1) { ctx.fillStyle = ZONE_COL[i] + "1f"; ctx.fillRect(a.left, y1, a.width, y0 - y1); }
      lo = hi;
    });
  },
});

let cardSeq = 0;
/* a chart card with title, note, canvas and a data-table toggle */
function chartCard(opts) {
  const id = "ch" + ++cardSeq;
  return { id, html: `<div class="card ${opts.wide ? "span2" : ""}">
      <div class="chead"><div class="t"><h3>${esc(opts.title)}</h3><div class="note">${opts.note}</div></div>
      ${opts.extra || ""}<button class="dbtn" data-tbl="${id}">data</button></div>
      <div class="chwrap ${opts.h || ""}"><canvas id="${id}"></canvas></div>
      <div class="dtable hidden" id="${id}-t"></div></div>` };
}
function mountTable(id, head, rows) {
  const el = $(id + "-t"); if (!el) return;
  el.innerHTML = `<table class="dt"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c == null ? "–" : esc(String(c))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
function wireTables(root) {
  root.querySelectorAll("[data-tbl]").forEach((b) => (b.onclick = () => {
    const t = $(b.dataset.tbl + "-t"); const on = t.classList.toggle("hidden");
    b.textContent = on ? "data" : "hide";
  }));
}
const mk = (id, cfg) => { const el = $(id); if (el) viewCharts[id] = new Chart(el, cfg); };

/* ══ ANALYSIS ═══════════════════════════════════════════════════════════ */
function renderAnalysis() {
  const cards = [];
  const cVol = chartCard({ title: "Volume & intensity mix", wide: true, h: "tall", note: "weekly run miles, split by session intensity. The base grows from the dark band at the bottom — that is the discipline chart for this athlete.", extra: `<div class="rangebtns" id="volRange"></div>` });
  const cEasy = chartCard({ title: "Easy share", note: "share of weekly miles run under 80% of threshold. The documented deficit; 70%+ is the polarised target." });
  const cFit = chartCard({ title: "Fitness & fatigue", note: "CTL (fitness) and ATL (fatigue), same load units. Form is the distance between them." });
  const cPred = chartCard({ title: "The call over time", note: "projected half time at current fitness, against the three goal lines." });
  const cScore = chartCard({ title: "Day scores", note: "probability-change score against each goal. 60 = held the line." });
  const cHrv = chartCard({ title: "HRV", h: "short", note: "overnight HRV against the ~87 ms baseline." });
  const cRhr = chartCard({ title: "Resting HR", h: "short", note: "overnight resting HR; 46–48 is the established floor." });
  const cSleep = chartCard({ title: "Sleep duration", h: "short", note: "hours per night; 7.5 h is the target. Score and subjective quality in the tooltip." });
  const cEf = chartCard({ title: "Efficiency factor", h: "short", note: "metres per heartbeat at grade-adjusted speed, easy & long runs only. Rising = base building." });
  const cDec = chartCard({ title: "Decoupling", h: "short", note: "Pw:Hr drift on steady runs ≥20 min. Falling = the base is holding." });
  [cVol, cEasy, cFit, cPred, cScore, cHrv, cRhr, cSleep, cEf, cDec].forEach((c) => cards.push(c.html));
  const grid = $("analysisGrid"); grid.innerHTML = cards.join(""); wireTables(grid);

  /* range buttons for volume */
  const rb = $("volRange");
  [["16w", "16w"], ["1y", "1 yr"], ["all", "4.5 yr"]].forEach(([k, lb]) => {
    const b = document.createElement("button"); b.className = "tbtn" + (k === volRange ? " on" : ""); b.style.fontSize = "10px"; b.style.padding = "3px 8px"; b.textContent = lb;
    b.onclick = () => { volRange = k; rb.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); if (viewCharts[cVol.id]) { viewCharts[cVol.id].destroy(); delete viewCharts[cVol.id]; } drawVol(cVol.id); };
    rb.appendChild(b);
  });
  drawVol(cVol.id);

  /* easy share */
  const wv = WEEKS.filter((w) => w.mi > 0).slice(-20);
  let o = withLegend(baseOpts()); o.plugins.crosshair = 1; o.scales.y.min = 0; o.scales.y.max = 100; o.scales.y.ticks.callback = (v) => v + "%";
  mk(cEasy.id, { type: "line", data: { labels: wv.map((w) => w.week.slice(5)), datasets: [
      { label: "easy share", data: wv.map((w) => (w.easyShare == null ? null : Math.round(w.easyShare))), borderColor: C.green, backgroundColor: "rgba(0,131,0,.13)", fill: true, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.25 },
      { label: "70% target", data: wv.map(() => 70), borderColor: C.mut, borderDash: [5, 4], borderWidth: 1, pointRadius: 0 }] }, options: o });
  mountTable(cEasy.id, ["week", "easy %", "miles"], wv.map((w) => [w.week, w.easyShare == null ? null : Math.round(w.easyShare) + "%", w.mi.toFixed(1)]));

  /* fitness */
  const wd = WELL.days || [];
  o = withLegend(baseOpts()); o.plugins.crosshair = 1;
  mk(cFit.id, { type: "line", data: { labels: wd.map((x) => x.d.slice(5)), datasets: [
      { label: "CTL — fitness", data: wd.map((x) => x.ctl), borderColor: C.blue, backgroundColor: "rgba(57,135,229,.13)", fill: true, borderWidth: 2, pointRadius: 0, tension: 0.3 },
      { label: "ATL — fatigue", data: wd.map((x) => x.atl), borderColor: C.orange, borderWidth: 1.6, borderDash: [4, 3], pointRadius: 0, tension: 0.3 }] }, options: o });
  mountTable(cFit.id, ["date", "CTL", "ATL", "form"], wd.map((x) => [x.d, fx(x.ctl, 1), fx(x.atl, 1), x.ctl != null && x.atl != null ? signed(x.ctl - x.atl, 1) : null]));

  /* the call */
  const pd = (LOG.days || []).filter((d) => d.pred_half || d.prediction);
  const gs = ATH?.race?.goals || [];
  o = withLegend(baseOpts()); o.plugins.crosshair = 1;
  o.scales.y.reverse = true; o.scales.y.min = 78; o.scales.y.max = 100;
  o.scales.y.ticks.callback = (v) => `${Math.floor(v / 60)}:${pad(Math.round(v % 60))}`;
  o.plugins.tooltip.callbacks = { label: (c) => `${c.dataset.label}: ${secToHMS(c.parsed.y * 60)}` };
  mk(cPred.id, { type: "line", data: { labels: pd.map((d) => d.date.slice(5)), datasets: [
      { label: "the call", data: pd.map((d) => timeToSec(d.pred_half || d.prediction) / 60), borderColor: C.yellow, backgroundColor: "rgba(201,133,0,.13)", fill: true, borderWidth: 2, pointRadius: 3.5, pointHoverRadius: 6, tension: 0.25 },
      ...gs.map((g, i) => ({ label: g.time, data: pd.map(() => g.secs / 60), borderColor: [STATUS.ok, C.aqua, C.mut][i] || C.mut, borderDash: [6, 4], borderWidth: 1, pointRadius: 0 }))] }, options: o });
  mountTable(cPred.id, ["date", "projected half", "score vs 1:20"], pd.map((d) => [d.date, d.pred_half || d.prediction, d.score ?? null]));

  /* day scores */
  const sd = (LOG.days || []).filter((d) => d.score != null);
  o = withLegend(baseOpts()); o.plugins.crosshair = 1; o.scales.y.min = 0; o.scales.y.max = 100;
  o.scales.y.ticks.callback = (v) => (v === 60 ? "60 held" : v);
  mk(cScore.id, { type: "line", data: { labels: sd.map((d) => d.date.slice(5)), datasets: [
      { label: "vs 1:20 dream", data: sd.map((d) => d.score), borderColor: C.green, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: sd.map((d) => scoreColor(d.score)), pointBorderColor: C.surface, pointBorderWidth: 2, tension: 0.25 },
      { label: "vs 1:25 committed", data: sd.map((d) => d.score_committed), borderColor: C.yellow, borderDash: [5, 3], borderWidth: 1.6, pointRadius: 2.5, tension: 0.25 }] }, options: o });
  mountTable(cScore.id, ["date", "vs 1:20", "vs 1:25", "how it moved"], sd.map((d) => [d.date, d.score, d.score_committed, d.delta_p]));

  /* HRV */
  const hrvB = ATH?.physiology?.hrv_baseline_ms || 87;
  o = withLegend(baseOpts()); o.plugins.crosshair = 1;
  mk(cHrv.id, { type: "line", data: { labels: wd.map((x) => x.d.slice(5)), datasets: [
      { label: "HRV", data: wd.map((x) => x.hrv), borderColor: C.aqua, borderWidth: 2, pointRadius: 2.5, pointHoverRadius: 5, tension: 0.3, spanGaps: true },
      { label: `baseline ${hrvB}`, data: wd.map(() => hrvB), borderColor: C.mut, borderDash: [5, 4], borderWidth: 1, pointRadius: 0 }] }, options: o });
  mountTable(cHrv.id, ["date", "HRV ms"], wd.map((x) => [x.d, x.hrv]));

  /* RHR */
  const [r0, r1] = ATH?.physiology?.resting_hr_baseline || [46, 48];
  o = withLegend(baseOpts()); o.plugins.crosshair = 1; o.scales.y.reverse = true;
  mk(cRhr.id, { type: "line", data: { labels: wd.map((x) => x.d.slice(5)), datasets: [
      { label: "resting HR", data: wd.map((x) => x.rhr), borderColor: C.magenta, borderWidth: 2, pointRadius: 2.5, pointHoverRadius: 5, tension: 0.3, spanGaps: true },
      { label: `floor ${r1}`, data: wd.map(() => r1), borderColor: C.mut, borderDash: [5, 4], borderWidth: 1, pointRadius: 0 }] }, options: o });
  mountTable(cRhr.id, ["date", "resting HR"], wd.map((x) => [x.d, x.rhr]));

  /* sleep */
  o = baseOpts(); o.scales.y.min = 0; o.scales.y.max = 10;
  o.plugins.tooltip.callbacks = { afterBody: (items) => { const w = wd[items[0].dataIndex]; return w?.sleepScore ? `score ${w.sleepScore} · ${sleepWord(w.sleepQ)}` : ""; } };
  mk(cSleep.id, { type: "bar", data: { labels: wd.map((x) => x.d.slice(5)), datasets: [
      { label: "hours", data: wd.map((x) => (x.sleepSecs ? +(x.sleepSecs / 3600).toFixed(2) : null)), backgroundColor: C.blue, borderRadius: 4, maxBarThickness: 13 }] }, options: o });
  mountTable(cSleep.id, ["date", "hours", "score", "quality"], wd.map((x) => [x.d, x.sleepSecs ? (x.sleepSecs / 3600).toFixed(1) : null, x.sleepScore, sleepWord(x.sleepQ)]));

  /* EF + decoupling (separate charts — different units, never a second axis) */
  const pts = [];
  streamDates().sort().forEach((d) => {
    const f = streams[d]; if (!f) return;
    f.activities.forEach((a) => {
      if (a.type !== "Run" || !a.streams?.t || !a.streams?.v) return;
      const cls = classify(a); if (isWorkout(cls.kind)) return;        // like-for-like only
      if ((a.meta.moving_s || 0) < 1200) return;
      const mask = movingMask(a.streams.v);
      const gv = gapSeries(a.streams.v, a.streams.grade, mask, a.meta.gap_speed);
      const ef = efOverall(a.streams, gv), dc = decouple(a.streams, gv);
      const dec = a.meta.decoupling != null ? a.meta.decoupling : dc ? dc.dec : null;
      if (ef) pts.push({ d, ef: +ef.toFixed(3), dec: dec == null ? null : +(+dec).toFixed(1), km: +(a.meta.distance_m / 1000).toFixed(1) });
    });
  });
  o = baseOpts(); o.plugins.crosshair = 1;
  mk(cEf.id, { type: "line", data: { labels: pts.map((p) => p.d.slice(5)), datasets: [
      { label: "EF", data: pts.map((p) => p.ef), borderColor: C.aqua, backgroundColor: "rgba(25,158,112,.13)", fill: true, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.25 }] }, options: o });
  mountTable(cEf.id, ["date", "m/beat", "km"], pts.map((p) => [p.d, p.ef, p.km]));
  o = baseOpts(); o.plugins.crosshair = 1; o.scales.y.ticks.callback = (v) => v + "%";
  mk(cDec.id, { type: "line", data: { labels: pts.filter((p) => p.dec != null).map((p) => p.d.slice(5)), datasets: [
      { label: "decoupling", data: pts.filter((p) => p.dec != null).map((p) => p.dec), borderColor: C.red, backgroundColor: "rgba(230,103,103,.12)", fill: true, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.25 }] }, options: o });
  mountTable(cDec.id, ["date", "decoupling %", "km"], pts.filter((p) => p.dec != null).map((p) => [p.d, p.dec, p.km]));
}
function drawVol(id) {
  const n = volRange === "16w" ? 16 : volRange === "1y" ? 52 : WEEKS.length;
  const w = WEEKS.slice(-n);
  const o = withLegend(baseOpts());
  o.scales.x.stacked = true; o.scales.y.stacked = true;
  o.plugins.tooltip.callbacks = { footer: (it) => "total " + it.reduce((s, x) => s + x.parsed.y, 0).toFixed(1) + " mi" };
  mk(id, { type: "bar", data: { labels: w.map((x) => x.week.slice(volRange === "all" ? 2 : 5)), datasets: BUCKETS.map((b) => ({
        label: b.label, data: w.map((x) => +x.b[b.key].toFixed(2)), backgroundColor: bucketCol(b.key), stack: "v",
        borderRadius: b.key === "hard" ? 4 : 0, borderColor: C.surface, borderWidth: { top: 2, right: 0, bottom: 0, left: 0 }, maxBarThickness: 26 })) }, options: o });
  mountTable(id, ["week", "easy", "steady", "threshold", "hard", "total mi"], w.map((x) => [x.week, x.b.easy.toFixed(1), x.b.steady.toFixed(1), x.b.threshold.toFixed(1), x.b.hard.toFixed(1), x.mi.toFixed(1)]));
}

/* ══ THE GOAL ═══════════════════════════════════════════════════════════ */
function renderGoal() {
  const last = lastScored() || {}, predS = timeToSec(last.pred_half || last.prediction);
  const gs = ATH?.race?.goals || [], cp = ATH?.checkpoint;
  const wd = WELL.days || [], wLast = wd[wd.length - 1] || {};
  const w4 = WEEKS.filter((w) => w.week < weekStart(TODAY)).slice(-4);
  const avg4 = w4.length ? w4.reduce((s, x) => s + x.mi, 0) / w4.length : 0;
  const longMax = Math.max(0, ...WEEKS.slice(-4).map((w) => w.longest));
  const stk = streakWeeks();
  const daysLeft = Math.max(0, Math.ceil((parseD(RACE) - new Date()) / 864e5));

  /* gate evaluation — honest: "not yet tested" where there is no measurement */
  const gates = [
    { k: "8+ uninterrupted weeks", v: `${stk} / 8`, st: stk >= 8 ? "ok" : stk >= 4 ? "warn" : "serious", w: stk >= 8 ? "met" : "building" },
    { k: "Volume 35–38 mi/wk", v: `${avg4.toFixed(1)} mi`, st: avg4 >= 35 ? "ok" : avg4 >= 28 ? "warn" : "serious", w: avg4 >= 35 ? "met" : "short" },
    { k: "16–18 km long runs routine", v: `${longMax ? longMax.toFixed(1) : "–"} km`, st: longMax >= 16 ? "ok" : longMax >= 13 ? "warn" : "serious", w: longMax >= 16 ? "reached once" : "short" },
    { k: "10K TT ≤ 37:30", v: "not tested", st: "warn", w: "untested" },
    { k: "Threshold ≈ 4:00–4:05/km", v: paceStr(ATH?.physiology?.threshold_pace_s_per_km || 252) + "/km", st: (ATH?.physiology?.threshold_pace_s_per_km || 252) <= 245 ? "ok" : "warn", w: "estimate" },
    { k: "Weight ~128–130 lb", v: (ATH?.physiology?.weight_lb ?? "–") + " lb", st: "warn", w: "not logged" },
  ];
  const met = gates.filter((g) => g.st === "ok").length;

  const cCurve = chartCard({ title: "Pace curve — last 12 months", note: "best pace achieved at each distance, against the pace each goal demands. The gap at the right-hand end is the endurance deficit.", h: "tall", wide: true });

  $("goalGrid").innerHTML = `
    <div class="card span2">
      <h3>Where the race stands</h3>
      <div class="note">${daysLeft} days out · ${esc(phaseFor(TODAY)?.label || "")} phase</div>
      <div class="tiles" style="margin-top:4px">
        ${gs.map((g, i) => { const gap = predS ? predS - g.secs : null;
          return `<div class="tile"><div class="k">${esc(g.label)}</div>
            <div class="v num">${gap == null ? "–" : gap <= 0 ? "reached" : "+" + secToHMS(gap).replace(/^0:/, "")}</div>
            <div class="s">${esc(g.time)} · needs ${esc(g.pace_km)}/km</div></div>`; }).join("")}
      </div>
      <div class="prose" style="margin-top:16px">The call today is <b>${esc(last.pred_half || "–")}</b>. ${esc(gs[0]?.note || "")}</div>
      <div class="pull">${esc(ATH?.eras?.read || "")}</div>
    </div>

    <div class="card">
      <h3>Labor Day gate</h3>
      <div class="note">${esc(cp?.date || "")} · ${met} of ${gates.length} criteria met today. ALL must hold for 1:20 to stay alive into the final 8 weeks.</div>
      ${gates.map((g) => `<div class="gate"><span class="gl">${esc(g.k)}</span><span class="gv num">${esc(g.v)}</span>${chip(g.st, g.w)}</div>`).join("")}
      <div class="prose" style="margin-top:14px;font-size:12.5px">${esc(cp?.decision || "")}</div>
    </div>

    <div class="card">
      <h3>Why 1:20 is hard, in one number</h3>
      <div class="note">the arithmetic behind the 10K gate</div>
      <div class="prose">${esc(cp?.math || "")}</div>
      <div class="pull">Honest prior even with perfect execution: the checkpoint passes about one time in five.</div>
    </div>

    ${cCurve.html}

    <div class="card">
      <h3>Peak capability by era</h3>
      <div class="note">pace-curve bests, elapsed-time based. An engine that has always outrun its endurance.</div>
      <table class="eratab"><thead><tr><th>era</th><th>1 mile</th><th>5K</th><th>10K</th><th>half</th></tr></thead>
      <tbody>${(ATH?.eras?.rows || []).map((r) => `<tr><td>${esc(r.era)}</td><td>${esc(r.mile || "–")}</td><td>${esc(r.k5 || "–")}</td><td>${esc(r.k10 || "–")}</td><td>${esc(r.half || "–")}</td></tr>`).join("")}</tbody></table>
      <div class="note" style="margin-top:10px">${esc((ATH?.eras?.rows || []).map((r) => r.k10_note || r.half_note).filter(Boolean).join(" · "))}</div>
    </div>

    <div class="card">
      <h3>The pattern this block exists to break</h3>
      <div class="note">every previous build ended in a crash — and only one of those was a tendon</div>
      <div class="tl">${(ATH?.timeline?.events || []).map((e) => {
        const col = { peak: C.blue, bust: STATUS.crit, pr: STATUS.ok, injury: STATUS.crit, milestone: C.yellow }[e.kind] || C.mut;
        return `<div class="tlrow"><span class="dot" style="background:${col}"></span>
          <div class="dt">${esc(e.date)}${e.kind === "bust" ? " · collapse" : e.kind === "pr" ? " · best" : ""}</div>
          <div class="lb">${esc(e.label)}</div>
          ${e.cause ? `<div class="cz">${esc(e.cause)}</div>` : ""}</div>`; }).join("")}</div>
      <div class="pull">${esc(ATH?.timeline?.lesson || "")}</div>
    </div>

    <div class="card span2">
      <h3>The plan, and the rules that protect it</h3>
      <div class="note">from the athlete's own coaching document — the reasoning the daily scores are graded against</div>
      <div class="grid g2" style="margin-top:6px">
        <div><div class="k" style="margin-bottom:6px">weekly template</div>
          ${Object.entries(ATH?.weekly_template || {}).map(([d, v]) => `<div class="gate"><span class="gl"><b style="color:var(--ink)">${esc(d)}</b> — ${esc(v)}</span></div>`).join("")}</div>
        <div><div class="k" style="margin-bottom:6px">standing protocols</div>
          <div class="prose" style="font-size:12.5px">
          <p><b>Quality budget.</b> ${esc(ATH?.protocols?.quality_budget || "")}</p>
          <p><b>Saturday tempo gates.</b> ${esc(ATH?.protocols?.sat_tempo_gates || "")}</p>
          <p><b>Strength.</b> ${esc(ATH?.protocols?.strength || "")}</p>
          <p><b>Decoupling marker.</b> ${esc(ATH?.protocols?.decoupling_marker || "")}</p></div></div>
      </div>
    </div>`;
  wireTables($("goalGrid"));

  /* pace curve */
  const pc = ATH?.pace_curve_1y;
  if (pc) {
    const pts = pc.distance_m.map((D, i) => ({ x: D / 1000, y: pc.seconds[i] / (D / 1000) })).filter((p) => p.x >= 0.4);
    const o = withLegend(baseOpts());
    o.scales.x = { type: "logarithmic", min: 0.4, max: 23, grid: { display: false }, border: { color: C.rule2 },
      ticks: { font: { family: "IBM Plex Mono", size: 9.5 }, color: C.mut, callback: (v) => ([0.4, 1, 2, 5, 10, 21.1].includes(+v) ? (+v < 1 ? v * 1000 + "m" : v + "k") : "") } };
    o.scales.y.reverse = true; o.scales.y.ticks.callback = (v) => paceStr(v);
    o.plugins.tooltip.callbacks = { title: (it) => it[0].parsed.x.toFixed(2) + " km", label: (c) => `${c.dataset.label}: ${paceStr(c.parsed.y)}/km` };
    const csp = ATH.critical_speed_model ? 1000 / ATH.critical_speed_model.critical_speed_ms : null;
    mk(cCurve.id, { type: "line", data: { datasets: [
        { label: "best pace (12 mo)", data: pts, borderColor: C.blue, borderWidth: 2, pointRadius: 0, tension: 0.2, parsing: false },
        ...gs.map((g, i) => ({ label: g.time + " needs", data: [{ x: 21.0975, y: g.secs / 21.0975 }], borderColor: [STATUS.ok, C.aqua, C.yellow][i] || C.mut, backgroundColor: [STATUS.ok, C.aqua, C.yellow][i] || C.mut, pointRadius: 6, pointStyle: "rectRot", showLine: false, parsing: false })),
        ...(csp ? [{ label: "critical speed", data: [{ x: 0.4, y: csp }, { x: 23, y: csp }], borderColor: C.violet, borderDash: [5, 4], borderWidth: 1, pointRadius: 0, parsing: false }] : [])] }, options: o });
    mountTable(cCurve.id, ["distance", "best time", "pace /km"], pc.distance_m.map((D, i) => [D >= 1000 ? (D / 1000).toFixed(2) + " km" : Math.round(D) + " m", fmtDur(pc.seconds[i]), paceStr(pc.seconds[i] / (D / 1000))]).reverse().slice(0, 40));
  }
}
/* ══ DAY PANEL ══════════════════════════════════════════════════════════ */
function wirePanel() {
  $("pClose").onclick = () => closePanel(true);
  $("scrim").onclick = () => closePanel(true);
  $("pPrev").onclick = () => stepDay(-1);
  $("pNext").onclick = () => stepDay(1);
  document.addEventListener("keydown", (e) => {
    if (!$("panel").classList.contains("on")) return;
    if (e.key === "Escape") closePanel(true);
    if (e.key === "ArrowLeft") stepDay(-1);
    if (e.key === "ArrowRight") stepDay(1);
  });
}
function stepDay(dir) {
  if (!openDate) return;
  const d = parseD(openDate);
  for (let i = 1; i <= 90; i++) {
    d.setDate(d.getDate() + dir);
    const ds = dstr(d);
    if (byDate[ds] || csvByDate[ds] || ds in streams) { location.hash = `#/day/${ds}`; return; }
    if (dir > 0 && ds > TODAY) return;
    if (dir < 0 && ds < "2022-01-01") return;
  }
}
function closePanel(clearHash) {
  $("panel").classList.remove("on"); $("panel").setAttribute("aria-hidden", "true"); $("scrim").classList.remove("on");
  panelCharts.forEach((c) => c.destroy()); panelCharts = []; openDate = null;
  if (clearHash && location.hash.startsWith("#/day/")) location.hash = `#/calendar/${curY}-${pad(curM + 1)}`;
}
function dial(score, label) {
  const r = 45, c = 2 * Math.PI * r, f = clamp(score / 100, 0, 1), col = scoreColor(score);
  return `<div class="dial"><svg width="106" height="106" viewBox="0 0 106 106" role="img" aria-label="${label} ${score} of 100">
    <circle cx="53" cy="53" r="${r}" fill="none" stroke="${C.rule2}" stroke-width="7"/>
    <circle cx="53" cy="53" r="${r}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"
      stroke-dasharray="${(f * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 53 53)"/></svg>
    <div class="dv" style="color:${col}">${score}</div><div class="dk">${esc(label)}</div></div>`;
}
async function openDay(ds) {
  openDate = ds;
  const d = parseD(ds);
  $("pDate").textContent = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  panelCharts.forEach((c) => c.destroy()); panelCharts = [];
  const body = $("pBody");
  body.innerHTML = `<div class="skel" style="height:118px"></div><div class="skel" style="height:190px;margin-top:14px"></div>`;
  $("panel").classList.add("on"); $("panel").setAttribute("aria-hidden", "false"); $("scrim").classList.add("on");
  $("pClose").focus({ preventScroll: true });
  const rec = byDate[ds], sf = ds in streams ? await getStreams(ds) : null;
  if (openDate !== ds) return;
  let h = "";
  const plan = rec && rec.status === "prescribed";

  if (rec && !plan && rec.score != null) {
    h += `<div class="dials">${dial(rec.score, "vs 1:20 dream")}${rec.score_committed != null ? dial(rec.score_committed, "vs 1:25 committed") : ""}
      <div style="flex:1;min-width:170px">
        ${rec.reviewed === false ? chip("warn", "unreviewed draft", "written by the routine; amend in chat to confirm") : chip("ok", "reviewed")}
        ${rec.delta_p ? `<div class="dp" style="margin-top:9px">“${esc(rec.delta_p)}”</div>` : ""}
        ${rec.pred_half ? `<div class="num" style="font-size:12.5px;color:var(--ink2);margin-top:9px">the call: <b style="color:var(--s-yellow)">${esc(rec.pred_half)}</b>${rec.prediction_prev && rec.prediction_prev !== rec.pred_half ? ` <span style="color:var(--mut)">(was ${esc(rec.prediction_prev)})</span>` : ""}</div>` : ""}
      </div></div>`;
  } else if (plan) {
    h += `<div style="font:500 21px/1.3 var(--disp);color:var(--s-blue)">Prescribed ${chip("ok", "plan for this day")}</div>`;
  }
  if (rec?.planned) h += `<h4>${plan ? "Today's session" : "Planned"}</h4><div class="rx" style="padding:13px 15px"><div class="sess" style="font-size:16px;margin-top:0">${esc(rec.planned)}</div>${rec.plan_rationale ? `<div class="why" style="font-size:12.5px;margin-top:9px">${esc(rec.plan_rationale)}</div>` : ""}</div>`;
  if (rec?.components?.length) {
    h += `<h4>Score breakdown</h4>` + rec.components.map((c) => {
      const w = Math.min(50, Math.abs(c.delta) * 3.4);
      const col = c.delta > 0 ? STATUS.ok : c.delta < 0 ? STATUS.crit : C.mut;
      return `<div class="comp"><span class="cl">${esc(c.label)}</span>
        <span class="cb">${c.delta >= 0 ? `<i style="left:50%;width:${w}px;background:${col}"></i>` : `<i style="right:50%;width:${w}px;background:${col}"></i>`}</span>
        <span class="cd" style="color:${col}">${c.delta > 0 ? "+" : ""}${c.delta}</span></div>`;
    }).join("") + `<div class="comp"><span class="cl" style="color:var(--mut)">neutral 60 + deltas</span><span class="cb"></span><span class="cd">${rec.score}</span></div>`;
  }
  const w = rec?.wellness || wellByDate[ds];
  if (w) {
    const ctl = w.ctl, atl = w.atl, form = w.form ?? (ctl != null && atl != null ? ctl - atl : null);
    const rows = [["CTL", fx(ctl, 1)], ["ATL", fx(atl, 1)], ["form", form == null ? "–" : signed(form, 1)],
      ["HRV", (w.hrv ?? "–") + (w.hrv ? "<small> ms</small>" : "")], ["resting HR", w.restingHR ?? w.rhr ?? "–"],
      ["sleep", w.sleepSecs ? (w.sleepSecs / 3600).toFixed(1) + "<small> h</small>" : "–"],
      ["quality", sleepWord(w.sleepQuality ?? w.sleepQ)], ["sleep score", w.sleepScore ?? "–"],
      ["ramp", (w.rampRate ?? w.ramp) != null ? signed(w.rampRate ?? w.ramp, 1) + "<small>/wk</small>" : "–"],
      ["VO₂max", w.vo2max ?? "–"]].filter((r) => r[1] !== "–" && r[1] !== "–<small> ms</small>");
    h += `<h4>Morning wellness</h4><div class="wgrid">${rows.map((r) => `<div class="wc"><div class="k">${r[0]}</div><div class="v num">${r[1]}</div></div>`).join("")}</div>`;
  }
  const blocks = [];
  if (sf) sf.activities.forEach((a, i) => blocks.push(actBlock(a, i)));
  else if (rec?.activity) blocks.push(fallbackBlock(rec.activity));
  else (csvByDate[ds] || []).forEach((a) => blocks.push(fallbackBlock({ name: a.name, km: a.km, mi: a.mi, sec: a.sec, hr: a.hr, intensity: a.intensity, load: a.load })));
  if (blocks.length) h += `<h4>Training</h4>` + blocks.join("");
  else if (rec && !plan) h += `<h4>Training</h4><div class="none">Rest day — no activity recorded.</div>`;
  if (rec?.entry) h += `<h4>Coach's read</h4><div class="entry">${esc(rec.entry)}</div>`;
  if (rec?.note_next) h += `<h4>What's next</h4><div class="prose" style="font-size:13px">${esc(rec.note_next)}</div>`;
  if (!rec && blocks.length) h += `<div class="none" style="margin-top:18px">No coaching entry for this day — activity synced from Intervals.icu.</div>`;
  body.innerHTML = h;
  if (sf) sf.activities.forEach((a, i) => buildActCharts(a, i));
}

function actBlock(a, idx) {
  const m = a.meta || {}, st = a.streams || {}, run = a.type === "Run";
  const cls = (a._cls = classify(a));
  const pace = m.avg_speed ? v2pace(m.avg_speed) : null, gp = m.gap_speed ? v2pace(m.gap_speed) : null;
  const spm = cadSpm(m.cadence_rpm);
  const np = st.watts ? normPower(st.t, st.watts) : null;
  const aw = st.watts ? Math.round(st.watts.reduce((s, x) => s + (x || 0), 0) / st.watts.filter((x) => x != null).length) : null;
  const time = new Date(a.start_local).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const stats = [
    ["distance", run && m.distance_m != null ? (m.distance_m / 1000).toFixed(2) + "<small> km</small>" : null],
    ["moving", m.moving_s != null ? fmtDur(m.moving_s) : null],
    ["pace", run && pace ? paceStr(pace) + "<small>/km</small>" : null],
    ["gap", run && gp ? paceStr(gp) + "<small>/km</small>" : null],
    ["avg hr", m.avg_hr != null ? m.avg_hr + (m.max_hr ? `<small> / ${m.max_hr}</small>` : "") : null],
    ["intensity", m.intensity != null ? m.intensity + "<small>%</small>" : null],
    ["load", m.load ?? null],
    ["cadence", run && spm ? Math.round(spm) + "<small> spm</small>" : null],
    ["stride", run && m.stride_m != null ? m.stride_m + "<small> m</small>" : null],
    ["power", run && aw ? aw + (np ? `<small> avg · ${np} np</small>` : "<small> W</small>") : null],
    ["climb", run && m.elev_gain_m != null ? Math.round(m.elev_gain_m) + "<small> m</small>" : null],
  ].filter((s) => s[1] != null);
  let h = `<div class="act">
    <div class="ah"><span class="an">${esc(a.name)}</span><span class="tchip">${esc(a.type)}</span>
      ${cls.kind !== "xt" ? `<span class="tchip hl">${esc(KIND[cls.kind] || cls.kind)}${cls.kind === "intervals" ? ` · ${cls.spans.length}×` : ""}</span>` : ""}
      ${m.race ? `<span class="tchip hl">race</span>` : ""}
      <span class="at">${time}${m.device ? " · " + esc(m.device) : ""}</span></div>
    <div class="sgrid">${stats.map((s) => `<div class="st"><div class="k">${s[0]}</div><div class="v num">${s[1]}</div></div>`).join("")}</div>`;
  if (st.t && st.t.length > 10) {
    const hasD = !!st.d;
    if (run && hasD) h += `<div class="xtog" data-act="${idx}"><button class="on" data-x="d">by distance</button><button data-x="t">by time</button></div>`;
    if (run && st.v) h += `<div class="sch"><canvas id="cp${idx}"></canvas></div>`;
    if (run && st.alt) h += `<div class="sch mini"><canvas id="ce${idx}"></canvas></div>`;
    if (st.hr) h += `<div class="sch"><canvas id="ch${idx}"></canvas></div>`;
    if (run && st.cad) h += `<div class="sch mini"><canvas id="cc${idx}"></canvas></div>`;
    if (run && st.watts) h += `<div class="sch mini"><canvas id="cw${idx}"></canvas></div>`;
    h += `<div id="struct${idx}"></div>`;
    if (run && hasD && st.v && !isWorkout(cls.kind)) h += `<h4 style="margin-top:17px">Kilometre splits</h4><div id="sp${idx}"></div>`;
    h += `<div id="zn${idx}"></div><div id="sg${idx}"></div>`;
  } else h += `<div class="none">No stream file for this activity — aggregates only.</div>`;
  return h + `</div>`;
}
function fallbackBlock(f) {
  const stats = [["distance", f.km != null ? (+f.km).toFixed(2) + "<small> km</small>" : null], ["moving", f.sec != null ? fmtDur(f.sec) : null],
    ["pace", f.pace_per_km ? esc(f.pace_per_km) + "<small>/km</small>" : f.sec && f.km ? paceStr(f.sec / f.km) + "<small>/km</small>" : null],
    ["avg hr", f.hr ?? null], ["intensity", f.intensity != null ? Math.round(f.intensity) + "<small>%</small>" : null],
    ["load", f.load ?? null], ["cadence", f.cadence ? f.cadence + "<small> spm</small>" : null],
    ["climb", f.elev_gain_m != null ? Math.round(f.elev_gain_m) + "<small> m</small>" : null],
    ["decoupling", f.decoupling_pct != null ? f.decoupling_pct + "<small>%</small>" : null]].filter((s) => s[1] != null);
  let h = `<div class="act"><div class="ah"><span class="an">${esc(f.name || "Run")}</span><span class="tchip">logged</span></div>
    <div class="sgrid">${stats.map((s) => `<div class="st"><div class="k">${s[0]}</div><div class="v num">${s[1]}</div></div>`).join("")}</div>`;
  if (f.hr_zone_sec) h += zoneBar(f.hr_zone_sec);
  return h + `<div class="none">Streams not captured for this day.</div></div>`;
}
function zoneBar(zt) {
  const tot = zt.reduce((a, b) => a + b, 0); if (!tot) return "";
  const names = ATH?.physiology?.hr_zone_names || [];
  const seg = zt.map((s, i) => ({ s, i })).filter((x) => x.s > 0);
  const easy = ((zt[0] || 0) + (zt[1] || 0)) / tot * 100;
  return `<h4 style="margin-top:17px">Heart-rate zones <span style="color:var(--mut);text-transform:none;letter-spacing:0">· ${Math.round(easy)}% easy (Z1–Z2)</span></h4>
    <div class="zbar">${seg.map((x) => `<div style="flex:${x.s};background:${ZONE_COL[x.i]}" title="Z${x.i + 1} ${esc(names[x.i] || "")} — ${fmtDur(x.s)}">${x.s / tot > 0.08 ? `Z${x.i + 1} ${Math.round((x.s / tot) * 100)}%` : ""}</div>`).join("")}</div>
    <div class="zkey">${seg.map((x) => `<span><span style="color:${ZONE_COL[x.i]}">■</span> Z${x.i + 1} ${esc(names[x.i] || "")} ${fmtDur(x.s)}</span>`).join("")}</div>`;
}
function structTable(a, cls) {
  if (!cls.segs) return "";
  const { wu, reps, recs, cd } = cls.segs;
  const agg = (arr) => {
    const xs = arr.filter((x) => (x.mov || 0) > 0); if (!xs.length) return null;
    const d = xs.reduce((s, x) => s + (x.d || 0), 0), mov = xs.reduce((s, x) => s + (x.mov || 0), 0);
    const wt = (f) => { let s = 0, t = 0; xs.forEach((x) => { if (x[f] != null) { s += x[f] * (x.mov || 0); t += x.mov || 0; } }); return t ? s / t : null; };
    return { d, mov, pace: d > 0 ? mov / (d / 1000) : null, gap: wt("gap"), hr: wt("hr"), mx: Math.max(...xs.map((x) => x.max_hr || 0)) || null, n: xs.length };
  };
  const row = (lb, s) => (s ? `<tr><td>${esc(lb)}</td><td>${(s.d / 1000).toFixed(2)}</td><td>${fmtDur(s.mov)}</td><td>${s.pace ? paceStr(s.pace) : "–"}</td><td>${s.gap ? paceStr(1000 / s.gap) : "–"}</td><td>${s.hr ? Math.round(s.hr) : "–"}</td><td>${s.mx || "–"}</td></tr>` : "");
  const rep = (x, i) => `<tr class="work"><td>${cls.kind === "tempo" ? (reps.length > 1 ? `block ${i + 1}` : "tempo") : `rep ${i + 1}`}</td>
    <td>${x.d != null ? (x.d / 1000).toFixed(2) : "–"}</td><td>${fmtDur(x.mov)}</td>
    <td class="hi">${x.v ? paceStr(1000 / x.v) : "–"}</td><td>${x.gap ? paceStr(1000 / x.gap) : "–"}</td><td>${x.hr ?? "–"}</td><td>${x.max_hr ?? "–"}</td></tr>`;
  const wp = reps.filter((x) => x.v);
  const fade = wp.length > 1 ? Math.round(1000 / wp[wp.length - 1].v - 1000 / wp[0].v) : null;
  const rc = agg(recs);
  return `<h4 style="margin-top:17px">Structure — ${cls.kind === "intervals" ? `${reps.length} reps` : "tempo"} <span style="color:var(--mut);text-transform:none;letter-spacing:0">· auto-detected, no watch laps needed</span></h4>
    <table class="sp"><thead><tr><th>segment</th><th>km</th><th>time</th><th>pace</th><th>gap</th><th>♥ avg</th><th>♥ max</th></tr></thead>
    <tbody>${row("warmup", agg(wu))}${reps.map(rep).join("")}${rc ? row(`recoveries ×${rc.n}`, rc) : ""}${row("cooldown", agg(cd))}</tbody></table>
    ${fade != null && cls.kind === "intervals" ? `<div class="zkey" style="margin-top:5px">rep 1 → ${wp.length}: ${fade > 0 ? "+" : ""}${fade} s/km ${Math.abs(fade) <= 8 ? "— held together" : fade > 0 ? "— faded late" : "— negative-split reps"}</div>` : ""}`;
}
function buildActCharts(a, idx) {
  const st = a.streams || {}; if (!st.t || st.t.length < 10) return;
  const m = a.meta || {}, run = a.type === "Run", cls = a._cls || classify(a);
  const mask = st.v ? movingMask(st.v) : st.t.map(() => true);
  const gapv = run && st.v ? gapSeries(st.v, st.grade, mask, m.gap_speed) : null;
  let xMode = run && st.d ? "d" : "t";
  const X = () => (xMode === "d" ? st.d.map((x) => +(x / 1000).toFixed(3)) : st.t.map((x) => +(x / 60).toFixed(2)));
  const xT = (it) => it[0].label + (xMode === "d" ? " km" : " min");
  const ch = {};

  if (run && st.v && $(`cp${idx}`)) {
    const ps = smooth(st.v, 7).map(v2pace), gs2 = gapv ? smooth(gapv, 13).map(v2pace) : null;
    const cl = ps.filter((p) => p && p < 900), mn = Math.min(...cl), mx = Math.max(...cl);
    const o = baseOpts(); o.plugins.crosshair = 1;
    o.scales.y.reverse = true; o.scales.y.min = Math.floor((mn - 8) / 10) * 10; o.scales.y.max = Math.min(mx + 15, mn + 160);
    o.scales.y.ticks.callback = (v) => paceStr(v);
    o.plugins.tooltip.callbacks = { title: xT, label: (c) => `${c.dataset.label}: ${paceStr(c.parsed.y)}/km` };
    if (cls.spans.length) o.plugins.repBands = { spans: cls.spans };
    const ds = [];
    if (gs2) ds.push({ label: "GAP", data: gs2, borderColor: "rgba(57,135,229,.45)", borderWidth: 1.2, borderDash: [4, 3], pointRadius: 0 });
    ds.push({ label: "pace", data: ps, borderColor: C.blue, borderWidth: 1.8, pointRadius: 0 });
    if (ds.length > 1) withLegend(o);
    ch.p = new Chart($(`cp${idx}`), { type: "line", data: { labels: X(), datasets: ds }, options: o });
  }
  if (run && st.alt && $(`ce${idx}`)) {
    const o = baseOpts(); o.plugins.tooltip.callbacks = { title: xT, label: (c) => `elevation: ${Math.round(c.parsed.y)} m` };
    o.scales.y.ticks.maxTicksLimit = 3;
    ch.e = new Chart($(`ce${idx}`), { type: "line", data: { labels: X(), datasets: [{ label: "elevation (m)", data: smooth(st.alt, 9), borderColor: "rgba(159,176,201,.55)", backgroundColor: "rgba(159,176,201,.13)", fill: "origin", borderWidth: 1, pointRadius: 0 }] }, options: o });
  }
  if (st.hr && $(`ch${idx}`)) {
    const zones = ATH?.physiology?.hr_zones || [145, 153, 162, 171, 176, 181, 190];
    const cl = st.hr.filter((x) => x != null);
    const o = baseOpts(); o.plugins.crosshair = 1;
    o.scales.y.min = Math.max(60, Math.min(...cl) - 8); o.scales.y.max = Math.max(...cl) + 6;
    o.plugins.zoneBands = { zones };
    o.plugins.tooltip.callbacks = { title: run && st.d ? xT : (it) => it[0].label + " min", label: (c) => `heart rate: ${Math.round(c.parsed.y)} bpm` };
    ch.h = new Chart($(`ch${idx}`), { type: "line", data: { labels: run && st.d ? X() : st.t.map((x) => +(x / 60).toFixed(2)), datasets: [{ label: "heart rate", data: st.hr, borderColor: C.magenta, borderWidth: 1.6, pointRadius: 0, spanGaps: true }] }, options: o });
  }
  if (run && st.cad && $(`cc${idx}`)) {
    const sp = smooth(st.cad.map(cadSpm), 7), cl = sp.filter((x) => x != null && x > 100);
    const o = baseOpts(); o.scales.y.min = Math.min(...cl) - 6; o.scales.y.max = Math.max(...cl) + 6; o.scales.y.ticks.maxTicksLimit = 3;
    o.plugins.tooltip.callbacks = { title: xT, label: (c) => `cadence: ${Math.round(c.parsed.y)} spm` };
    ch.c = new Chart($(`cc${idx}`), { type: "line", data: { labels: X(), datasets: [{ label: "cadence (spm)", data: sp, borderColor: C.violet, borderWidth: 1.4, pointRadius: 0, spanGaps: true }] }, options: o });
  }
  if (run && st.watts && $(`cw${idx}`)) {
    const o = baseOpts(); o.scales.y.ticks.maxTicksLimit = 3;
    o.plugins.tooltip.callbacks = { title: xT, label: (c) => `power: ${Math.round(c.parsed.y)} W` };
    ch.w = new Chart($(`cw${idx}`), { type: "line", data: { labels: X(), datasets: [{ label: "power (W)", data: smooth(st.watts, 9), borderColor: C.yellow, borderWidth: 1.2, pointRadius: 0, spanGaps: true }] }, options: o });
  }
  Object.values(ch).forEach((c) => panelCharts.push(c));
  const tg = document.querySelector(`.xtog[data-act="${idx}"]`);
  if (tg) tg.querySelectorAll("button").forEach((b) => (b.onclick = () => {
    xMode = b.dataset.x; tg.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    const xs = X(); Object.values(ch).forEach((c) => { c.data.labels = xs; c.update("none"); });
  }));

  /* structure (workouts) or splits (everything else) */
  if ($(`struct${idx}`) && isWorkout(cls.kind)) $(`struct${idx}`).innerHTML = structTable(a, cls);
  if ($(`sp${idx}`) && run && st.d && st.v) {
    const sp = kmSplits(st, gapv);
    if (sp.length) {
      const full = sp.filter((s) => !s.partial).map((s) => s.pace);
      const fast = Math.min(...full), slow = Math.max(...full);
      $(`sp${idx}`).innerHTML = `<table class="sp"><thead><tr><th>km</th><th>time</th><th>pace</th><th>gap</th><th>♥</th><th>rise</th></tr></thead><tbody>` +
        sp.map((s) => `<tr><td>${s.partial ? s.km.toFixed(2) : s.km}</td><td>${fmtDur(s.secs)}</td>
          <td class="${!s.partial && s.pace === fast ? "hi" : ""}" ${!s.partial && s.pace === fast ? `style="color:${STATUS.ok}"` : !s.partial && s.pace === slow ? `style="color:${C.mut}"` : ""}>${paceStr(s.pace)}</td>
          <td>${s.gap ? paceStr(s.gap) : "–"}</td><td>${s.hr ? Math.round(s.hr) : "–"}</td><td>${s.gain >= 1 ? "+" + Math.round(s.gain) + " m" : "·"}</td></tr>`).join("") + `</tbody></table>`;
    }
  }
  /* zones */
  let zt = null;
  if (st.hr) {
    const zones = ATH?.physiology?.hr_zones || [145, 153, 162, 171, 176, 181, 190];
    zt = m.hr_zone_secs && m.hr_zone_secs.some((x) => x > 0) ? m.hr_zone_secs : zoneTimes(st.t, st.hr, zones);
    if ($(`zn${idx}`)) $(`zn${idx}`).innerHTML = zoneBar(zt);
  }
  /* signals — tailored to the session type */
  if ($(`sg${idx}`) && run) {
    const cells = [];
    if (!isWorkout(cls.kind)) {
      if (zt) {
        const tot = zt.reduce((a, b) => a + b, 0);
        if (tot) { const p = Math.round((((zt[0] || 0) + (zt[1] || 0)) / tot) * 100);
          const s = p >= 75 ? "ok" : p >= 55 ? "warn" : "crit";
          cells.push(sig("easy purity", p + "%", s, s === "ok" ? "genuinely easy" : s === "warn" ? "drifted" : "not an easy run", "time in Z1–Z2 — easy days should live here")); }
      }
      const dc = decouple(st, gapv), icu = m.decoupling;
      if (dc || icu != null) {
        const v = icu != null ? icu : dc.dec, s = v <= 5 ? "ok" : v <= 8 ? "warn" : "crit";
        let sub = icu != null ? "Intervals.icu Pw:Hr" : "computed Pw:Hr";
        if (dc) { sub += ` · halves ${dc.ef1.toFixed(2)}→${dc.ef2.toFixed(2)} m/beat`; if (dc.negSplit) sub += " · negative split, read lightly"; }
        cells.push(sig("decoupling", (+v).toFixed(1) + "%", s, s === "ok" ? "base holding" : s === "warn" ? "some drift" : "drifted", sub));
      }
      const ef = efOverall(st, gapv);
      if (ef) cells.push(sig("efficiency", ef.toFixed(2), null, null, "m/beat at GAP speed — up = base building"));
    } else {
      let wt = 0, wd2 = 0;
      if (cls.segs) cls.segs.reps.forEach((x) => { wt += x.mov || 0; wd2 += x.d || 0; });
      else if (cls.spans.length) cls.spans.forEach((sp) => { wt += st.t[sp.i1] - st.t[sp.i0]; if (st.d) wd2 += st.d[sp.i1] - st.d[sp.i0]; });
      else { wt = m.moving_s || 0; wd2 = m.distance_m || 0; }
      const wp = wd2 > 0 ? wt / (wd2 / 1000) : null;
      const thr = ATH?.physiology?.threshold_pace_s_per_km;
      if (wt) cells.push(sig("work", fmtDur(wt) + (wp ? ` @ ${paceStr(wp)}` : ""), null, null, thr ? `threshold estimate ${paceStr(thr)}/km` : ""));
    }
    const spm = cadSpm(m.cadence_rpm);
    if (spm) { const s = spm >= 176 ? "ok" : spm >= 170 ? "warn" : "crit";
      cells.push(sig("cadence", Math.round(spm) + " spm", s, s === "ok" ? "in target" : "below target", "target 176–180 — a cheap Achilles-load lever")); }
    $(`sg${idx}`).innerHTML = cells.length ? `<h4 style="margin-top:17px">Signals</h4><div class="sig">${cells.join("")}</div>` : "";
  }
}
function sig(label, val, state, word, sub) {
  return `<div class="sc2"><div class="k">${esc(label)}</div><div class="v num">${esc(val)}</div>
    ${state ? `<div style="margin-top:5px">${chip(state, word)}</div>` : ""}
    ${sub ? `<div class="s">${esc(sub)}</div>` : ""}</div>`;
}
