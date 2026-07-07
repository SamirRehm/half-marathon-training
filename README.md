# Split — half-marathon build dashboard

A personal running dashboard + autonomous daily-logging routine, training toward a **half marathon on Oct 31, 2026**.

![tabs: Calendar + Dashboard]

## What it is
- **Calendar** — every day colored by a 0–100 *day score* (how well that day served the goal). Click any day for the score breakdown (+/−), full Intervals.icu metrics, the coaching note, and tomorrow's plan.
- **Dashboard** — CTL/ATL fitness & fatigue, weekly mileage across 4.5 years, the daily half-marathon time prediction, and the day-score trend.
- **Daily routine** — a Claude Code routine pulls Intervals.icu each morning, scores the day, writes the entry, and commits it. The site redeploys on the commit.

## Quick start
```bash
cd public && python3 -m http.server 8000   # open localhost:8000
```

## Deploy
Static site. Keep `index.html`, `daily_log.json`, `activities.json` co-located. GitHub Pages: serve `/public`. Vercel/Netlify: import the repo, publish `public/` (run `cp data/*.json public/` as build). See `CLAUDE.md`.

## The routine
Create at claude.ai/code/routines with `routine/DAILY_ROUTINE_PROMPT.md` as the prompt + the Intervals.icu connector. See `CLAUDE.md` → "Create the daily routine".

## Structure
- `RUNNER_CONTEXT.md` — source-of-truth athlete profile, plan, protocols (the routine reads this)
- `DAY_SCORE.md` — the day-score algorithm
- `data/` — activities + daily log JSON (and the source CSV)
- `public/` — the app
- `scripts/build_activities.py` — regenerate activities.json from CSV
