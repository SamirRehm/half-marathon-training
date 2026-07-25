# Split — half-marathon build dashboard

A personal running dashboard + autonomous daily-logging routine, training toward a **half marathon on Oct 31, 2026**.

**Live:** https://samirrehm.github.io/half-marathon-training/

## What it is
Four views:
- **Today** — the session prescribed for today and why, this morning's readiness (HRV, resting HR, sleep, form — each with a plain-language verdict), the current projected half time and the gap to each goal, the week so far against the phase target, and the five signals that actually decide this build (4-week volume, ramp rate, uninterrupted weeks, easy share, days to the Labor Day gate).
- **Calendar** — every day coloured by a 0–100 *day score* (how much that day moved the odds of the goal), with a weekly rollup rail. Click any day for the score breakdown, the coaching entry, morning wellness, and **full stream analytics** per activity: pace + GAP with work segments shaded, an elevation strip, HR over zone bands, cadence and power, kilometre splits (or a warmup/reps/cooldown table on workouts), zone distribution, decoupling, efficiency factor and easy purity — all from Intervals.icu 1-second streams.
- **Analysis** — weekly volume stacked by intensity, easy share vs the 70% target, CTL/ATL, the projection against the goal lines, day scores, HRV, resting HR, sleep, efficiency factor and decoupling.
- **The Goal** — gap to each goal, a live Labor Day gate tracker (six criteria, computed from the data), the 12-month pace curve against the pace each goal demands, the boom-bust timeline this block exists to break, and peak capability by era.

A Claude Code routine pulls Intervals.icu each morning, scores yesterday, prescribes today, writes the day's stream/wellness files and commits; the site redeploys on the commit.

## Quick start (local)
```powershell
# Windows — no runtime needed
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/serve.ps1
# → http://localhost:8017
```

## Deploy
GitHub Pages workflow (`.github/workflows/deploy.yml`): every push to `main` copies `data/` into `public/` and republishes. Data is only ever edited in `data/`.

## Structure
- `RUNNER_CONTEXT.md` — source-of-truth athlete profile, plan, protocols (the routine reads this)
- `DAY_SCORE.md` — the day-score + goal-probability models
- `data/` — daily log, activity history, athlete reference, wellness rows, per-day stream files
- `public/index.html` — the whole app (no build step; Chart.js via CDN)
- `routine/` — the daily routine prompt, Intervals.icu data reference (incl. stream-file schemas), setup guide
- `scripts/` — local dev server (PowerShell), activities.json builder (Python)
