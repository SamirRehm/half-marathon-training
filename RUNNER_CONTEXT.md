# Runner context document — half marathon build to Oct 31, 2026

**Purpose:** This is a complete handoff document for any Claude session (or coach) working with this athlete. It contains the full 4.5-year training dataset, the synthesized runner profile, goal assessment, active protocols, and a running daily log. Read this top to bottom and you know everything established so far. **Update protocol: at the end of each day, append a new dated entry to the Daily Log section and return the updated file. Every entry must include the day's fitness metrics pulled from Intervals.icu wellness (CTL, ATL, form = CTL−ATL, ramp rate, VO2max estimate, and weight 7-day average once available) alongside sleep/HRV/RHR, training done, the HM prediction, and tomorrow's plan.** Historical sections (§3–§5) are settled record — modify only if new data contradicts them. Plan sections (§6) are standing hypotheses and SHOULD evolve: amend gates, budgets, and targets as incoming data confirms or contradicts them, and note the change + date in the Daily Log.

---

## 1. Athlete snapshot (as of July 4, 2026)

- Male, max HR 190, LTHR 172, resting HR 46–48, HRV baseline ~87 ms (range 77–99)
- Current weight: 134 lbs (61 kg). PR-era racing weight: ~120 lbs (54.4 kg). Race-day target: ~124 lbs, but plan is to reach ~128–130 by October and hold, saving further cut for later (injury risk of cutting hard while ramping mileage on a repaired Achilles)
- Garmin VO2max estimate: 53–54 now (peaked 58 in Nov 2025). Device: Forerunner 255
- HR zones (Intervals.icu): Z1 ≤145, Z2 ≤153, Z3 ≤162, Z4 ≤171, Z5 ≤176, Z6 ≤181, Z7 ≤190
- **Injury history: complete Achilles rupture June 1, 2024**, followed by ~5.5 months to return-to-run (first 600 m jog Nov 14, 2024) and **10.5 months of PT (early months ROM/dorsiflexion/control; strength-focused later). As of mid-2026 (25 months post-rupture) the tendon is remodeled and demonstrably load-tolerant** — track reps at 4:06/km, a 21.1 km TT, and repeated threshold work without incident. Do NOT treat this athlete as post-op fragile. Weighted calf work continues as 2x/wk maintenance/performance insurance, not rehab. Ramp-rate caution is justified by general tissue adaptation (body adapted to ~12 mi/wk being asked to carry 40) and by his documented boom-bust history — which predates the injury (2022, 2023 collapses on a healthy tendon) — not by tendon fragility.
- **TIMEZONE: athlete is in US Pacific (PST/PDT, UTC−8/−7). Intervals.icu stores timestamps in UTC**, but the API's `start_date_local` field is already in the athlete's local (Pacific) time — use that for the activity date. Watch the boundary: evening Pacific runs (e.g. 7–9 PM PDT) fall on the NEXT day in UTC (2–4 AM), so a naive UTC "today" query can miss them or grab the wrong day. When pulling "today," resolve the date in Pacific local time, and if a run seems missing, check the adjacent UTC day.
- Wellness data availability: HRV/resting HR/VO2max tracking began mid-2025. **Subjective sleep-quality field scale: 1 = excellent, 2 = good** (lower is better — do not misread a 2 as poor sleep). Weight never logged in Intervals.icu (athlete has agreed to begin daily fasted weigh-ins, 7-day rolling average is the only interpreted number). 2022–2024 wellness = training load + sleep only.

## 2. Goal

**Primary: half marathon on October 31, 2026.** Athlete's stated dream target is 1:20:00 (3:47.5/km / 6:06/mi). Assessment (see §6): 1:20 is not realistic on this date; the committed, defensible target is **1:24–1:27, with 1:22 as the stretch**. This would be a lifetime HM PR (never raced a half fresh). The 1:20 engine is proven (35:33 10K, Feb 2023) and remains a realistic ~2027 goal *if* consistency holds — but the athlete's life gets much busier after Oct 31, 2026, so this race is the priority and there may not be a 2027 block. Every decision optimizes for being on that start line healthy at max sustainable fitness.

## 3. Runner profile (synthesized from 1,055 runs, Jan 2022 – Jul 2026)

**Career totals:** ~3,502 miles logged. Best year 2022 (1,398 mi, avg 26.9 mi/wk, peak 4-week avg 45.5 mi/wk ending Oct 2 2022, single weeks to 51 mi).

**Structure habits:** Tue evening workout split into wu/main/cd files, midweek medium-long 13–14 km, Sat track, Sun long run 13–24 km. 5–6 runs/wk at peak; 2–4 now. Longest run ever: 24.5 km. Rarely runs >21 km.

**Intensity signature (the defining trait):** chronically intensity-heavy, easy-running deficient. 2022: easy/recovery ~12% of volume; long runs at 154–160 HR (85–95% intensity). Post-injury it worsened: last 12 months ≈54% of volume at tempo+; Q2 2026 was 45% threshold, 13% interval/race, ~7.5% easy. Pattern: trains like a 25 mi/wk runner doing 45 mi/wk of intensity. Races fast off low mileage, but every build ends in a crash (Apr 2022, Mar 2023, spring 2024 → rupture, Mar–Apr 2026 six-week gap). No polarization anywhere in the log.

**Personality (from data + conversation):** highly capable, competitive, habit-driven, pace-ego is real — resists easy paces ("really slow"), anchors on glory-days paces (long runs near 4:00–4:22/km in 2022), negotiates upward on intensity. **Confirmed in practice (Jul 5, 2026): negotiated the prescribed long run from 6:30 → 5:45/km, then averaged 5:24 — start was on-prescription, drift came in the back half. Expect prescribed easy paces to erode 20–30 s/km as runs progress; the failure mode is holding the ceiling late, not the start.** Responds to data-based arguments and honest math; own-telemetry evidence (e.g., decoupling) lands better than principles. Coaching approach that works: hold the line on principles, show the math from his own history, offer explicit tradeoff options ("Option A vs B with the bill attached"), give him ownership of the final call. **Consistency risk = life-schedule crunch, not motivation or body:** the Mar 22 – May 2, 2026 gap was a busy stretch at work; post-Oct 2026 life gets significantly busier. Plans must survive busy weeks — short easy runs > perfect weeks; protect social anchors (Tue run club).

**HR relationships (stable across eras — engine intact, base missing):** easy 130–140 HR, long 154–166, workouts 167–178. Cadence ~171 spm at HM effort (stride 1.32 m at 4:26/km), ~175 spm at 10K effort (stride 1.61 m at 3:33/km) — slightly low; raising toward 176–180 is a cheap Achilles-load lever.

## 4. Peak capability by era (pace-curve bests; elapsed-time based)

| Distance | 2022 | 2023 | Pre-tear yr (Jun23–Jun24) | Last 12 mo (Jul25–Jul26) |
|---|---|---|---|---|
| 1 mile | 4:55 | 5:23 | 5:24 | 5:54 |
| 5K | **17:07** (race, Jul 24 2022) | 17:26 | 18:02 | 19:17 |
| 10K | 36:48 | **35:33** (race, Feb 5 2023, HR 172 avg/190 max, CTL 34) | 41:53 | 42:41 |
| Half | 1:30:11 (inside 24 km training run, Nov 13 2022, HR 159) | 1:35:10 | — | 1:33:42 moving (HM time-trial Nov 15 2025, HR 170, CTL 25) |

Never raced a half fresh/tapered. 35:33 10K converts to ~1:18–1:19 HM with proper HM training. Peak engine was 1:20-capable; peak endurance only ever trained to ~1:30 shape.

## 5. Fitness timeline (peaks and troughs)

- **2022:** biggest year. Spring block (35 mi/wk Mar), fall block (42 mi/wk Sep avg; best of career). 17:07 5K July; 1:30 HM inside a Nov long run.
- **Feb 5, 2023:** all-time performance peak — 35:33 10K in SF at ~120 lbs, off the fall-2022 base + huge January (51.3 mi week).
- **2023:** 982 mi; boom-bust — Feb–Apr collapse to 10–12 mi/wk, summer/fall rebuild (~27 mi/wk Oct), never regained 2022 volume.
- **2024:** slow bleed Jan (17/wk) → May (6/wk). **Achilles rupture June 1 during cardio session.** Zero running to mid-Nov. Dec 31, 2024: raced a track 5K at 178 avg HR in week 7 of return (aggressive).
- **2025:** sawtooth rebuild; best block Sep–Nov (~20–24 mi/wk). Nov 15: 21.16 km TT in 1:33:42 moving @ 170 HR.
- **2026:** choppy. Decent Feb (16 km long run, 4:07/km tempo). Mar 22 – May 2: near-zero (6-week gap). Rebuilt May–Jun to ~10–15 mi/wk. Current CTL ~19, ATL ~27 (form ≈ −8).

## 6. Goal assessment and plan skeleton (agreed July 4, 2026)

**Why 1:20 on Oct 31 is out:** 17 weeks; current shape ≈19:15–19:30 5K ≈ 1:28–1:30 HM fresh; base ~10–15 mi/wk with a 6-week gap 9 weeks ago; hasn't sustained >24 mi/wk for two consecutive months since 2023; would require closing 8–9 min + quadrupling volume + cutting 10 lbs + protecting a repaired Achilles simultaneously. His own history says that pattern ends in breakdown. Biggest race threat = September tendon flare, not undertraining.

**17-week arc:** ~4 wk base re-entry (consistency, 6 d/wk, 20→28 mi/wk, nearly all easy + strides), ~8 wk build (28→40+ mi/wk; ONE threshold session + ONE long run w/ quality per week; everything else easy), ~4 wk HM-specific + taper. Long run grows toward 16–18 km by Sep. Expected: threshold pace improves toward ~4:10/km; easy pace naturally drifts to ~5:30–5:45/km by Sep.

**Weekly template (agreed Jul 5):** Tuesday = run club speed workout (social anchor — keep it; consistency is his #1 historical failure mode, the club protects it). Sunday = long run, with embedded quality (HM-pace blocks / steady finish) every 2nd–3rd week from ~early-mid Aug. Saturday = easy-moderate most weeks; flexes to tempo only per the gates below. Wednesday/Thursday easy runs (35–45 min) are the current priority — they ARE the ramp.

**Quality budget — the real rule is proportion, not day-count.** Quality must sit on enough easy volume to absorb it. At ~15 mi/wk, club + long run is already most of the week; adding a Sat tempo would make the week ~60% quality-by-volume with no cheap miles (the June 2026 pattern that precedes every breakdown). As volume grows, the budget grows. If the long run is run steady/hard, one other quality slot is forfeited that week (explicit tradeoff he accepted).

**Saturday tempo return gates:** 4+ consecutive weeks at 35+ mi/wk, zero Achilles symptoms through a full block, HRV near ~87 baseline and RHR stable while absorbing existing quality. Expected: mid-to-late September if the build is clean — deliberately timed, since weeks 12–15 are when HM-specific tempo pays most. When it returns: controlled HM-effort (20–30 min @ ~4:25–4:35/km, finish with reps in hand), NOT max-effort. Club remains the only empty-the-tank day.

**Labor Day checkpoint (Sep 5–7) — 1:20 decision gate.** 1:20 is not abandoned; it is falsifiable. It stays alive into the final 8 weeks only if ALL hold: (a) 8+ consecutive weeks with no Achilles interruption; (b) volume at 35–38 mi/wk with 16–18 km long runs routine; (c) 10K TT/race ≤ 37:30 (solo TT gets ~20–30 s grace); (d) threshold ≈ 4:00–4:05/km; (e) weight ~128–130 with HRV/RHR intact. Math behind (c): 1:20 requires ~36:18 10K-equivalent on race day; 37:30 eight weeks out ≈ 1:22:30 equivalent, leaving ~3% to find — the outer edge of realistic. Any slower and the remaining gap is arithmetic-dead (38:30 ≈ 1:24:50 ≈ needing ~5 min in 8 wks). Note: his 10K historically overstates his HM fitness (35:33 vs ~1:30–1:35 demonstrated in 2023) — endurance is the side to distrust. Honest prior even with perfect execution: checkpoint passes ~1 in 5. Miss any criterion → race is committed at 1:24–1:27 with zero regret; chasing 1:20-style training in July is what destroys the 1:24 outcome.

**Strength protocol (agreed):** heavy slow calf work (straight-leg + bent-knee weighted calf raises, slow eccentric, 3–4 sets × 8–10 hard reps) 2x/wk — maintenance/performance insurance, the one strength item to nag about; plus hips/core 2x/wk. Athlete's daily 7-min bodyweight circuit (planks, side planks, lunges, squats, wall sit, pushups, etc.) is endorsed and covers the hips/core box, but its 30-s bodyweight calf raises do NOT satisfy the calf protocol (endurance-range stimulus ≠ heavy-slow tendon stimulus). Skip/lighten leg portions the evening before quality days and the morning of long runs. No plyometrics (track work already provides elastic load).

**Weight protocol (agreed):** daily fasted morning weigh-in; interpret 7-day rolling average only. Alarm condition: >0.3 kg/wk loss + rising RHR + sagging HRV = under-fueling, intervene. Target ~128–130 by October. Weight worth ~1–2 sec/km per kg at HM effort. Body comp: weekly trend only; watch lean mass holding while total drifts down.

**Daily HM prediction protocol:** one number per day, produced when athlete checks in ("number?"). Basis: current threshold estimate (~4:10–4:15/km as of Jul 4), 5K shape conversion, minus endurance discount for volume/long-run deficit, cross-checked vs Nov 2025 benchmark (1:33:42 @ CTL 25). Volume and long-run length move it fastest early (~30–60 s per clean 25+ km week); threshold work matters later; missed weeks move it backward fastest. Credit what is repeatable (duration, frequency); no credit for excess intensity on easy days. **Secondary fitness marker: aerobic decoupling on long runs (first-half vs second-half pace:HR). Jul 5 baseline: ~6% at 5:24/km. Target: <5% at 5:45, trending toward ~5:15–5:30 at stable HR by September — this closing is the base being built.** Baseline prediction: 1:38 on July 4, 2026 (CTL 19).

## 7. Daily log

**How to write a daily entry (instructions for the session doing the update):**

1. **Pull the data.** From Intervals.icu: `wellness_recent_list` for today (sleep secs/score/quality, HRV, RHR, CTL, ATL, ramp rate, VO2max, weight when present) and `activities_list` for today. For any run that was a planned session, a workout, or anything surprising (pace ≠ plan, unusual HR), pull `activity_streams_get` and **analyze the full second-by-second streams, not just the activity's aggregate averages** — how pace, HR, cadence, and power actually evolved over the run: pacing discipline vs the plan, HR drift at steady pace (aerobic decoupling on longer runs), surges/hills and how they were handled, cadence stability, anything anomalous. The averages routinely hide the story (e.g., Jul 5: a "5:24 avg" run that was really an over-fast start plus 40 min of one-way HR drift plus hill surges). Ask the athlete anything data can't tell you (how it felt, strength done, life context).
2. **Write the entry** using the template below. Keep it terse — facts and decisions, not narrative.
3. **Judge, don't just record.** Compare executed vs planned (expect easy paces to run 20–30 s/km hot per §3); state consequences for tomorrow explicitly.
4. **Update the prediction** per §6 protocol: one number, credit only what's repeatable, cross-check against the trend (don't move it >30 s/day without a race/TT or missed-week reason).
5. **Promote durable facts.** Anything true beyond today (conventions, corrections, pattern confirmations, protocol changes) goes into §1–§6, with only a one-line changelog pointer in the entry. The log is for events; the background sections are for truths.
6. **Set tomorrow.** Concrete session (duration, pace, conditions for downgrade/upgrade), or explicitly OFF.
7. Return the updated file to the athlete.

