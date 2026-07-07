# START HERE — Claude Code handoff

Paste the section below to Claude Code (in the unzipped `split-dashboard/` folder). It has full authority to make the setup decisions; the only hard constraints are marked **MUST**.

---

## Your task

This folder is a complete, working personal running-coach app + an autonomous daily-logging routine, for one athlete training for a **half marathon on 2026-10-31** (north-star goal 1:20; realistic 1:24–1:27). Everything is already built and tested locally. Your job is to get it (1) into version control on GitHub, (2) deployed to a live URL, and (3) running its daily routine. Read `CLAUDE.md` first — it explains every file and the architecture.

### Step 1 — GitHub (**MUST use GitHub**)
- Initialize git and create a **public** GitHub repo under the user's account (ask which account/org if ambiguous; use the `gh` CLI if available, otherwise guide the user through auth — never hard-code or commit a token).
- Sensible `.gitignore` is already present. Commit everything and push to `main`.
- Confirm the repo URL back to the user.

### Step 2 — Deploy (**your choice of service, but it MUST deploy from the GitHub repo**)
- Pick whatever host you judge best for a static site that auto-redeploys on push — **you decide** (GitHub Pages, Vercel, Netlify, Cloudflare Pages, etc.). Optimize for: zero cost, auto-deploy on every push (so the daily routine's commits publish themselves), and least setup friction for the user. Briefly say why you chose it.
- The app is a static site. Its one requirement: `index.html`, `daily_log.json`, and `activities.json` **must be served from the same directory.** They're currently in `public/` (data files are mirrored there from `data/`). Set up the deploy so they stay co-located — simplest is to publish `public/`, or add a one-line build step `cp data/*.json public/`. Verify the live URL renders the calendar AND dashboard, and that clicking a day opens the detail panel with metrics + the score breakdown.
- If the host needs the user to click "authorize GitHub" or similar, walk them through it — that auth is theirs, not yours.

### Step 3 — Daily routine (separable from Steps 1–2)
The routine is the ongoing automation, distinct from the one-time commit+deploy. Full instructions are in **`routine/ROUTINE_SETUP.md`**; the field-by-field data reference is in **`routine/INTERVALS_DATA_REFERENCE.md`**. In brief:
- Create a **Claude Code routine** (claude.ai/code/routines, or `/schedule`) using `routine/DAILY_ROUTINE_PROMPT.md` as the prompt, **verbatim** — self-contained and repo-referenced (it reads RUNNER_CONTEXT.md, DAY_SCORE.md, INTERVALS_DATA_REFERENCE.md, and the log each run).
- **MUST attach the Intervals.icu connector**, authenticated as the athlete (Settings → Connectors).
- Schedule: **daily, 08:45 America/Los_Angeles (Pacific)** — after morning device sync so overnight recovery is available for the "open today" job.
- Two-invocation model: each morning it CLOSES yesterday (scores it) and OPENS today (prescribes from fresh recovery). It commits `reviewed:false`; the human amends in chat. Don't change that.
- If the user prefers, this step can be done separately/later — Steps 1–2 (GitHub + deploy) stand alone, and the manual chat loop produces identical files as a fallback.

### Step 4 — Hand back
Give the user: the repo URL, the live site URL, and confirmation the routine is scheduled + Intervals connected. Note that the routine layer is Anthropic research-preview, so if a daily run fails it writes `routine/LAST_RUN_ERROR.txt` and commits nothing rather than a broken entry — and the manual "check in with a chat session" loop is the reliable fallback that produces the identical files.

## Guardrails
- **No secrets in the repo.** Connector auth and any deploy tokens live in the host/routine config as the user — never commit keys.
- Don't rewrite the scoring model or the app logic; it's been iterated deliberately (see `DAY_SCORE.md`). Fix genuine bugs if you hit them, but preserve the probability-change design.
- If you change where files live, update the fetch paths in `public/index.html` (currently `./daily_log.json`, `./activities.json`) and `CLAUDE.md` to match.
- Keep the two data files co-located with `index.html` wherever you deploy — that's the one thing that breaks the app if missed.

## What this is (one-paragraph orientation)
`RUNNER_CONTEXT.md` is the source-of-truth athlete profile/plan/protocols (the routine reads it every run). `DAY_SCORE.md` is the day-score algorithm — a *probability-change* model: each day scores how much it moved the odds of the 1:20 goal (up/neutral/down), not how hard it was. `data/` holds the 4.5-year activity history and the daily-log JSON the routine appends to. `public/index.html` is the whole app (calendar heatmap + dashboard, no build step). `scripts/build_activities.py` regenerates the activity JSON from CSV. The loop: routine pulls Intervals each morning → scores the day → commits → site redeploys → user amends the entry in chat later.
