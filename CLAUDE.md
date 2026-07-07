# CLAUDE.md — how this repo works (read me first)

This is a personal running-coach dashboard + an autonomous daily-logging routine for one athlete training for a **half marathon on 2026-10-31** (committed target 1:24–1:27; dream 1:20). It has two halves:

1. **A static web app** (`public/index.html`) — a calendar heatmap (each day colored by a 0–100 "day score") plus a dashboard of trends. Pure HTML/JS/Chart.js, no build step. It reads two JSON files at runtime: `data/daily_log.json` and `data/activities.json`.
2. **A daily routine** (`routine/DAILY_ROUTINE_PROMPT.md`) — a Claude Code routine that each morning pulls the athlete's Intervals.icu data, scores the day, writes a coaching entry, and commits it to `data/daily_log.json`. The site redeploys on that commit.

## Files
- `RUNNER_CONTEXT.md` — **the source of truth.** Full athlete profile, goal, training plan, all protocols, coaching approach, and the §7 daily-log authoring rules. The routine reads this every run. Keep it current; it's the brain.
- `DAY_SCORE.md` — the 0–100 day-score algorithm (goal-fit scoring, component breakdown).
- `data/activities.csv` — the FULL 4.5-year history (1,055 runs, 2022–2026), kept intentionally for routine CONTEXT (historical comparison: post-injury bests, peak-fitness reference, whether a given volume has been handled before). The dashboard chart windows to recent months for focus, but the data is complete.
- `data/activities.json` — activities + weekly rollups for the app, generated from the CSV by `scripts/build_activities.py`.
- `data/daily_log.json` — the daily entries the routine appends to and the app reads. Two entries so far (2026-07-05/06), human-reviewed.
- `routine/DAILY_ROUTINE_PROMPT.md` — paste-in prompt for the routine (two-invocation: close yesterday, open today).
- `routine/INTERVALS_DATA_REFERENCE.md` — every Intervals.icu tool + field the routine pulls and how to read it (cadence, efficiency factor, HR-zone-times, decoupling, grade-adjusted pace, all wellness fields incl. empty-but-future ones).
- `routine/ROUTINE_SETUP.md` — step-by-step for creating the scheduled routine in Claude Code.
- `public/index.html` — the app.

## Common tasks

### Run/preview the site locally
It's static. From the repo root: `cd public && python3 -m http.server 8000` then open http://localhost:8000. (The app fetches `./daily_log.json` and `./activities.json`, so those must sit beside `index.html` when deployed — see deploy note.)

### Deploy (host is your choice; GitHub is mandatory as the source)
Must deploy FROM the GitHub repo, auto-redeploying on push. Pick the best static host (GitHub Pages / Vercel / Netlify / Cloudflare Pages). The one hard requirement: `index.html`, `daily_log.json`, `activities.json` must be served from the SAME directory — publish `public/` (data files are mirrored there) or add a build step `cp data/*.json public/`. Every push (including the daily routine's) then republishes. See `START_HERE_CLAUDE_CODE.md`.

### Regenerate activities.json (if the CSV changes)
`python3 scripts/build_activities.py` — rebuilds `data/activities.json` from `data/activities.csv`.

### Create the daily routine
Use `routine/DAILY_ROUTINE_PROMPT.md` as the prompt at claude.ai/code/routines (or `/schedule`). Attach the **Intervals.icu connector** (must auth as the athlete). Daily **08:45 America/Los_Angeles (Pacific)**. Give it write access to this repo. Repo-referenced: it reads `RUNNER_CONTEXT.md`, `DAY_SCORE.md`, `routine/INTERVALS_DATA_REFERENCE.md`, and `data/daily_log.json` each run, so the prompt stays short and context lives in the repo. Full setup in `routine/ROUTINE_SETUP.md`.

### The review loop
Routine entries are committed with `reviewed:false` and show an "unreviewed" flag (● dot) on the calendar. The athlete amends them later in a chat session (adding context the routine can't know — why a run was skipped, how it felt, on-call weeks, travel), which flips `reviewed:true`. Both produce the identical JSON shape.

## Conventions & gotchas
- **Day score is goal-fit, not effort** — see DAY_SCORE.md. Easy runs done easy score high; intensity-creep on easy days scores low. This is deliberate and matches the athlete's documented failure mode (chronic over-intensity, boom-bust volume).
- **Sleep quality scale is inverted:** 1 = excellent, 2 = good (lower is better).
- **Achilles:** ruptured 2024-06-01, but now 25 mo post + PT; treated as healthy/load-tolerant. Don't reintroduce fragility framing.
- **Prediction moves slowly:** max ~30 s/day without a race/TT or missed week.
- No secrets in the repo. The Intervals connector and any deploy tokens live in the routine/host config, authenticated as the user — never commit keys.
- Research-preview routine: if a data pull fails, it writes `routine/LAST_RUN_ERROR.txt` and commits nothing rather than a half-entry.
