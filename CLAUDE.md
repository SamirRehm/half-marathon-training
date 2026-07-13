# CLAUDE.md — how this repo works (read me first)

This is a personal running-coach dashboard + an autonomous daily-logging routine for one athlete training for a **half marathon on 2026-10-31** (committed target 1:24–1:27; dream 1:20). It has two halves:

1. **A static web app** (`public/index.html`) — a calendar heatmap (each day colored by a 0–100 "day score"), a slide-over day panel with full per-activity stream analytics (pace/GAP/HR-zone/cadence/power charts, km splits, decoupling/EF, session bests), and a trends dashboard. Pure HTML/JS/Chart.js, no build step. It reads static JSON at runtime: `daily_log.json`, `activities.json`, `athlete.json`, `wellness.json`, and `streams/<date>.json` (lazily, via `streams/index.json`).
2. **A daily routine** (`routine/DAILY_ROUTINE_PROMPT.md`) — a Claude Code routine that each morning pulls the athlete's Intervals.icu data, scores yesterday, prescribes today, writes the day's stream/wellness files, and commits. The site redeploys on that commit.

## Files
- `RUNNER_CONTEXT.md` — **the source of truth.** Full athlete profile, goal, training plan, all protocols, coaching approach, and the §7 daily-log authoring rules. The routine reads this every run. Keep it current; it's the brain.
- `DAY_SCORE.md` — the 0–100 day-score algorithm (probability-change model) + the raced-today goal-probability model.
- `data/activities.csv` — the FULL 4.5-year history (1,055 runs, 2022 – Jul 4 2026), kept intentionally for routine CONTEXT (historical comparison). The volume chart merges this with post-Jul-4 data from the log/stream files.
- `data/activities.json` — activities + weekly rollups generated from the CSV by `scripts/build_activities.py`. Frozen at 2026-07-04; newer days come from the daily pipeline.
- `data/daily_log.json` — the daily coaching entries (scored days + prescribed days). The routine appends; the athlete amends in chat (flips `reviewed:true`).
- `data/athlete.json` — reference snapshot: HR zones, LTHR/max HR, weight, race/goals, plan phases, Labor-Day checkpoint, 1-yr pace curve + critical-speed model. Slowly-changing; refresh occasionally from Intervals.
- `data/wellness.json` — one compact row per day (ctl/atl/ramp/hrv/rhr/sleep/vo2max/steps…). Routine upserts yesterday + today each run. Starts 2026-06-15 (deliberately lean — see conventions).
- `data/streams/<YYYY-MM-DD>.json` — per-day activity streams (1 s, adaptively downsampled >1500 samples) + meta, one file per day with activities; `data/streams/index.json` is the manifest the site reads. Schema in `routine/INTERVALS_DATA_REFERENCE.md`. **Never include latlng/temp — public repo, GPS stays private.**
- `routine/DAILY_ROUTINE_PROMPT.md` — paste-in prompt for the routine (two-invocation: close yesterday, open today, write dashboard files, commit).
- `routine/INTERVALS_DATA_REFERENCE.md` — every Intervals.icu tool + field the routine pulls, how to read them, and the dashboard data-file schemas it must write.
- `routine/ROUTINE_SETUP.md` — step-by-step for creating the scheduled routine in Claude Code.
- `public/index.html` — the whole app (design system, calendar, day panel, analytics library, trends). Client-side analytics: Minetti-based GAP calibrated to Intervals' activity GAP, Pw:Hr decoupling on moving-time halves, EF (m/beat), NP (30 s rolling ⁴-mean), km splits, HR-zone times, rolling session bests. Definitions live in the in-app "methods" dialog — keep code and dialog in sync.
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
Use `routine/DAILY_ROUTINE_PROMPT.md` as the prompt at claude.ai/code/routines (or `/schedule`). Attach the **Intervals.icu connector** (must auth as the athlete). Daily **08:45 America/Los_Angeles (Pacific)**. Give it write access to this repo. Repo-referenced: it reads `RUNNER_CONTEXT.md`, `DAY_SCORE.md`, `routine/INTERVALS_DATA_REFERENCE.md`, and `data/daily_log.json` each run. Full setup in `routine/ROUTINE_SETUP.md`.

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
