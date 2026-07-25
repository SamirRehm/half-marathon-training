# CLAUDE.md — how this repo works (read me first)

This is a personal running-coach dashboard + an autonomous daily-logging routine for one athlete training for a **half marathon on 2026-10-31** (committed target 1:24–1:27; dream 1:20). It has two halves:

1. **A static web app** — one self-contained `public/index.html`. Three views: **Today** (the prescribed session and why, a single readiness line, the last session's full analysis inline, this week as a 7-day strip, the three build signals, one volume chart), **Log** (score-coloured calendar → day sheet with per-activity stream analytics), **Goal** (gap to each goal, live Labor Day gate tracker, projection chart, fitness/fatigue, pace curve, boom-bust timeline, era table). Pure HTML/JS/Chart.js, no build step. Reads static JSON at runtime: `daily_log.json`, `activities.json`, `athlete.json`, `wellness.json`, and `streams/<date>.json` (via `streams/index.json`) — the stream files load *after* first paint, never blocking it.
2. **A daily routine** (`.claude/skills/daily-coaching-run/SKILL.md`) — a cloud Claude routine that each morning pulls the athlete's Intervals.icu data, scores yesterday from its full streams, prescribes today, writes the day's stream/wellness files, and pushes to `main`. The site redeploys on that commit. The routine's own pasted instructions are three lines pointing at that skill, so its behaviour lives in version control.

## Files
- `RUNNER_CONTEXT.md` — **the source of truth.** Full athlete profile, goal, training plan, all protocols, coaching approach, and the §7 daily-log authoring rules. The routine reads this every run. Keep it current; it's the brain.
- `DAY_SCORE.md` — the 0–100 day-score algorithm (probability-change model) + the raced-today goal-probability model.
- `data/activities.csv` — the FULL 4.5-year history (1,055 runs, 2022 – Jul 4 2026), kept intentionally for routine CONTEXT (historical comparison). The volume chart merges this with post-Jul-4 data from the log/stream files.
- `data/activities.json` — activities + weekly rollups generated from the CSV by `scripts/build_activities.py`. Frozen at 2026-07-04; newer days come from the daily pipeline.
- `data/daily_log.json` — the daily coaching entries (scored days + prescribed days). The routine appends; the athlete amends in chat (flips `reviewed:true`).
- `data/athlete.json` — reference snapshot: HR zones, LTHR/max HR, weight, race/goals, plan phases, Labor-Day checkpoint, 1-yr pace curve + critical-speed model. Slowly-changing; refresh occasionally from Intervals.
- `data/wellness.json` — one compact row per day (ctl/atl/ramp/hrv/rhr/sleep/vo2max/steps…). Routine upserts yesterday + today each run. Starts 2026-06-15 (deliberately lean — see conventions).
- `data/streams/<YYYY-MM-DD>.json` — per-day activity streams at **full 1 s resolution** + meta + Intervals.icu auto-detected `intervals` (exact workout structure, lap-independent); one file per day with activities; `data/streams/index.json` is the manifest the site reads. **Never include latlng/temp — public repo, GPS stays private.**
- `.claude/skills/generate-day-data/SKILL.md` — **the canonical procedure** for producing a day's data files (day-file, manifest, wellness upsert, validation). The routine follows it each morning; humans can run it to backfill a date.
- `.claude/skills/daily-coaching-run/SKILL.md` — **the routine's entry point**: the whole daily job (orient, score yesterday from its streams, prescribe today, write data files, commit). References `generate-day-data` + the reference docs. The routine's pasted instructions are three lines pointing here, so behaviour is version-controlled.
- `routine/INTERVALS_DATA_REFERENCE.md` — every Intervals.icu tool + field the routine pulls, how to read them, and the dashboard data-file schemas it must write.
- `routine/ROUTINE_SETUP.md` — step-by-step for creating the scheduled routine in Claude Code.
- `public/index.html` — **the whole app in one file**: markup, design system, analytics and views. Keep it that way. An earlier version split the logic into `public/app.js`; both files ship `Cache-Control: max-age=600`, and because element ids changed between deploys, a browser holding one cached file plus one fresh one threw on a null reference *inside `boot()` before `wireTabs()` ran* — every tab went dead and the page looked broken. One document makes that skew impossible.
- **Charting rules** (from the `dataviz` skill; don't regress these): never two y-axes — two measures of different scale become two charts; series colours are steps from a documented palette, assigned per measure in fixed order, never cycled, and validated against this page's own light *and* dark surfaces (`scripts/validate_palette.js` — use its in-page browser hook, since Node isn't installed here); legend whenever >1 series and never for exactly 1; status colours are reserved and always paired with a glyph or word; every chart has a button revealing its numbers as a table. Four charts total across the app — resist adding more.
- **Session classification** (`classify()`): three layers, in order. (1) **Recording gaps win.** This athlete stops the watch during standing recoveries, so jumps in the `t` channel are the rep boundaries — the most reliable structure signal available. Blocks must actually repeat (duration CV ≤ 0.2, rests 30–420 s, rep-sized) so a steady run that paused at a crossing isn't mistaken for a session. (2) **Jogged-recovery fallback:** Intervals' own work/recovery segments, but only when the fast group stands ≥10% clear of the slow group with ≥0.55 m/s spread. (3) Otherwise classify by intensity/duration. Absolute intensity gates everything: a run under ~80% of threshold is never a workout however much its splits wander on hills. **Auto-lap kilometres are never used to judge rep execution** — they straddle rep boundaries and once produced a confident, wholly invented "rep 4 cracked" report worth a 30-point scoring error. Each rep is then split at its internal pace step, so a mile rep run as 1000 m @ 5K pace + 600 m @ mile pace reports as the two legs it was.
- `scripts/serve.ps1` — local dev server (Windows; serves `public/` with `data/` fallback so fetch paths work without mirroring).
- `scripts/build_activities.py` — regenerate `data/activities.json` from the CSV (needs Python).

## Common tasks

### Run/preview the site locally
Windows (no runtime needed): `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/serve.ps1` → http://localhost:8017 (or the `split-dashboard` config in `.claude/launch.json`). Note: a plain `http.server` in `public/` won't see the data files — they live in `data/`; serve.ps1 falls back there, matching what the deploy workflow assembles.

### Deploy
GitHub Pages via `.github/workflows/deploy.yml`: on every push to `main` it copies `data/*.json` + `data/streams/` into `public/` and publishes `public/`. So `data/` is the only place data is edited; **`public/` holds no committed data files** (they'd go stale). Live URL: https://samirrehm.github.io/half-marathon-training/

### Regenerate activities.json (if the CSV changes)
`python3 scripts/build_activities.py` — rebuilds `data/activities.json` from `data/activities.csv`.

### Create the daily routine
At claude.ai/code/routines → New routine. Paste only a three-line pointer to `.claude/skills/daily-coaching-run/SKILL.md` (exact text in `routine/ROUTINE_SETUP.md`), attach the repo with push access to `main` and the **Intervals.icu connector** authenticated as the athlete, detach every other connector, set the strongest model at highest effort, and schedule daily **08:28 America/Los_Angeles**. Full field-by-field walkthrough in `routine/ROUTINE_SETUP.md`.

### The review loop
Routine entries are committed with `reviewed:false` and show an "unreviewed" dot on the calendar. The athlete amends them later in a chat session (adding context the routine can't know — why a run was skipped, how it felt, on-call weeks, travel), which flips `reviewed:true`. Both produce the identical JSON shape.

## Conventions & gotchas
- **Day score is goal-fit, not effort** — see DAY_SCORE.md. Easy runs done easy score high; intensity-creep on easy days scores low. Deliberate; matches the athlete's documented failure mode (chronic over-intensity, boom-bust volume).
- **Sleep quality scale is inverted:** 1 = excellent … 4 = poor (lower is better).
- **Cadence from Intervals is per-leg rpm** (~86); the site doubles it for display (spm). Stream files store it as recorded.
- **Achilles:** ruptured 2024-06-01, now 25+ mo post + PT; treated as healthy/load-tolerant. Don't reintroduce fragility framing.
- **Prediction moves slowly:** max ~30 s/day without a race/TT or missed week.
- **Lean data scope:** stream backfills cover the current build only (from 2026-07-04); wellness from 2026-06-15. Don't deep-backfill history from the API — the CSV already carries long-horizon context. (Athlete preference.)
- **Privacy:** public repo — never commit `latlng`/GPS traces, keys, or tokens. The Intervals connector and deploy config live outside the repo.
- Research-preview routine: if a data pull fails, it writes `routine/LAST_RUN_ERROR.txt` and commits nothing rather than a half-entry.
