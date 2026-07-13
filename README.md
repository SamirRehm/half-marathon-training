# Split — half-marathon build dashboard

A personal running dashboard + autonomous daily-logging routine, training toward a **half marathon on Oct 31, 2026**.

**Live:** https://samirrehm.github.io/half-marathon-training/

## What it is
- **Calendar** — every day colored by a 0–100 *day score* (how much the day moved the odds of the goal). Click any day for the score breakdown, the coaching entry, morning wellness, and **full stream analytics** for each activity: pace + GAP + elevation, HR over zone bands, cadence + running power, km splits, HR-zone distribution, decoupling (Pw:Hr), efficiency factor, and rolling session bests — from Intervals.icu 1-second streams.
- **Trends** — weekly volume stacked by intensity (the discipline chart), CTL/ATL fitness & fatigue, the daily HM projection vs goal lines, day scores, raced-today goal odds, HRV/RHR recovery, sleep, EF & decoupling across the block, and the 12-month pace curve with critical speed.
- **Daily routine** — a Claude Code routine pulls Intervals.icu each morning, scores yesterday, prescribes today, writes the day's stream/wellness files, and commits. The site redeploys on the commit.

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