**Entry template:**
```
### YYYY-MM-DD (Day)
- Morning wellness: sleep Xh Xm, score X, quality X, HRV X, RHR X. [verdict]
- Fitness metrics: CTL X (from X), ATL X, form X, ramp +X/wk, VO2max X[, weight 7d-avg X]
- Run/training: [executed vs planned, key stream findings, decoupling if long]
- Strength: [done/skipped]
- HM prediction: H:MM:SS [one-line reason if it moved]
- Tomorrow: [concrete plan + conditions]
- Doc changes: [§ pointers, or "none"]
```

---

### 2026-07-04 (Sat)
- **Training:** AM track session — 1.2 km wu, 3.2 km @ 4:06/km (171 HR, ~100% intensity), 1.6 km "cooldown" at 164 HR (effectively a 4th rep). 4th threshold+ session in 8 days (Jun 27: 9.1 km @102%; Jul 1: 10 km @104% ≈ race-effort 10K; Jul 2 tempo).
- **Wellness:** HRV 94 (best in 2 wks), RHR 46 (floor), sleep 7.9 h / score 94, VO2max est 54. Recovery green; load pattern flashing yellow (all intensity, no easy volume).
- **Fitness:** CTL 19, ATL ~27, form ≈ −8, ramp rate positive. HM prediction: **1:38**.
- **Strength:** none.
- **Plan for tomorrow (Sun Jul 5):** Easy long run, 65 min @ 5:45/km flat (~11.3 km) — negotiated from original rx of 6:15–6:45/km; athlete self-publishing to calendar. Optional 4×20 s strides if smooth; skip if Achilles cranky on waking. Bad sleep tonight (<6 h or HRV → 70s) downgrades to 40–45 min. Sleep can only downgrade, never upgrade. Next quality: no sooner than Tue Jul 7. Expected prediction if executed: ~1:37:45.

### 2026-07-05 (Sun)
- Morning wellness: sleep 7h55m, score 86, quality 2 (=good), HRV 95, RHR 47. Green light.
- **Fitness metrics (post-run, from Intervals.icu): CTL 20.3 (from 18.5), ATL 33.5 (from 23.2), form −13.2, ramp rate +2.7 CTL/wk, VO2max est 54.** [Standing convention: log CTL/ATL/form/ramp + VO2max daily from wellness; add weight 7-day avg once weigh-ins begin.]
- **Run (9:07 AM): 12.04 km, 65 min, 5:24/km avg, HR 156 (84% int.), load 77** vs planned 65 min @ 5:45 (~load 45). Stream reading (corrected): first km ~5:35–5:40, on prescription; then a one-way squeeze — 5:20s by mid-run, 5:10–5:20 over the final third — an unplanned progression, with HR drifting 140s → 160s and hill surges 340–410 W vs ~255 W cruise (route 54 m gain). Decoupling ~6% (baseline logged in §6). Cadence 172–174 spm steady. Milestone: longest run since Mar 22. Takeaway: start discipline was good; the failure mode is holding the ceiling in the back half.
- Week context: on-call, no Tue run club. Solo quality planned Tue/Wed: 15 min easy + 4–5×5 min @ 4:25–4:35/km (90 s jog) + 10 min easy, interruption-tolerant; fallback = strides on easy runs, bank volume.
- **HM prediction: 1:37:45.**
- Tomorrow (Mon Jul 6): OFF or ≤25 min true jog (load-77 bill). Tue intervals conditional on quiet Monday. Next Sun: decoupling test — 65 min @ honest 5:45, pass = HR <148 throughout.
- Doc changes today: §1 Achilles reframe (healthy, 25 mo post, 10.5 mo PT) + sleep-scale convention; §3 personality — pace-execution pattern confirmed, consistency-risk = life crunch (Mar–Apr gap = work busy); §6 weekly template, proportion-based quality budget, Sat-tempo gates, Labor Day 1:20 checkpoint, decoupling marker.

### 2026-07-06 (Mon)
- Morning wellness: sleep 7h40m, score 95, quality 1 (excellent), HRV 89, RHR 46. Green.
- Fitness metrics: CTL 20.5 (from 20.3), ATL 32.6, form −12.1, ramp +3.3/wk, VO2max 54.
- Run (9:20 PM): 4.88 km, 25:16, 5:10/km avg, HR 150 (79% int.), load 27 — vs prescribed OFF or ≤25 min TRUE jog. Duration compliant, intensity not (true jog ≈ load 12–15). Streams: opened 5:20s, crept to 5:05–5:15 with pushes to 4:50s; HR one-way 144 → low 160s. Cadence 170–174. Third consecutive day in the 79–96% band.
- Strength: none. HM prediction: **1:37:45** (unchanged — fatigue, not fitness signal).
- Tomorrow (Tue Jul 7): **fully OFF** — Monday-quiet condition not met, interval session moves to Wed Jul 8 (15 min easy + 4–5×5 min @ 4:25–4:35/km, 90 s jog + 10 min easy). Tue homework: first weighted calf session (heavy slow, 3–4×8–10 straight-leg + bent-knee). Late-night run (ended ~10 PM) — protect sleep before quality day.
- Doc changes: none.

---

## Appendix: full activity dataset (Jan 1, 2022 – Jul 4, 2026)

1,055 run activities pulled from Intervals.icu. Columns: date, distance (m), moving time (s), avg HR, intensity (% of threshold, blank = short/unrated), training load (TSS), activity name. Warm-ups/intervals/cool-downs logged as separate activities. Pace-curve bests in §4 use elapsed time and may slightly understate moving-time performance.

```csv
date,dist_m,mov_s,hr,intensity,load,name
2022-01-01,11067.7,3043,168.0,98.5,82,Chilliwack Running
2022-01-05,2266.88,1413,102.0,42.1,7,Chilliwack Running
2022-01-10,1348.17,378,137.0,,5,San Mateo Running
2022-01-10,1763.03,463,154.0,,9,San Mateo Running
2022-01-11,2585.64,502,150.0,,13,Burlingame Running
2022-01-11,1782.19,608,162.0,90.3,14,Burlingame Running
2022-01-11,2789.06,745,152.0,85.1,15,Burlingame Running
2022-01-12,12984.15,3361,163.0,92.4,81,San Mateo Running
2022-01-13,13879.09,3773,160.0,88.9,85,San Mateo Running
2022-01-18,2727.32,731,153.0,84.9,15,Burlingame Running
2022-01-18,3152.29,614,158.0,90.3,14,Burlingame Running
2022-01-18,1767.11,564,160.0,,13,Burlingame Running
2022-01-19,7142.21,1893,160.0,89.3,42,San Mateo Running
2022-01-20,13014.22,3327,173.0,103.4,101,San Mateo Running
2022-01-21,2222.03,690,133.0,68.2,9,San Mateo Running
2022-01-24,1118.31,308,124.0,,3,San Mateo Running
2022-01-25,2773.72,728,144.0,76.3,12,Burlingame Running
2022-01-25,3122.02,586,151.0,,12,Burlingame Running
2022-01-25,1799.86,578,155.0,,12,Burlingame Running
2022-01-26,13013.56,3382,160.0,88.3,75,San Mateo Running
2022-01-27,13947.87,3787,161.0,88.7,84,San Mateo Running
2022-01-28,2868.85,1093,113.0,53.6,9,San Mateo Running
2022-01-29,1923.06,539,157.0,,12,San Mateo Running
2022-01-29,10010.0,2452,177.0,107.0,78,San Mateo - 10k progression
2022-01-29,1909.5,545,163.0,,13,San Mateo Running
2022-01-30,13413.46,3395,174.0,102.9,102,San Mateo Running
2022-02-01,3156.53,579,153.0,,12,Burlingame Running
2022-02-01,2791.8,712,145.0,76.3,12,Burlingame Running
2022-02-01,1766.63,665,167.0,95.1,17,Burlingame Running
2022-02-02,15085.05,3814,161.0,89.4,86,San Mateo Running
2022-02-03,13975.66,4178,145.0,73.5,64,San Mateo Running
2022-02-04,2015.06,580,130.0,,7,San Mateo Running
2022-02-05,1792.03,513,153.0,,10,San Mateo Running
2022-02-05,3846.17,1242,151.0,81.6,23,San Francisco Running
2022-02-05,5010.0,1112,172.0,101.6,32,San Mateo Track Running
2022-02-05,2609.48,696,155.0,84.7,14,San Francisco Running
2022-02-05,1090.0,350,150.0,,6,San Mateo Track Running
2022-02-08,2367.06,438,157.0,,11,Burlingame Running
2022-02-08,1770.05,538,161.0,,12,Burlingame Running
2022-02-08,2755.33,691,137.0,72.1,10,Burlingame Running
2022-02-09,2506.99,687,140.0,70.7,10,San Francisco Running
2022-02-09,8350.0,2008,155.0,85.8,43,San Francisco Running
2022-02-09,2478.75,660,169.0,95.5,17,San Francisco Running
2022-02-10,13875.18,3719,155.0,84.9,76,San Mateo Running
2022-02-10,577.97,99,117.0,,1,Burlingame Running
2022-02-12,1210.0,218,160.0,,5,San Mateo Track Running
2022-02-12,4610.27,1649,147.0,76.8,27,San Francisco Running
2022-02-12,410.0,104,133.0,,1,San Mateo Track Running
2022-02-15,810.0,235,141.0,,3,Burlingame Track Running
2022-02-15,1610.0,291,156.0,,6,Burlingame Track Running
2022-02-16,1610.0,712,129.0,59.3,7,San Mateo Track Running
2022-02-18,8015.65,2079,158.0,87.7,45,Chilliwack Running
2022-02-19,15052.22,3754,166.0,94.9,94,Chilliwack Running
2022-02-21,10013.71,2549,163.0,93.2,62,Chilliwack Running
2022-02-26,8012.28,2209,161.0,91.2,51,Chilliwack Running
2022-03-01,2804.58,752,143.0,75.7,12,Burlingame Running
2022-03-01,4698.9,968,160.0,90.3,22,Burlingame Running
2022-03-01,3448.31,1078,162.0,90.5,25,Burlingame Running
2022-03-02,2368.49,659,160.0,88.9,15,San Francisco Running
2022-03-03,13862.1,3797,153.0,81.3,72,San Mateo Running
2022-03-05,4844.5,1751,128.0,60.7,18,San Francisco Running
2022-03-05,6010.0,1367,165.0,94.2,34,San Mateo Track Running
2022-03-05,785.68,227,142.0,,3,San Mateo Running
2022-03-06,9550.57,2390,151.0,80.8,44,San Mateo Running
2022-03-06,2460.97,735,160.0,87.3,16,San Mateo Running
2022-03-08,4452.22,1344,159.0,88.1,29,Burlingame Running
2022-03-08,2165.71,580,142.0,,9,Burlingame Running
2022-03-08,1740.15,424,132.0,,5,Burlingame Running
2022-03-08,4936.46,1075,170.0,98.5,29,Burlingame Running
2022-03-10,13674.05,3660,153.0,82.4,71,San Mateo Running
2022-03-12,2810.0,625,151.0,83.1,12,San Mateo Track Running
2022-03-12,4010.83,1059,150.0,82.5,20,San Mateo Running
2022-03-12,5309.39,1728,140.0,70.6,24,San Francisco Running
2022-03-13,17013.94,4212,166.0,95.2,108,San Mateo Running
2022-03-16,2588.27,714,143.0,74.3,11,San Francisco Running
2022-03-16,7147.22,1736,147.0,77.3,29,San Francisco Running
2022-03-16,4317.86,1176,159.0,89.2,26,San Francisco Running
2022-03-17,13896.71,3780,150.0,79.9,68,San Mateo Running
2022-03-19,1936.95,509,150.0,,9,San Mateo Running
2022-03-19,3845.21,1180,148.0,76.1,19,San Francisco Running
2022-03-19,1933.05,531,145.0,,9,San Mateo Running
2022-03-19,6010.0,1374,168.0,97.0,36,San Mateo Track Running
2022-03-20,13295.98,3380,161.0,90.4,78,San Mateo Running
2022-03-22,2382.59,650,143.0,74.4,10,Burlingame Running
2022-03-22,7607.29,1663,178.0,109.1,55,Burlingame Running
2022-03-22,3705.41,1194,147.0,75.2,19,Burlingame Running
2022-03-23,2457.11,746,133.0,65.8,9,San Francisco Running
2022-03-23,8979.8,2565,134.0,67.9,33,San Francisco Running
2022-03-23,2577.1,809,149.0,78.1,14,San Francisco Running
2022-03-24,13922.91,3766,149.0,79.8,67,San Mateo Running
2022-03-26,1201.63,334,145.0,,6,San Mateo Running
2022-03-26,6010.0,1381,161.0,89.7,31,San Mateo Track Running
2022-03-27,12940.56,3326,156.0,85.0,68,San Mateo Running
2022-03-29,2783.74,719,141.0,74.1,11,Burlingame Running
2022-03-29,3196.24,617,163.0,96.1,16,Burlingame Running
2022-03-29,1555.35,358,153.0,,7,Burlingame Running
2022-03-29,3856.29,1196,150.0,79.2,21,Burlingame Running
2022-03-31,13867.66,3604,156.0,84.3,74,San Mateo Running
2022-04-02,1898.27,496,149.0,,9,San Mateo Running
2022-04-02,6000.0,1362,178.0,108.9,45,San Mateo Track Running
2022-04-02,1889.47,543,157.0,,11,San Mateo Running
2022-04-05,1751.97,519,128.0,,6,Burlingame Running
2022-04-05,3514.45,1105,161.0,89.4,25,Burlingame Running
2022-04-05,4928.15,990,161.0,90.6,23,Burlingame Running
2022-04-05,2139.83,533,124.0,,5,Burlingame Running
2022-04-07,898.62,182,148.0,,3,Burlingame Running
2022-04-07,13822.2,3647,161.0,90.5,86,San Mateo Running
2022-04-10,2000.89,586,123.0,,6,San Mateo Running
2022-04-11,5582.88,1739,140.0,70.5,24,San Mateo County Running
2022-04-19,973.41,377,144.0,,6,Burlingame Running
2022-04-19,5010.0,1089,163.0,92.5,26,Burlingame Track Running
2022-04-19,581.42,179,151.0,,4,Burlingame Running
2022-04-19,906.67,284,128.0,,3,Burlingame Running
2022-05-02,6177.66,1689,165.0,94.6,42,San Mateo Running
2022-05-03,2427.81,674,147.0,78.9,12,Burlingame Running
2022-05-03,4820.3,1022,167.0,96.6,28,Burlingame Running
2022-05-03,3479.72,1026,163.0,91.8,24,Burlingame Running
2022-05-04,2530.46,729,159.0,84.6,15,San Francisco Running
2022-05-04,9455.97,2308,160.0,90.9,54,San Francisco Running
2022-05-04,2559.2,722,147.0,77.3,12,San Francisco Running
2022-05-05,1231.61,391,135.0,,5,Burlingame Running
2022-05-05,8659.42,2235,163.0,91.1,53,Burlingame Running
2022-05-05,1271.49,394,142.0,,6,Burlingame Running
2022-05-07,5440.0,1511,153.0,85.5,31,Treadmill Running
2022-05-08,10405.3,2744,163.0,90.9,65,San Mateo Running
2022-05-08,4711.79,1552,138.0,69.4,21,Palo Alto Running
2022-05-10,3251.35,1008,152.0,81.1,19,Burlingame Running
2022-05-10,4201.04,861,157.0,86.2,18,Burlingame Running
2022-05-10,1739.64,515,143.0,,8,Burlingame Running
2022-05-11,2607.45,655,149.0,84.5,13,San Francisco Running
2022-05-11,8441.68,2041,151.0,80.0,39,San Francisco Running
2022-05-11,2610.72,694,158.0,87.9,15,San Francisco Running
2022-05-12,1260.29,381,122.0,,4,Burlingame Running
2022-05-12,8681.78,2218,154.0,82.5,42,Burlingame Running
2022-05-12,1314.14,400,134.0,,5,Burlingame Running
2022-05-14,347.53,117,120.0,,1,San Francisco Running
2022-05-14,4864.37,1669,140.0,70.4,23,San Francisco Running
2022-05-14,1283.17,358,129.0,,4,San Mateo Running
2022-05-14,7790.0,2100,,,0,Late night treadmill
2022-05-15,1347.42,357,155.0,,8,San Mateo Running
2022-05-15,8403.19,2250,160.0,90.5,52,San Mateo Running
2022-05-17,3408.24,1041,154.0,83.0,20,Burlingame Running
2022-05-17,10010.81,2237,173.0,102.9,66,Burlingame Running
2022-05-17,2815.97,752,150.0,81.6,14,Burlingame Running
2022-05-18,2513.89,679,146.0,74.9,11,San Francisco Running
2022-05-18,5266.92,1208,163.0,100.2,34,San Francisco Running
2022-05-18,6522.63,1731,165.0,92.7,42,San Francisco Running
2022-05-19,11656.14,3377,140.0,70.8,48,Burlingame Running
2022-05-20,1041.61,311,134.0,,4,San Mateo Running
2022-05-21,1764.33,483,152.0,,10,San Mateo Running
2022-05-21,1210.0,280,164.0,,7,San Mateo Track Running
2022-05-21,2240.0,612,158.0,87.4,13,San Mateo Track Running
2022-05-21,1828.11,502,151.0,,9,San Mateo Running
2022-05-22,12915.66,3281,169.0,98.0,90,San Mateo Running
2022-05-24,1800.52,557,147.0,,9,Burlingame Running
2022-05-24,4221.03,885,163.0,102.3,26,Burlingame Running
2022-05-24,2385.37,684,146.0,76.0,11,Burlingame Running
2022-05-25,2508.97,673,149.0,78.4,12,San Francisco Running
2022-05-25,9527.29,2245,158.0,87.6,50,San Francisco Running
2022-05-25,2583.81,670,164.0,91.6,16,San Francisco Running
2022-05-26,13872.62,3718,151.0,79.7,68,San Mateo Running
2022-05-28,5225.63,1766,131.0,63.1,20,San Francisco Running
2022-05-28,1753.27,481,147.0,,8,San Mateo Running
2022-05-28,5010.0,1134,170.0,99.1,31,San Mateo Track Running
2022-05-28,3529.54,966,155.0,84.1,19,San Mateo Running
2022-05-29,14282.3,3618,163.0,92.4,88,San Mateo Running
2022-05-29,2727.96,765,157.0,81.3,15,San Mateo Running
2022-05-31,1767.98,545,153.0,,10,Burlingame Running
2022-05-31,6283.42,1213,160.0,95.0,31,Burlingame Running
2022-05-31,1828.16,517,136.0,,7,Burlingame Running
2022-06-01,2520.85,667,144.0,73.4,10,San Francisco Running
2022-06-01,7422.67,2029,144.0,74.0,31,San Francisco Running
2022-06-02,8670.39,2377,144.0,75.3,38,Burlingame Running
2022-06-04,4728.71,1488,146.0,76.1,24,Redwood City Running
2022-06-05,1081.14,302,148.0,,5,San Carlos Running
2022-06-05,4693.12,974,180.0,112.0,34,San Carlos Running
2022-06-05,3202.14,1094,138.0,67.9,14,San Carlos Running
2022-06-14,353.33,137,136.0,,2,Burlingame Running
2022-06-14,420.0,163,140.0,,2,Burlingame Running
2022-06-14,553.63,127,164.0,,4,Burlingame Running
2022-06-14,959.33,189,179.0,,7,Burlingame Running
2022-06-14,5041.7,1053,183.0,116.7,40,Burlingame Running
2022-06-14,1842.16,524,144.0,,9,Burlingame Running
2022-06-15,2574.95,700,150.0,80.3,13,San Francisco Running
2022-06-15,9368.3,2176,151.0,82.1,42,San Francisco Running
2022-06-15,2517.62,682,153.0,82.8,13,San Francisco Running
2022-06-16,13832.4,4036,148.0,74.9,66,San Mateo Running
2022-06-19,757.41,333,75.0,,1,Nanaimo District Running
2022-06-19,2132.54,966,,,0,Nanaimo District Running
2022-06-22,4877.75,1292,154.0,85.0,26,Nanaimo District Running
2022-06-25,16138.41,4272,170.0,99.2,118,Chilliwack Running
2022-06-26,8346.33,2254,157.0,87.9,49,Chilliwack Running
2022-06-28,3978.02,783,160.0,90.5,18,Burlingame Running
2022-06-28,1766.12,543,158.0,,12,Burlingame Running
2022-06-29,2891.81,793,142.0,71.2,12,San Francisco Running
2022-06-29,7073.74,1723,145.0,71.4,28,San Francisco Running
2022-06-29,4323.89,1133,165.0,93.3,28,San Francisco Running
2022-06-30,13916.96,3806,154.0,82.7,74,San Mateo Running
2022-07-03,17020.62,4551,164.0,92.7,109,San Mateo Running
2022-07-05,2004.85,594,140.0,72.0,9,Burlingame Running
2022-07-05,7453.96,1701,169.0,99.5,47,Burlingame Running
2022-07-05,3860.37,1180,153.0,81.6,22,Burlingame Running
2022-07-05,7842.24,6645,86.0,31.6,19,San Mateo County Running
2022-07-06,2701.22,738,143.0,73.2,11,San Francisco Running
2022-07-06,3017.62,785,168.0,95.7,20,San Francisco Running
2022-07-06,8639.7,2067,151.0,77.2,39,San Francisco Running
2022-07-07,13844.95,3816,151.0,79.4,69,San Mateo Running
2022-07-09,1751.31,467,145.0,,8,San Mateo Running
2022-07-09,810.0,470,108.0,,3,San Mateo Track Running
2022-07-09,8010.0,1992,172.0,101.4,57,San Mateo Track Running
2022-07-09,1925.69,511,158.0,,11,San Mateo Running
2022-07-10,7478.05,1996,151.0,80.6,37,San Mateo Running
2022-07-12,1838.67,501,140.0,,8,Burlingame Running
2022-07-12,4019.18,770,154.0,85.7,16,Burlingame Running
2022-07-12,3469.82,1099,154.0,82.8,21,Burlingame Running
2022-07-13,2525.76,680,143.0,76.3,11,San Francisco Running
2022-07-13,9200.52,2102,154.0,86.4,44,San Francisco Running
2022-07-13,2555.48,669,154.0,83.0,13,San Francisco Running
2022-07-14,16160.36,4191,160.0,89.1,95,San Mateo Running
2022-07-16,2506.53,589,161.0,,14,San Francisco Running
2022-07-16,2501.4,560,171.0,,16,San Francisco Running
2022-07-18,4236.15,1103,151.0,78.1,20,San Mateo Running
2022-07-20,1306.37,342,153.0,,7,San Francisco Running
2022-07-24,710.65,202,141.0,,3,San Francisco Running
2022-07-24,5014.5,1027,175.0,104.0,31,San Francisco Running
2022-07-28,13896.08,3468,156.0,85.5,72,San Mateo Running
2022-07-30,4908.32,1835,133.0,63.5,21,Alameda County Running
2022-07-31,17911.0,4668,164.0,93.6,114,San Mateo Running
2022-08-02,1771.43,590,154.0,,12,Burlingame Running
2022-08-02,1927.97,547,133.0,,7,Burlingame Running
2022-08-02,4665.08,909,145.0,76.6,15,Burlingame Running
2022-08-05,4295.69,1156,148.0,79.4,21,Ealing Running
2022-08-09,2669.08,739,160.0,91.2,18,Ealing Running
2022-08-09,7702.07,1904,171.0,102.3,56,City of London Running
2022-08-18,9425.73,2700,157.0,84.9,57,San Mateo Running
2022-08-19,4983.28,1810,147.0,75.7,30,San Mateo Running
2022-08-20,1924.41,524,158.0,,11,San Mateo Running
2022-08-20,4000.0,1886,178.0,108.6,62,San Mateo Track Running
2022-08-20,2010.0,460,184.0,,17,San Mateo Track Running
2022-08-20,2711.19,735,169.0,99.0,20,San Mateo Running
2022-08-21,18550.25,4865,163.0,92.8,119,San Mateo Running
2022-08-23,3399.79,1005,156.0,84.5,20,Burlingame Running
2022-08-23,3405.9,666,145.0,76.7,11,Burlingame Running
2022-08-23,1912.3,541,140.0,,8,Burlingame Running
2022-08-24,2522.19,677,147.0,79.5,12,San Francisco Running
2022-08-24,8231.91,1920,146.0,77.7,33,San Francisco Running
2022-08-24,2574.52,718,150.0,79.7,13,San Francisco Running
2022-08-25,13842.89,3743,156.0,84.2,76,San Mateo Running
2022-08-27,5530.35,1708,151.0,79.5,30,Oakland Running
2022-08-28,1647.98,473,126.0,,5,Burlingame Running
2022-08-28,800.0,208,140.0,,3,Burlingame Track Running
2022-08-28,13215.92,3005,169.0,102.6,88,Burlingame Running
2022-08-28,4804.85,1356,164.0,93.6,33,Burlingame Running
2022-08-29,4844.57,1577,131.0,63.6,18,Palo Alto Running
2022-08-30,3438.74,978,160.0,89.9,22,Burlingame Running
2022-08-30,1812.74,506,135.0,,7,Burlingame Running
2022-08-30,4395.51,910,149.0,79.3,16,Burlingame Running
2022-09-01,13820.45,3525,152.0,81.3,66,San Mateo Running
2022-09-03,4824.71,1429,149.0,79.3,25,San Mateo County Running
2022-09-03,1769.32,488,144.0,,8,San Mateo Running
2022-09-03,2400.0,574,157.0,,12,San Mateo Track Running
2022-09-03,1947.89,538,140.0,,8,San Mateo Running
2022-09-04,7580.32,2041,152.0,82.6,39,San Mateo Running
2022-09-05,4864.03,1963,122.0,57.3,18,San Mateo Running
2022-09-06,1787.19,531,127.0,,6,Burlingame Running
2022-09-06,1752.81,443,131.0,,5,Burlingame Running
2022-09-06,3267.33,634,160.0,91.6,15,Burlingame Running
2022-09-06,1814.67,564,148.0,,10,Burlingame Running
2022-09-07,11057.76,2815,153.0,84.6,57,San Mateo Running
2022-09-08,13863.84,3709,156.0,86.2,77,Burlingame Running
2022-09-10,5020.0,1120,170.0,99.6,31,San Mateo Track Running
2022-09-10,3928.93,1091,154.0,83.2,21,San Mateo Running
2022-09-10,4931.48,1406,150.0,80.0,25,San Francisco Running
2022-09-10,1775.1,475,148.0,,8,San Mateo Running
2022-09-11,22018.9,5871,163.0,90.8,136,San Mateo Running
2022-09-12,4886.85,1573,140.0,71.0,22,Santa Clara Running
2022-09-13,1750.48,482,139.0,,7,Burlingame Running
2022-09-13,7839.74,1625,162.0,92.7,39,Burlingame Running
2022-09-13,1741.89,535,147.0,,9,Burlingame Running
2022-09-14,2425.48,664,141.0,73.4,10,San Francisco Running
2022-09-14,9005.65,2112,151.0,81.9,40,San Francisco Running
2022-09-14,2523.88,746,156.0,83.3,15,San Francisco Running
2022-09-15,13886.18,3756,147.0,77.5,64,San Mateo Running
2022-09-17,1133.63,313,135.0,,4,Burlingame Running
2022-09-17,4772.43,1698,144.0,72.7,25,Alameda County Running
2022-09-17,12724.53,2950,167.0,96.3,76,Burlingame Running
2022-09-18,17305.46,4479,162.0,91.7,106,San Mateo Running
2022-09-18,2015.43,581,159.0,,13,San Mateo Running
2022-09-19,4166.99,1082,143.0,72.2,16,San Mateo Running
2022-09-20,1758.47,516,137.0,,7,Burlingame Running
2022-09-20,6812.47,1476,165.0,96.2,38,Burlingame Running
2022-09-20,617.22,127,158.0,,3,Burlingame Running
2022-09-20,4179.14,1411,138.0,67.7,18,Burlingame Running
2022-09-21,2546.42,700,146.0,75.2,11,San Francisco Running
2022-09-21,2391.42,648,147.0,77.3,11,San Francisco Running
2022-09-21,9562.66,2222,160.0,91.1,52,San Francisco Running
2022-09-22,13907.51,3815,145.0,74.3,60,San Mateo Running
2022-09-24,1843.39,537,135.0,,7,Redwood City Running
2022-09-24,11251.65,2487,169.0,97.7,66,Redwood City Running
2022-09-24,2259.63,524,165.0,,13,Redwood City Running
2022-09-24,3036.66,842,160.0,87.7,18,Redwood City Running
2022-09-24,3256.66,1380,131.0,62.6,15,Burlingame Running
2022-09-25,10855.74,2931,150.0,79.5,52,San Mateo Running
2022-09-25,1604.14,424,154.0,,8,San Mateo Running
2022-09-27,7775.99,1666,157.0,86.7,35,Burlingame Running
2022-09-27,1761.71,528,139.0,,7,Burlingame Running
2022-09-27,1769.55,709,146.0,78.1,12,Burlingame Running
2022-09-28,3802.29,2337,92.0,34.5,8,San Mateo Running
2022-09-29,8662.08,2564,149.0,78.5,44,Burlingame Running
2022-10-01,771.46,203,130.0,,2,San Mateo Running
2022-10-01,6460.23,1418,170.0,101.0,42,San Mateo Running
2022-10-01,10062.29,8955,95.0,37.5,37,El Dorado County Trail Running
2022-10-02,14004.36,11663,97.0,36.1,46,El Dorado County Trail Running
2022-10-04,1730.02,507,138.0,,7,Burlingame Running
2022-10-04,3304.03,705,166.0,95.5,18,Burlingame Running
2022-10-04,1813.95,538,144.0,,9,Burlingame Running
2022-10-06,8689.52,2458,152.0,80.2,45,Burlingame Running
2022-10-08,3264.93,1423,121.0,54.9,12,San Jose Running
2022-10-09,773.93,223,157.0,,5,San Jose Running
2022-10-09,832.61,220,159.0,,5,San Jose Running
2022-10-09,13058.45,2964,171.0,99.8,82,San Jose Running
2022-10-10,6844.78,2241,132.0,61.7,25,San Mateo Running
2022-10-10,1756.21,493,120.0,,4,San Mateo Running
2022-10-11,6325.04,1268,157.0,87.3,27,Burlingame Running
2022-10-11,3392.04,1076,152.0,81.3,20,Burlingame Running
2022-10-11,1793.49,482,143.0,,7,Burlingame Running
2022-10-12,12797.51,3876,136.0,71.0,56,San Francisco Running
2022-10-15,4894.39,1696,132.0,61.7,18,Fremont Running
2022-10-16,21130.15,5340,165.0,93.9,131,San Mateo Running
2022-10-16,1298.82,375,156.0,,8,San Mateo Running
2022-10-18,1763.71,554,147.0,,9,Burlingame Running
2022-10-18,1798.12,479,144.0,,9,Burlingame Running
2022-10-18,5968.55,1308,176.0,106.2,41,Burlingame Running
2022-10-18,3143.61,694,177.0,106.8,22,Burlingame Running
2022-10-19,2572.3,671,139.0,73.2,10,San Francisco Running
2022-10-19,7355.6,1667,148.0,78.3,31,San Francisco Running
2022-10-19,1228.7,325,144.0,,5,San Francisco Running
2022-10-20,8645.08,2564,139.0,69.9,35,Burlingame Running
2022-10-22,3018.88,678,156.0,89.2,15,San Mateo Running
2022-10-22,1499.59,424,144.0,,7,San Mateo Running
2022-10-22,4849.99,1370,152.0,84.1,27,San Francisco Running
2022-10-22,1523.5,406,140.0,,6,San Mateo Running
2022-10-23,17497.22,4606,161.0,89.6,104,San Mateo Running
2022-10-23,2740.47,750,155.0,84.0,15,San Mateo Running
2022-10-24,4853.52,1685,131.0,63.6,19,Campbell Running
2022-10-25,1724.6,515,133.0,,6,Burlingame Running
2022-10-25,2658.85,647,124.0,56.4,6,Burlingame Running
2022-10-25,4189.76,854,146.0,76.5,14,Burlingame Running
2022-10-25,1832.72,579,142.0,68.9,8,Burlingame Running
2022-10-26,9661.31,2491,154.0,83.9,50,San Mateo County Running
2022-10-26,5433.39,3133,116.0,51.1,38,San Jose Running
2022-10-27,810.0,263,135.0,,3,San Francisco Track Running
2022-10-27,400.54,165,100.0,,1,San Francisco Running
2022-10-30,21134.16,5490,153.0,84.3,109,San Mateo Running
2022-10-30,2351.3,650,152.0,80.7,12,San Mateo Running
2022-11-01,1806.64,523,128.0,,6,Burlingame Running
2022-11-01,6263.94,1237,154.0,87.7,27,Burlingame Running
2022-11-01,1771.73,571,152.0,,11,Burlingame Running
2022-11-02,17158.67,4541,148.0,77.0,77,San Mateo Running
2022-11-02,8579.51,2915,134.0,64.9,35,San Mateo Running
2022-11-05,846.87,233,144.0,,4,San Mateo Running
2022-11-05,10020.0,2322,164.0,94.0,57,San Mateo Track Running
2022-11-05,810.0,218,115.0,,2,San Mateo Track Running
2022-11-05,3269.47,1408,111.0,48.0,9,Santa Clara Running
2022-11-06,7861.58,2078,143.0,73.9,32,San Mateo Running
2022-11-08,1757.81,512,141.0,,8,Burlingame Running
2022-11-08,5048.15,1068,160.0,89.9,24,Burlingame Running
2022-11-08,3498.16,1170,155.0,83.7,23,Burlingame Running
2022-11-09,17017.08,4381,154.0,84.0,87,San Mateo Running
2022-11-10,3754.34,1375,127.0,58.9,14,San Mateo Running
2022-11-10,13895.87,3799,142.0,72.5,57,San Mateo Running
2022-11-12,4793.47,1720,119.0,54.0,14,Redwood City Running
2022-11-12,810.0,220,130.0,,3,San Mateo Track Running
2022-11-12,270.0,84,126.0,,1,San Mateo Track Running
2022-11-12,5010.0,1150,164.0,93.5,28,San Mateo Track Running
2022-11-13,24234.18,6355,159.0,86.7,134,San Mateo Running
2022-11-15,7035.5,1507,163.0,93.8,37,Burlingame Running
2022-11-15,1746.12,500,130.0,,6,Burlingame Running
2022-11-15,4643.55,1799,133.0,64.3,21,San Mateo Running
2022-11-15,1070.34,352,152.0,,7,Burlingame Running
2022-11-17,13806.69,3745,146.0,75.6,62,San Mateo Running
2022-11-19,4947.56,1672,132.0,63.9,19,San Francisco Running
2022-11-21,4870.29,1201,150.0,81.2,22,San Mateo Running
2022-11-22,5016.59,1212,157.0,85.3,25,San Mateo Running
2022-11-23,5000.32,3518,88.0,31.9,10,San Mateo Running
2022-11-24,1278.18,346,153.0,,7,San Mateo Running
2022-11-24,4926.49,994,169.0,100.7,28,San Mateo Running
2022-11-24,2471.04,976,136.0,64.7,12,San Mateo Running
2022-11-27,4194.57,1144,146.0,77.1,19,San Mateo Running
2022-11-28,795.8,348,121.0,,3,Campbell Running
2022-11-28,3205.49,679,141.0,75.9,11,Campbell Running
2022-11-29,1061.52,363,142.0,,6,Burlingame Running
2022-11-29,1740.46,515,140.0,,8,Burlingame Running
2022-11-29,6314.47,1356,141.0,74.0,21,Burlingame Running
2022-12-01,13426.95,3635,155.0,82.3,70,San Mateo Running
2022-12-03,4872.67,1669,135.0,67.3,21,Alameda County Running
2022-12-04,14388.68,3751,167.0,98.6,102,San Mateo Running
2022-12-05,2134.2,868,124.0,55.9,8,San Mateo Running
2022-12-05,5660.0,1488,151.0,80.7,27,San Mateo Track Running
2022-12-06,1752.78,479,136.0,,6,Burlingame Running
2022-12-06,4933.01,940,149.0,82.3,18,Burlingame Running
2022-12-06,618.51,147,166.0,,4,Burlingame Running
2022-12-06,1772.74,596,156.0,,12,Burlingame Running
2022-12-08,13456.07,3712,159.0,87.4,81,San Mateo Running
2022-12-09,5716.44,1494,140.0,70.6,21,San Mateo Running
2022-12-10,14799.78,3737,148.0,76.3,62,San Mateo Running
2022-12-11,24506.68,6432,160.0,88.0,140,San Mateo Running
2022-12-12,804.79,291,119.0,,3,San Francisco Running
2022-12-12,4807.8,1030,155.0,87.4,22,San Francisco Running
2022-12-13,1837.56,520,149.0,,10,Burlingame Running
2022-12-13,2180.75,547,127.0,,5,Burlingame Running
2022-12-13,1603.41,299,157.0,,7,Burlingame Running
2022-12-13,2343.81,714,134.0,67.4,9,Burlingame Running
2022-12-13,1613.06,318,140.0,,4,Burlingame Running
2022-12-14,14023.29,3695,144.0,74.7,58,San Mateo Running
2022-12-15,13429.53,3786,145.0,73.4,59,San Mateo Running
2022-12-16,13282.93,3516,151.0,80.2,64,San Mateo Running
2022-12-17,4715.1,1410,146.0,76.6,23,San Francisco Running
2022-12-20,7028.89,1857,151.0,80.4,34,San Mateo Running
2022-12-25,7883.31,2375,153.0,83.1,46,Chilliwack Running
2022-12-26,3294.19,864,163.0,93.5,21,Chilliwack Running
2022-12-28,1382.33,1139,83.0,28.6,3,Chilliwack Running
2022-12-29,2003.48,1593,84.0,30.0,4,Chilliwack Running
2023-01-01,6818.49,2483,136.0,67.2,32,San Mateo Running
2023-01-03,1839.34,527,142.0,,8,Burlingame Running
2023-01-03,8521.2,1989,168.0,97.0,52,Burlingame Running
2023-01-03,1762.58,610,154.0,82.7,12,Burlingame Running
2023-01-05,11061.99,3301,148.0,75.9,55,San Mateo Running
2023-01-09,4008.37,1074,148.0,78.7,19,San Mateo Running
2023-01-10,1664.77,499,140.0,,7,Burlingame Running
2023-01-10,5281.08,1180,162.0,90.6,27,Burlingame Running
2023-01-10,1816.81,579,153.0,,11,Burlingame Running
2023-01-11,1940.0,533,138.0,,7,San Mateo Track Running
2023-01-11,250.0,82,120.0,,1,San Mateo Track Running
2023-01-13,7082.94,1818,148.0,78.1,31,San Mateo Running
2023-01-14,5210.0,1207,173.0,102.0,35,San Mateo Track Running
2023-01-14,1505.49,385,149.0,,7,San Mateo Running
2023-01-14,800.0,445,115.0,,3,San Mateo Track Running
2023-01-14,1210.0,224,140.0,,3,San Mateo Track Running
2023-01-14,2724.28,711,163.0,92.5,17,San Mateo Running
2023-01-17,1596.78,323,169.0,,9,Burlingame Running
2023-01-17,3771.45,778,148.0,80.1,14,Burlingame Running
2023-01-17,2176.75,671,156.0,86.3,14,Burlingame Running
2023-01-17,1745.75,465,137.0,,7,Burlingame Running
2023-01-18,17732.0,4631,154.0,83.3,90,San Mateo Running
2023-01-19,13417.88,3839,148.0,77.3,66,San Mateo Running
2023-01-21,10010.0,2315,172.0,101.2,66,San Mateo Track Running
2023-01-21,810.0,231,124.0,,2,San Mateo Track Running
2023-01-21,810.0,232,151.0,,4,San Mateo Track Running
2023-01-21,4907.63,1448,150.0,80.4,26,San Jose Running
2023-01-22,5322.22,4757,78.0,22.0,8,Santa Cruz County Trail Running
2023-01-22,20259.7,5214,161.0,89.0,117,San Mateo Running
2023-01-23,820.0,308,126.0,,3,San Francisco Track Running
2023-01-23,1600.0,408,163.0,,10,San Francisco Track Running
2023-01-24,1789.03,668,159.0,87.9,15,Burlingame Running
2023-01-24,2260.48,585,128.0,,6,Burlingame Running
2023-01-24,1622.83,601,126.0,60.0,6,Burlingame Running
2023-01-25,17295.63,4496,154.0,83.1,87,San Mateo Running
2023-01-26,13774.51,3769,146.0,75.6,62,San Mateo Running
2023-01-27,3035.02,904,138.0,68.9,12,San Mateo Running
2023-01-28,3010.0,622,165.0,96.2,16,San Mateo Track Running
2023-01-28,4637.17,1655,129.0,61.1,18,Contra Costa County Running
2023-01-28,810.0,211,144.0,,3,San Mateo Track Running
2023-01-28,3618.31,924,163.0,92.5,22,San Mateo Running
2023-01-29,21141.34,5431,158.0,86.5,114,San Mateo Running
2023-01-31,1806.81,497,128.0,,6,Burlingame Running
2023-01-31,3144.82,634,133.0,66.8,8,Burlingame Running
2023-01-31,3164.85,698,154.0,84.9,14,Burlingame Running
2023-01-31,1774.52,590,147.0,,10,Burlingame Running
2023-02-02,9934.98,2704,149.0,80.6,49,Burlingame Running
2023-02-05,10026.54,2136,172.0,102.2,62,San Francisco Running
2023-02-11,1570.0,1250,88.0,33.9,4,Chilliwack Running
2023-02-15,1234.76,348,142.0,,5,San Mateo Running
2023-02-15,5660.75,1354,151.0,82.4,26,San Mateo Running
2023-02-16,13828.72,3759,155.0,85.4,78,San Mateo Running
2023-02-18,1009.09,265,143.0,,4,San Mateo Running
2023-02-18,4756.65,1513,144.0,73.6,23,Redwood City Running
2023-02-19,1734.23,961,156.0,73.7,19,San Francisco Running
2023-02-19,6288.61,4748,90.0,33.1,15,Marin County Running
2023-02-21,3393.58,749,160.0,90.4,17,Burlingame Running
2023-02-21,1826.68,548,136.0,,7,Burlingame Running
2023-02-25,4827.01,1410,138.0,69.5,19,Berkeley Running
2023-02-27,645.08,162,134.0,,2,Campbell Running
2023-02-27,3231.47,707,151.0,81.2,13,Campbell Running
2023-02-27,851.32,281,149.0,,5,Campbell Running
2023-02-27,1654.68,417,121.0,,4,San Mateo Running
2023-03-04,4850.71,1481,148.0,77.9,25,San Francisco Running
2023-03-07,1622.98,515,138.0,,7,Burlingame Running
2023-03-07,2708.74,633,146.0,78.4,11,Burlingame Running
2023-03-07,3136.25,656,159.0,90.3,15,Burlingame Running
2023-03-07,1836.0,561,155.0,,11,Burlingame Running
2023-03-09,10147.79,2810,144.0,72.4,43,San Mateo Running
2023-03-11,4970.76,1528,143.0,72.3,23,San Mateo Running
2023-03-16,13450.25,3712,163.0,91.8,89,San Mateo Running
2023-03-18,5050.08,1497,141.0,70.9,21,San Francisco Running
2023-03-28,1848.96,531,123.0,,5,Burlingame Running
2023-03-28,6318.23,1470,144.0,73.3,22,Burlingame Running
2023-03-28,1797.5,595,140.0,,9,Burlingame Running
2023-03-30,13756.05,3786,161.0,88.3,85,San Mateo Running
2023-04-01,4458.91,3677,92.0,31.4,12,Contra Costa County Trail Running
2023-04-02,4227.84,3692,78.0,24.9,7,San Mateo Trail Running
2023-04-03,6776.64,2354,148.0,74.6,39,San Mateo Running
2023-04-04,1059.46,288,119.0,,3,San Mateo Running
2023-04-04,1700.07,549,127.0,,6,Burlingame Running
2023-04-04,2159.42,524,125.0,,5,Burlingame Running
2023-04-04,2459.5,485,149.0,,9,Burlingame Running
2023-04-04,1821.33,561,154.0,,11,Burlingame Running
2023-04-07,5015.55,1849,118.0,51.2,14,San Mateo Running
2023-04-10,5264.47,1339,175.0,106.1,42,Santa Clara County Running
2023-04-10,873.64,233,144.0,,4,Santa Clara County Running
2023-04-16,9681.26,2536,170.0,101.4,74,San Mateo Running
2023-04-17,3698.98,984,149.0,80.5,18,San Mateo Running
2023-04-18,1816.02,545,144.0,,8,Burlingame Running
2023-04-18,2467.03,547,156.0,,11,Burlingame Running
2023-04-18,2588.91,602,120.0,54.1,5,Burlingame Running
2023-04-18,1754.42,554,129.0,,6,Burlingame Running
2023-04-23,5062.64,1443,152.0,81.9,27,San Mateo Running
2023-04-23,1716.55,474,145.0,,8,San Mateo Running
2023-04-27,4167.16,1134,141.0,68.8,16,San Mateo Running
2023-04-28,9066.85,2447,162.0,91.1,59,San Mateo Running
2023-04-29,5011.22,1521,149.0,77.5,26,Berkeley Running
2023-05-01,2730.3,810,141.0,72.3,12,San Francisco Running
2023-05-03,10018.97,2672,160.0,88.4,61,San Mateo Running
2023-05-04,13815.58,3814,160.0,87.7,84,San Mateo Running
2023-05-06,4843.87,1587,135.0,69.0,21,San Mateo Running
2023-05-09,1767.16,562,163.0,,14,Burlingame Running
2023-05-09,4724.65,964,147.0,79.4,17,Burlingame Running
2023-05-09,1768.66,502,131.0,,6,Burlingame Running
2023-05-10,8165.97,2067,148.0,77.5,35,San Mateo Running
2023-05-11,13769.67,3662,151.0,79.2,66,San Mateo Running
2023-05-13,4932.29,1415,145.0,78.0,24,San Francisco Running
2023-05-15,864.95,345,129.0,,4,Santa Clara County Running
2023-05-15,3242.47,671,156.0,91.9,16,Santa Clara County Running
2023-05-15,867.79,402,153.0,,8,Santa Clara County Running
2023-05-17,10017.79,2533,153.0,82.5,49,San Mateo Running
2023-05-18,13888.74,3716,157.0,86.8,80,San Mateo Running
2023-05-21,11211.05,3055,156.0,84.9,63,San Mateo Running
2023-05-23,1133.21,336,122.0,,3,Burlingame Running
2023-05-23,1620.0,313,133.0,,4,Burlingame Track Running
2023-05-23,1610.0,327,177.0,,11,Burlingame Track Running
2023-05-23,1085.09,358,155.0,,7,Burlingame Running
2023-05-24,13139.11,3431,162.0,90.2,80,San Mateo Running
2023-05-25,13879.1,3771,162.0,92.4,90,San Mateo Running
2023-05-27,5010.39,1365,155.0,86.7,29,Alameda Running
2023-05-28,12518.99,3275,167.0,96.6,85,San Mateo Running
2023-05-30,1759.13,513,134.0,,7,Burlingame Running
2023-05-30,5871.88,1225,151.0,81.8,23,Burlingame Running
2023-05-30,1831.67,549,161.0,,13,Burlingame Running
2023-05-31,12996.59,3554,154.0,83.3,70,San Mateo Running
2023-06-02,10307.1,2674,149.0,77.1,46,San Mateo Running
2023-06-03,5336.13,1321,154.0,81.7,26,San Mateo Running
2023-06-03,5011.32,1577,160.0,89.2,35,Foster City Running
2023-06-04,10129.48,2724,158.0,87.7,59,San Mateo Running
2023-06-06,4082.22,922,167.0,96.8,24,Burlingame Running
2023-06-06,1765.95,490,139.0,,7,Burlingame Running
2023-06-10,5011.09,1661,133.0,64.7,20,San Francisco Running
2023-06-12,15807.99,4320,160.0,88.1,96,San Mateo Running
2023-06-13,1723.31,467,142.0,,7,Burlingame Running
2023-06-13,4784.36,942,156.0,90.8,22,Burlingame Running
2023-06-13,1773.69,551,151.0,,10,Burlingame Running
2023-06-14,12961.17,3666,146.0,74.6,59,San Mateo Running
2023-06-17,4837.03,1378,143.0,74.0,21,Berkeley Running
2023-06-18,1001.26,418,134.0,,5,Foster City Running
2023-06-18,6646.34,1744,158.0,88.5,38,San Mateo Running
2023-06-20,1710.08,513,131.0,,6,Burlingame Running
2023-06-20,5200.25,1082,143.0,74.8,17,Burlingame Running
2023-06-20,1850.2,544,159.0,,12,Burlingame Running
2023-06-22,13867.14,3800,156.0,84.0,78,San Mateo Running
2023-06-24,4857.08,1413,150.0,79.8,25,Santa Clara Running
2023-06-25,12903.14,3426,166.0,96.1,88,San Mateo Running
2023-06-27,1808.46,593,133.0,68.5,8,Burlingame Running
2023-06-27,3224.92,706,160.0,90.1,16,Burlingame Running
2023-06-27,970.86,283,129.0,,3,Burlingame Running
2023-07-01,4850.21,1324,161.0,90.1,30,Foster City Running
2023-07-02,12267.8,3297,171.0,100.7,93,San Mateo Running
2023-07-11,1716.03,525,139.0,,8,Burlingame Running
2023-07-11,370.07,83,126.0,,1,San Mateo Running
2023-07-11,4010.0,799,157.0,86.1,17,San Mateo Track Running
2023-07-11,1183.98,392,144.0,,6,San Mateo Running
2023-07-12,9293.96,2374,157.0,87.4,51,San Francisco Running
2023-07-13,8211.0,2238,159.0,88.5,49,Burlingame Running
2023-07-15,4512.34,1042,144.0,74.3,16,San Francisco Running
2023-07-16,12505.46,3238,165.0,94.3,80,San Mateo Running
2023-07-19,2950.0,629,165.0,95.4,16,San Francisco Track Running
2023-07-19,603.75,154,152.0,,3,San Francisco Running
2023-07-22,3008.55,1128,133.0,64.4,13,San Mateo Running
2023-07-23,5079.59,1103,169.0,100.4,31,San Francisco Running
2023-07-25,2386.11,688,169.0,99.3,19,Burlingame Running
2023-07-25,5275.74,1122,159.0,89.4,25,Burlingame Running
2023-07-25,2757.41,744,139.0,72.3,11,Burlingame Running
2023-07-27,8622.7,2368,158.0,88.8,52,Burlingame Running
2023-07-27,1114.87,317,134.0,,4,San Mateo Running
2023-07-29,4865.46,1499,144.0,75.9,24,Fremont Running
2023-07-30,14930.1,3892,170.0,99.9,108,San Mateo Running
2023-07-31,5459.27,2084,137.0,67.5,27,Fremont Running
2023-08-01,1749.4,477,140.0,,7,Burlingame Running
2023-08-01,6411.08,1355,140.0,72.6,20,Burlingame Running
2023-08-01,1831.32,570,150.0,,10,Burlingame Running
2023-08-02,9402.11,2605,154.0,82.5,50,San Mateo Running
2023-08-03,8665.27,2393,150.0,80.3,43,Burlingame Running
2023-08-06,12878.1,3350,168.0,98.7,91,San Mateo Running
2023-08-07,787.69,302,120.0,,3,Santa Clara County Running
2023-08-07,3348.96,670,151.0,83.0,13,Santa Clara County Running
2023-08-08,2683.76,714,134.0,66.1,9,Burlingame Running
2023-08-08,5801.57,1232,154.0,85.4,25,Burlingame Running
2023-08-08,1555.5,325,172.0,,10,Burlingame Running
2023-08-08,1775.71,569,154.0,,12,Burlingame Running
2023-08-10,8097.26,2449,139.0,69.6,34,San Francisco Running
2023-08-12,3287.79,1235,125.0,59.1,12,San Mateo County Running
2023-08-13,12006.7,3120,169.0,99.0,85,San Mateo Running
2023-08-15,2805.56,799,134.0,66.0,10,Burlingame Running
2023-08-15,5801.69,1198,137.0,68.9,16,Burlingame Running
2023-08-15,1827.46,601,148.0,77.4,10,Burlingame Running
2023-08-16,9008.95,2281,159.0,88.8,50,San Mateo Running
2023-08-17,8676.81,2396,160.0,89.9,54,Burlingame Running
2023-08-19,5195.67,1771,129.0,61.5,19,San Francisco Running
2023-08-20,12395.51,3142,166.0,95.7,80,San Mateo Running
2023-08-24,866.89,225,141.0,,4,Oakland Running
2023-08-24,5102.04,1073,152.0,114.3,39,Oakland Running
2023-08-24,506.76,167,145.0,,3,Oakland Running
2023-08-25,7005.38,1969,147.0,77.0,33,San Mateo Running
2023-08-26,4765.6,1331,152.0,80.5,24,Fremont Running
2023-08-27,12877.81,3385,161.0,89.9,76,San Mateo Running
2023-08-29,2420.75,699,133.0,67.9,9,Burlingame Running
2023-08-29,4668.07,1021,173.0,104.5,31,Burlingame Running
2023-08-29,1801.57,349,170.0,,10,Burlingame Running
2023-08-29,1745.81,562,150.0,,10,Burlingame Running
2023-09-02,1859.71,493,144.0,,8,San Mateo Running
2023-09-02,2999.42,670,162.0,89.5,15,San Mateo Running
2023-09-02,2126.25,595,149.0,76.9,10,San Mateo Running
2023-09-02,4830.36,1330,155.0,83.8,26,San Jose Running
2023-09-03,9754.68,3530,132.0,63.8,40,San Mateo Running
2023-09-05,1791.15,525,155.0,,10,Burlingame Running
2023-09-05,2390.13,671,129.0,61.1,7,Burlingame Running
2023-09-05,6343.77,1316,144.0,75.5,21,Burlingame Running
2023-09-06,6430.48,1721,147.0,77.7,29,San Mateo Running
2023-09-07,8721.35,2323,156.0,84.9,48,San Mateo Running
2023-09-09,6581.58,1789,148.0,77.7,30,San Francisco Running
2023-09-10,12512.65,3146,167.0,96.0,81,San Mateo Running
2023-09-12,2746.56,782,141.0,69.5,11,Burlingame Running
2023-09-12,4747.18,945,150.0,82.0,18,Burlingame Running
2023-09-12,1894.34,515,157.0,,11,Burlingame Running
2023-09-13,8821.58,2385,158.0,85.6,50,San Mateo Running
2023-09-17,10067.36,3965,134.0,65.3,47,New York Running
2023-09-22,8792.57,2361,155.0,85.8,49,San Mateo Running
2023-09-24,12878.72,3335,174.0,104.3,101,San Mateo Running
2023-09-24,1334.02,523,144.0,,8,Foster City Running
2023-09-25,830.2,297,119.0,,3,Santa Clara County Running
2023-09-25,1654.13,353,135.0,,5,Santa Clara County Running
2023-09-28,7552.0,2029,156.0,84.3,41,San Mateo Running
2023-09-29,7012.48,1828,147.0,77.9,31,San Mateo Running
2023-09-30,542.01,162,122.0,,2,San Mateo Running
2023-09-30,4193.72,1495,151.0,80.6,27,San Mateo Running
2023-10-01,16135.6,4276,168.0,98.3,115,San Mateo Running
2023-10-03,1829.5,514,136.0,,7,Burlingame Running
2023-10-03,4924.65,986,153.0,86.9,21,Burlingame Running
2023-10-03,1793.23,556,150.0,,10,Burlingame Running
2023-10-04,7600.81,2062,156.0,84.2,41,San Mateo Running
2023-10-07,4648.7,1496,146.0,77.4,25,San Jose Running
2023-10-08,16091.3,4087,166.0,94.7,102,San Mateo Running
2023-10-10,1665.59,510,137.0,,7,Burlingame Running
2023-10-10,1640.94,384,126.0,,4,Burlingame Running
2023-10-10,2570.97,708,133.0,67.6,9,Burlingame Running
2023-10-10,4409.57,1044,163.0,92.6,25,Burlingame Running
2023-10-12,8647.4,2514,148.0,78.0,43,Burlingame Running
2023-10-13,7009.15,1812,158.0,87.1,39,San Mateo Running
2023-10-14,4229.75,1545,123.0,59.0,15,Fremont Running
2023-10-15,16109.71,4285,169.0,98.2,115,San Mateo Running
2023-10-17,1810.18,551,128.0,,6,Burlingame Running
2023-10-17,7106.48,1575,160.0,91.8,37,Burlingame Running
2023-10-17,2153.95,597,156.0,87.8,13,Burlingame Running
2023-10-19,8687.5,2461,151.0,80.8,45,Burlingame Running
2023-10-20,6402.22,1750,150.0,80.4,32,San Mateo Running
2023-10-21,4454.57,1173,157.0,89.3,26,San Mateo County Running
2023-10-25,16119.45,4263,163.0,93.5,105,San Mateo Running
2023-10-26,8683.53,2406,150.0,80.1,43,Burlingame Running
2023-10-28,4722.6,1118,167.0,98.3,30,San Mateo County Running
2023-10-29,16117.78,4105,169.0,99.0,112,San Mateo Running
2023-10-30,817.98,149,136.0,,2,Santa Clara County Running
2023-10-30,809.75,237,122.0,,2,Santa Clara County Running
2023-10-31,1771.49,633,139.0,71.4,9,San Mateo Running
2023-10-31,5640.0,1155,139.0,71.9,17,San Mateo Track Running
2023-10-31,2115.21,637,139.0,68.5,9,Burlingame Running
2023-11-04,7334.84,3149,72.0,18.7,5,Mohave County Running
2023-11-06,809.63,309,114.0,,2,Santa Clara County Running
2023-11-06,3590.0,796,154.0,84.3,16,Santa Clara County Track Running
2023-11-06,410.0,158,138.0,,2,Santa Clara County Track Running
2023-11-07,2193.28,657,127.0,60.7,7,Burlingame Running
2023-11-07,7220.0,1565,169.0,100.3,44,San Mateo Track Running
2023-11-07,1436.63,449,152.0,,8,San Mateo Running
2023-11-11,4871.93,1290,161.0,91.5,30,Santa Clara Running
2023-11-16,8680.95,2458,156.0,83.7,49,Burlingame Running
2023-11-24,8631.58,2184,175.0,104.4,67,Orange Running
2023-11-25,10156.97,3743,152.0,82.1,70,New York Running
2023-11-28,1772.79,650,142.0,73.1,10,Burlingame Running
2023-11-28,1810.54,563,133.0,,7,Burlingame Running
2023-11-28,4748.33,1052,158.0,88.4,23,Burlingame Running
2023-11-30,8698.55,2371,159.0,89.4,53,Burlingame Running
2023-12-02,5252.24,1415,167.0,96.9,37,Alameda County Running
2023-12-05,1787.03,505,142.0,,9,Burlingame Running
2023-12-05,4790.2,950,162.0,93.1,23,Burlingame Running
2023-12-05,1780.12,572,158.0,,12,Burlingame Running
2023-12-07,8717.72,2381,159.0,90.2,54,Burlingame Running
2023-12-09,7022.69,2553,134.0,66.0,31,Chilliwack Running
2023-12-12,1789.9,543,157.0,,11,Burlingame Running
2023-12-12,1702.05,344,173.0,,11,Burlingame Running
2023-12-12,1308.21,305,149.0,,6,Burlingame Running
2023-12-12,3972.28,866,152.0,84.0,17,Burlingame Running
2023-12-12,2824.31,784,149.0,80.2,14,Burlingame Running
2023-12-14,8737.31,2347,160.0,90.6,54,Burlingame Running
2023-12-16,4843.56,1656,138.0,68.6,22,San Jose Running
2023-12-20,5980.93,2507,130.0,59.9,27,Maui County Running
2023-12-22,6245.84,2725,130.0,61.6,30,Maui County Running
2023-12-25,8651.55,2495,161.0,90.6,57,Orange Running
2023-12-26,8647.46,2260,169.0,100.6,64,Orange Running
2023-12-27,8604.8,2254,166.0,97.8,60,Orange Running
2023-12-28,8603.91,2233,167.0,98.2,60,Orange Running
2023-12-29,8627.17,2191,169.0,100.1,61,Orange Running
2023-12-30,8650.58,2217,162.0,91.9,52,Orange Running
2023-12-31,5033.38,1250,155.0,84.1,25,Orange Running
2024-01-06,4856.92,1461,153.0,84.3,29,San Francisco Running
2024-01-09,2553.63,753,146.0,78.8,13,Burlingame Running
2024-01-09,5061.5,1098,163.0,93.6,27,Burlingame Running
2024-01-09,1691.2,526,158.0,,12,Burlingame Running
2024-01-11,10012.71,2597,166.0,95.6,67,San Mateo Running
2024-01-13,4902.67,1847,137.0,68.4,24,Foster City Running
2024-01-14,12898.01,3418,172.0,102.0,99,San Mateo Running
2024-01-17,10033.9,2686,160.0,90.7,62,San Mateo Running
2024-01-20,5113.13,1726,142.0,73.6,26,Oakland Running
2024-01-21,806.63,232,158.0,,5,San Mateo Running
2024-01-21,6446.29,1631,168.0,100.6,46,San Mateo Running
2024-01-24,10018.03,2630,165.0,93.7,66,San Mateo Running
2024-01-25,10010.34,2559,162.0,90.5,60,San Mateo Running
2024-01-26,5243.55,1510,149.0,78.2,26,San Mateo Running
2024-01-27,4842.32,1172,169.0,100.7,33,Santa Clara Running
2024-01-28,10010.6,2609,169.0,99.7,72,San Mateo Running
2024-01-28,2187.56,619,163.0,93.4,15,Foster City Running
2024-01-30,2401.86,756,137.0,69.0,10,Burlingame Running
2024-01-30,6663.16,1447,160.0,91.1,34,Burlingame Running
2024-01-30,1816.24,559,159.0,,12,Burlingame Running
2024-02-01,10009.66,2621,157.0,86.7,56,San Mateo Running
2024-02-06,619.57,148,147.0,,3,Burlingame Running
2024-02-06,1787.47,693,140.0,71.1,10,Burlingame Running
2024-02-06,2365.35,763,145.0,75.2,12,Burlingame Running
2024-02-06,4255.72,933,174.0,105.7,29,Burlingame Running
2024-02-09,10012.2,2537,160.0,90.4,59,San Mateo Running
2024-02-10,4915.93,1542,147.0,77.9,26,Foster City Running
2024-02-10,2724.0,2327,101.0,39.8,11,Saratoga Trail Running
2024-02-11,13705.32,3764,159.0,90.7,86,San Mateo Running
2024-02-13,2643.93,760,154.0,83.6,15,Burlingame Running
2024-02-13,4783.98,953,151.0,82.0,18,Burlingame Running
2024-02-13,1767.87,534,156.0,,11,Burlingame Running
2024-02-17,5813.0,1678,160.0,89.1,37,Fremont Running
2024-02-19,11060.17,2868,157.0,87.0,61,San Mateo Running
2024-02-19,1315.22,378,161.0,,9,San Mateo Running
2024-02-20,1769.38,556,155.0,,12,Burlingame Running
2024-02-20,1749.05,536,150.0,,10,Burlingame Running
2024-02-20,5321.59,1116,146.0,76.0,18,Burlingame Running
2024-02-22,777.74,453,137.0,67.5,10,San Mateo Running
2024-02-24,5043.57,1971,138.0,68.7,26,Redwood City Running
2024-02-25,6449.71,1689,163.0,95.7,43,San Mateo Running
2024-02-28,8851.43,2431,155.0,83.8,48,San Mateo Running
2024-03-01,5765.49,2717,122.0,55.3,24,Portland Running
2024-03-05,2544.33,704,146.0,75.0,11,Burlingame Running
2024-03-05,5728.23,1209,154.0,84.3,24,Burlingame Running
2024-03-05,1787.34,615,151.0,80.2,11,Burlingame Running
2024-03-07,10010.15,2645,162.0,90.2,61,San Mateo Running
2024-03-09,5007.73,1710,139.0,69.6,23,San Francisco Running
2024-03-12,5542.02,1175,139.0,69.8,16,Burlingame Running
2024-03-12,1067.85,349,153.0,,7,Burlingame Running
2024-03-12,1737.46,503,130.0,,6,Burlingame Running
2024-03-17,6759.0,1756,164.0,95.8,46,San Mateo Running
2024-03-19,1766.38,536,136.0,,7,Burlingame Running
2024-03-19,5387.52,1221,145.0,76.4,20,Burlingame Running
2024-03-19,1827.86,546,158.0,,12,Burlingame Running
2024-03-26,1802.49,514,143.0,,8,Burlingame Running
2024-03-26,1759.68,562,146.0,,9,Burlingame Running
2024-03-26,3949.61,820,143.0,75.0,13,Burlingame Running
2024-03-28,6366.07,1525,162.0,93.4,37,Burlingame Running
2024-04-11,8173.64,2329,166.0,94.2,59,San Mateo Running
2024-04-12,8171.4,2208,168.0,97.3,59,San Mateo Running
2024-04-20,4843.87,1406,152.0,84.5,28,Redwood City Running
2024-05-07,1801.82,545,143.0,,10,Burlingame Running
2024-05-07,4801.19,1091,154.0,86.3,23,Burlingame Running
2024-05-11,5397.42,1886,153.0,77.2,35,Oakland Running
2024-05-18,4747.91,1758,142.0,73.2,27,Contra Costa County Running
2024-05-21,935.45,291,142.0,,5,Burlingame Running
2024-05-21,1592.09,352,148.0,,6,Burlingame Running
2024-05-21,1632.75,339,171.0,,10,Burlingame Running
2024-05-21,955.64,314,152.0,,6,Burlingame Running
2024-05-23,2508.01,709,156.0,87.2,15,San Mateo Running
2024-05-25,4015.11,1040,168.0,100.5,30,San Mateo Running
2024-05-27,5202.97,1394,158.0,89.7,32,San Mateo Running
2024-05-28,1789.94,570,138.0,,8,Burlingame Running
2024-05-28,5724.9,1282,152.0,83.4,25,Burlingame Running
2024-05-28,1846.21,578,156.0,81.2,11,Burlingame Running
2024-07-28,51.71,82,92.0,,0,San Mateo Running
2024-11-14,606.08,326,123.0,,3,San Mateo Running
2024-11-15,600.92,293,124.0,,3,San Mateo Running
2024-11-16,592.31,282,120.0,,3,San Mateo Running
2024-11-17,601.47,267,131.0,,3,San Mateo Running
2024-11-18,1034.87,450,133.0,,5,San Mateo Running
2024-11-20,1008.74,402,150.0,,7,San Mateo Running
2024-11-23,1109.57,406,160.0,,9,San Mateo Running
2024-11-26,1104.76,403,142.0,,6,San Mateo Running
2024-11-28,800.0,450,126.0,,4,San Mateo Track Running
2024-11-28,2010.0,634,175.0,103.7,19,San Mateo Track Running
2024-11-29,2010.0,614,167.0,96.7,16,San Mateo Track Running
2024-12-03,1857.81,555,144.0,,8,San Mateo Running
2024-12-04,1620.0,493,148.0,,9,San Mateo Track Running
2024-12-07,1687.85,459,150.0,,9,San Mateo Running
2024-12-08,2673.34,779,171.0,104.9,24,San Mateo Running
2024-12-11,1890.15,595,157.0,87.2,13,San Mateo Running
2024-12-13,2107.74,612,168.0,97.3,17,San Mateo Running
2024-12-15,2068.27,599,156.0,84.7,13,San Mateo Running
2024-12-18,2453.61,692,163.0,92.8,17,San Mateo Running
2024-12-19,1138.62,353,141.0,,5,San Mateo Running
2024-12-21,2810.0,758,160.0,92.3,18,San Mateo Track Running
2024-12-22,2843.86,1082,141.0,72.4,16,San Mateo Running
2024-12-25,2244.87,602,166.0,94.9,16,San Mateo Running
2024-12-27,3092.77,849,167.0,93.2,23,San Mateo Running
2024-12-29,3672.03,1040,171.0,101.6,30,San Mateo Running
2024-12-31,5010.0,1379,178.0,109.5,46,San Mateo Track Running
2025-01-05,3293.13,919,171.0,102.8,27,San Mateo Running
2025-01-08,4210.04,1186,168.0,97.1,32,San Mateo Running
2025-01-12,4020.03,1114,167.0,97.6,30,San Mateo Running
2025-01-13,3000.0,898,156.0,83.4,18,Treadmill Running
2025-01-15,4540.47,1294,152.0,80.3,24,San Mateo Running
2025-01-16,3246.29,892,160.0,91.7,21,San Mateo Running
2025-01-18,5534.28,1534,173.0,102.8,45,San Mateo Running
2025-01-21,6517.37,1861,164.0,94.0,46,San Mateo Running
2025-01-23,6544.46,1825,168.0,95.5,48,San Mateo Running
2025-01-25,4075.8,1116,128.0,58.8,11,San Mateo Running
2025-01-27,7012.77,1963,172.0,102.2,57,San Mateo Running
2025-01-30,5052.2,1691,141.0,70.4,24,Burlingame Running
2025-02-01,7306.7,2010,173.0,101.0,60,San Mateo Running
2025-02-04,8059.35,2213,146.0,74.7,35,San Mateo Running
2025-02-07,7011.07,1901,174.0,102.6,57,San Mateo Running
2025-02-09,6502.42,1740,154.0,83.8,34,San Mateo Running
2025-02-11,8128.03,2237,169.0,97.9,60,San Mateo Running
2025-02-14,7402.95,1978,168.0,100.9,56,San Mateo Running
2025-02-16,7501.07,2076,162.0,90.7,49,San Mateo Running
2025-02-18,9020.22,2535,163.0,91.8,60,San Mateo Running
2025-02-22,817.9,243,158.0,,5,San Mateo Running
2025-02-22,7320.94,1967,168.0,98.0,53,San Mateo Running
2025-02-23,3310.87,855,165.0,96.2,22,San Mateo Running
2025-02-25,9013.92,2495,167.0,95.3,64,San Mateo Running
2025-02-27,9015.57,2426,169.0,97.9,66,San Mateo Running
2025-03-03,9011.67,2619,162.0,90.7,61,San Mateo Running
2025-03-05,7324.38,1941,167.0,98.2,52,San Mateo Running
2025-03-09,2416.55,647,149.0,76.5,12,San Mateo Running
2025-03-11,10015.75,2747,172.0,103.1,82,San Mateo Running
2025-03-15,10018.84,2703,171.0,101.6,78,San Mateo Running
2025-03-21,10027.96,2739,164.0,95.2,69,San Mateo County Running
2025-03-24,2083.07,527,131.0,,6,San Mateo Running
2025-03-30,4970.18,2229,129.0,60.3,23,San Mateo Running
2025-04-03,4073.09,1126,152.0,83.7,22,San Mateo Running
2025-04-06,5749.48,2004,145.0,74.1,32,San Mateo Running
2025-04-09,11356.6,3206,167.0,97.9,86,San Mateo Running
2025-04-10,4699.67,1600,147.0,76.4,26,Menlo Park Running
2025-04-13,2865.79,868,171.0,98.7,24,Foster City Running
2025-04-15,2792.39,842,151.0,80.0,15,Burlingame Running
2025-04-15,949.33,198,156.0,,4,Burlingame Running
2025-04-15,791.77,169,153.0,,4,Burlingame Running
2025-04-15,1060.32,346,131.0,,4,Burlingame Running
2025-04-17,8018.16,2180,164.0,93.6,54,Menlo Park Running
2025-04-19,12089.65,3247,163.0,94.0,81,San Mateo Running
2025-04-22,13037.59,3570,166.0,95.4,91,San Mateo Running
2025-04-26,2189.73,691,145.0,72.6,11,San Mateo Running
2025-04-26,9248.68,2464,166.0,94.9,63,San Mateo Running
2025-04-28,13041.17,3569,166.0,94.8,92,San Mateo Running
2025-05-04,5679.93,1525,167.0,96.0,40,San Mateo Running
2025-05-05,3749.38,1536,128.0,60.4,16,San Mateo Running
2025-05-06,8078.29,2126,168.0,97.5,57,San Mateo Running
2025-05-08,2582.94,751,149.0,76.2,13,San Mateo Running
2025-05-09,1305.59,525,123.0,,5,San Mateo Running
2025-05-14,5052.91,1402,166.0,94.8,36,San Mateo Running
2025-05-28,6018.8,1756,166.0,96.9,46,Chilliwack Running
2025-06-07,4946.16,1987,143.0,72.1,30,San Mateo Running
2025-06-08,3355.55,1097,152.0,83.1,22,San Mateo Running
2025-06-09,5012.69,1411,164.0,93.5,35,San Mateo Running
2025-06-12,5018.81,1363,168.0,97.1,37,San Mateo Running
2025-06-13,5013.01,1382,168.0,97.2,37,San Mateo Running
2025-06-16,6453.16,1762,168.0,97.9,47,San Mateo Running
2025-06-17,5010.95,1331,165.0,93.7,34,San Mateo Running
2025-06-19,9013.32,2496,165.0,93.2,62,San Mateo Running
2025-06-21,661.57,185,128.0,,2,Chilliwack Running
2025-06-22,10016.07,2857,164.0,92.7,69,Chilliwack Running
2025-06-25,4218.29,1139,160.0,89.9,26,San Mateo Running
2025-06-26,10012.18,2780,169.0,97.8,74,San Mateo Running
2025-06-28,7518.28,2041,168.0,96.9,54,San Mateo Running
2025-07-01,5012.97,1420,153.0,83.0,28,San Mateo Running
2025-07-03,8687.52,2558,167.0,96.5,67,Burlingame Running
2025-07-09,12089.93,3410,167.0,95.0,89,San Mateo Running
2025-07-12,12098.11,3375,168.0,96.9,91,San Mateo Running
2025-07-15,13014.24,3595,163.0,90.7,84,San Mateo Running
2025-07-17,13014.53,3555,168.0,96.5,95,San Mateo Running
2025-07-23,7013.32,1867,170.0,100.1,52,San Mateo Running
2025-07-25,16113.16,4543,167.0,94.4,115,San Mateo Running
2025-07-27,3751.89,1018,158.0,88.0,22,San Mateo Running
2025-07-31,8062.54,2118,161.0,95.1,54,San Mateo Running
2025-08-18,1188.47,340,139.0,,4,Hillingdon Running
2025-08-19,1549.85,530,145.0,,8,Hillingdon Running
2025-08-20,4072.31,1418,140.0,69.0,20,San Mateo Running
2025-08-21,4866.98,1424,162.0,90.4,34,San Mateo Running
2025-08-22,4896.35,1374,167.0,96.1,37,San Mateo Running
2025-08-23,6474.44,1593,177.0,108.3,52,Redwood City Running
2025-08-23,1582.29,491,161.0,,11,Redwood City Running
2025-08-24,14286.73,5486,136.0,64.7,65,Pacifica Running
2025-08-30,8067.65,2162,173.0,103.2,64,Redwood City Running
2025-09-01,16371.09,6550,134.0,62.5,72,Pacifica Running
2025-09-03,8428.76,2224,170.0,99.1,61,Redwood City Running
2025-09-05,8144.77,3429,147.0,73.3,52,Redwood City Running
2025-09-05,7482.07,2263,161.0,85.8,51,San Mateo Running
2025-09-06,10031.56,3448,154.0,81.1,63,Redwood City Running
2025-09-09,2618.67,792,142.0,69.9,11,Burlingame Running
2025-09-09,1792.06,612,148.0,72.7,9,Burlingame Running
2025-09-09,6012.55,1275,152.0,81.9,24,Burlingame Running
2025-09-10,7842.61,3526,119.0,47.9,24,San Mateo Running
2025-09-12,13129.39,3483,168.0,96.9,91,Redwood City Running
2025-09-14,15027.76,6028,129.0,58.4,58,Alameda Running
2025-09-16,2773.83,847,144.0,71.4,12,Burlingame Running
2025-09-16,7721.39,1800,174.0,104.7,55,Burlingame Running
2025-09-19,8067.41,3495,133.0,60.9,36,Redwood City Running
2025-09-20,8108.27,2191,164.0,94.0,54,San Mateo Running
2025-09-23,1831.0,675,146.0,72.9,10,Burlingame Running
2025-09-23,1561.39,400,152.0,,8,Burlingame Running
2025-09-23,2375.64,779,142.0,70.1,11,Burlingame Running
2025-09-23,4523.47,1116,175.0,106.0,35,Burlingame Running
2025-09-25,3163.05,1058,137.0,66.7,14,San Mateo Running
2025-09-25,8167.62,3409,140.0,67.3,43,Redwood City Running
2025-09-27,5015.49,1420,153.0,81.3,27,San Mateo Running
2025-09-28,1600.0,577,138.0,,7,San Mateo Track Running
2025-09-28,5020.0,1179,176.0,106.3,37,San Mateo Track Running
2025-09-28,1205.98,432,144.0,,6,San Mateo Running
2025-09-30,1773.67,654,137.0,65.8,8,Burlingame Running
2025-09-30,2612.17,848,140.0,68.0,11,Burlingame Running
2025-09-30,4786.99,1133,155.0,85.1,23,Burlingame Running
2025-10-01,4846.47,2033,128.0,56.2,18,San Mateo Running
2025-10-03,3432.4,1084,127.0,58.9,11,San Mateo Running
2025-10-04,14522.04,5060,142.0,71.4,73,Redwood City Running
2025-10-07,2770.75,898,137.0,66.4,11,Burlingame Running
2025-10-07,6826.84,1481,160.0,90.4,34,Burlingame Running
2025-10-07,1781.2,587,134.0,59.3,6,Burlingame Running
2025-10-19,5239.86,2212,133.0,60.7,23,San Mateo Running
2025-10-21,1799.9,677,139.0,63.8,8,Burlingame Running
2025-10-21,4682.81,1077,158.0,87.5,23,Burlingame Running
2025-10-21,2478.26,745,142.0,69.5,10,Burlingame Running
2025-10-22,7013.94,1862,166.0,98.2,50,San Mateo Running
2025-10-24,3227.5,978,147.0,76.1,17,San Mateo Running
2025-10-25,8116.02,3325,140.0,67.1,42,Redwood City Running
2025-10-26,8092.75,2148,169.0,99.1,59,Redwood City Running
2025-10-28,6148.97,1314,166.0,96.0,34,Burlingame Running
2025-10-28,1638.23,414,148.0,,7,Burlingame Running
2025-10-28,1816.51,588,163.0,,13,Burlingame Running
2025-10-28,2395.49,793,140.0,67.4,10,Burlingame Running
2025-10-30,9788.18,3967,145.0,72.5,58,Redwood City Running
2025-10-30,8107.63,2170,166.0,94.1,55,San Mateo Running
2025-11-04,1773.66,574,137.0,,7,Burlingame Running
2025-11-04,2543.87,830,144.0,72.1,12,Burlingame Running
2025-11-04,6774.09,1579,164.0,92.8,38,Burlingame Running
2025-11-06,7811.54,2190,159.0,85.4,47,San Mateo Running
2025-11-09,8041.37,4103,103.0,42.1,21,Arvada Running
2025-11-10,13022.93,3632,164.0,92.8,89,San Mateo Running
2025-11-11,1775.37,600,136.0,64.8,7,Burlingame Running
2025-11-11,2423.22,723,132.0,63.0,8,Burlingame Running
2025-11-11,7167.65,1605,157.0,85.9,33,Burlingame Running
2025-11-13,10603.87,2960,163.0,92.8,71,San Mateo Running
2025-11-15,21162.86,5622,170.0,98.6,152,Redwood City Running
2025-11-16,1797.55,711,131.0,59.5,7,San Mateo Running
2025-11-18,2590.54,732,146.0,76.8,12,Burlingame Running
2025-11-18,5195.3,1153,163.0,93.1,28,Burlingame Running
2025-11-18,1788.18,662,141.0,68.8,9,Burlingame Running
2025-11-20,6510.35,1727,161.0,90.5,40,San Mateo Running
2025-11-22,8121.57,2247,159.0,87.2,48,San Mateo Running
2025-11-25,9757.54,3539,137.0,66.1,43,Orange Running
2025-11-27,2722.06,1239,129.0,59.0,12,Orange Running
2025-11-27,4993.81,1142,145.0,73.1,17,Orange Running
2025-12-05,9746.83,4137,133.0,61.2,43,Redwood City Running
2025-12-06,1748.42,486,128.0,,5,San Mateo Running
2025-12-09,2605.46,740,131.0,58.2,7,Burlingame Running
2025-12-09,5059.84,1071,160.0,91.0,25,Burlingame Running
2025-12-12,4175.06,1092,161.0,90.6,25,San Mateo Running
2025-12-14,7219.04,1682,173.0,105.5,52,San Francisco Running
2025-12-14,1544.06,470,132.0,,5,San Francisco Running
2025-12-16,2395.95,711,143.0,70.5,10,Burlingame Running
2025-12-16,7006.54,1623,172.0,101.8,47,Burlingame Running
2025-12-16,1791.66,629,155.0,82.8,12,Burlingame Running
2025-12-19,12130.94,3265,167.0,95.4,85,San Mateo Running
2025-12-20,9956.03,4294,122.0,51.5,32,San Mateo Running
2025-12-22,9277.85,2557,148.0,75.6,41,San Mateo Running
2025-12-23,2385.39,705,138.0,67.7,9,Burlingame Running
2025-12-23,6854.1,1534,145.0,73.2,23,Burlingame Running
2025-12-23,1361.77,484,143.0,,7,Burlingame Running
2025-12-24,14022.91,3753,162.0,89.2,85,San Mateo Running
2025-12-28,10025.97,2575,167.0,96.6,67,San Mateo Running
2025-12-30,1782.74,574,141.0,,8,Burlingame Running
2025-12-30,1801.62,489,137.0,,6,Burlingame Running
2025-12-30,6422.68,1362,158.0,87.1,29,Burlingame Running
2026-01-10,7020.55,1826,164.0,95.8,47,San Mateo Running
2026-01-18,10487.61,2780,166.0,94.1,71,San Mateo Running
2026-01-24,8689.5,2418,170.0,99.1,66,Redwood City Running
2026-01-27,6512.94,1717,169.0,99.4,48,San Mateo Running
2026-02-04,12124.45,3336,167.0,95.2,86,San Mateo Running
2026-02-05,8730.46,2641,153.0,80.0,47,Burlingame Running
2026-02-07,6470.04,1669,164.0,93.9,42,San Mateo Running
2026-02-08,16124.58,4395,171.0,99.1,120,Redwood City Running
2026-02-12,8722.38,2515,158.0,85.3,51,Burlingame Running
2026-02-14,6946.55,1718,166.0,94.5,44,San Mateo Running
2026-02-15,8415.72,2259,169.0,97.0,59,Redwood City Running
2026-02-17,14934.17,4206,156.0,83.4,82,Burlingame Running
2026-03-01,3229.45,875,160.0,87.6,19,San Mateo Running
2026-03-02,4276.3,1650,145.0,70.9,24,San Mateo Running
2026-03-21,6480.33,1785,173.0,103.2,54,San Mateo Running
2026-03-22,6840.23,1862,175.0,105.2,58,Redwood City Running
2026-05-02,3245.16,893,167.0,99.4,25,San Mateo Running
2026-05-03,5011.52,1447,174.0,104.6,44,San Mateo Running
2026-05-07,5665.54,1696,164.0,94.3,42,Menlo Park Running
2026-05-08,6515.11,1853,168.0,98.5,50,San Mateo Running
2026-05-09,1254.34,384,148.0,,6,San Mateo Running
2026-05-09,2410.0,559,169.0,,15,San Mateo Track Running
2026-05-09,1257.79,368,157.0,,7,San Mateo Running
2026-05-11,7018.29,1953,172.0,101.1,56,San Mateo Running
2026-05-12,6180.91,1905,159.0,86.6,41,San Mateo Running
2026-05-14,8072.19,2241,166.0,95.6,57,San Mateo Running
2026-05-16,1306.98,385,151.0,,7,San Mateo Running
2026-05-16,2820.0,648,174.0,105.3,20,San Mateo Track Running
2026-05-16,1379.1,438,156.0,,8,San Mateo Running
2026-05-17,8064.01,2280,170.0,98.5,62,Redwood City Running
2026-05-19,3431.31,998,157.0,84.9,20,San Mateo Running
2026-05-21,8070.23,2298,160.0,86.0,50,San Mateo Running
2026-05-22,7006.05,1932,161.0,89.3,43,San Mateo Running
2026-05-24,9017.13,2522,168.0,96.1,66,San Mateo Running
2026-05-26,8138.41,2263,162.0,89.3,53,San Mateo Running
2026-05-28,9015.13,2467,167.0,95.6,63,San Mateo Running
2026-06-12,3422.61,949,166.0,97.3,25,San Mateo Running
2026-06-13,5111.86,1398,159.0,90.6,32,San Mateo Running
2026-06-14,2633.06,723,161.0,87.3,16,San Mateo Running
2026-06-15,7010.97,1970,175.0,104.9,61,San Mateo Running
2026-06-17,5148.13,1417,174.0,103.9,43,San Mateo Running
2026-06-18,8707.53,2485,167.0,96.0,64,Burlingame Running
2026-06-20,3210.0,730,173.0,104.1,22,San Mateo Track Running
2026-06-20,1450.27,440,160.0,,9,San Mateo Running
2026-06-20,1303.62,377,163.0,,9,San Mateo Running
2026-06-21,7309.24,2001,170.0,98.2,54,Redwood City Running
2026-06-21,833.64,258,161.0,,6,Redwood City Running
2026-06-23,10019.6,2836,161.0,87.6,64,San Mateo Running
2026-06-27,9100.13,2495,172.0,102.0,73,San Mateo Running
2026-06-28,2006.63,601,145.0,72.8,9,San Mateo Running
2026-06-30,3250.04,926,158.0,85.8,19,San Mateo Running
2026-07-01,10016.63,2736,174.0,104.5,83,San Mateo Running
2026-07-02,4043.92,1146,158.0,86.8,24,San Mateo Running
2026-07-04,1210.0,342,149.0,,6,San Mateo Track Running
2026-07-04,1610.0,471,164.0,,11,San Mateo Track Running
2026-07-04,3210.0,789,171.0,100.1,22,San Mateo Track Running
```
