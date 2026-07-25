# Setting up the daily routine (cloud, laptop-independent)

How to turn `DAILY_ROUTINE_PROMPT.md` into a live scheduled **Claude routine** that runs on Anthropic's infrastructure — no local machine, laptop closed, doesn't matter.

Do this after the repo is on GitHub and deploying (the routine commits to `main`, and the site redeploys off that commit).

## Why it has to be a routine, not a local scheduled task

Two other mechanisms look similar and are the wrong tool here:

| Mechanism | Runs where | Verdict |
|---|---|---|
| **Claude routine** (claude.ai/code/routines) | Anthropic's cloud | ✅ what you want |
| Claude Code scheduled task (`scheduled-tasks`) | Your machine, **only while the app is open**; a missed run fires on next launch | ❌ laptop-dependent |
| In-session cron (`CronCreate`) | The current chat session only; auto-expires after 7 days | ❌ not durable |

## What you have to do yourself

Two steps need *your* authorization and cannot be delegated:

1. **Attach the Intervals.icu connector**, authenticated as you. This is what lets the routine read your wellness and activities. Nobody else can grant it.
2. **Give the routine push access** to this repo.

Everything else is already in the repo.

## Create it

1. Go to **claude.ai/code/routines** → **New routine** (or the Routines panel in the Claude desktop sidebar, or `/schedule` in the Claude Code CLI and choose the cloud/remote option).
2. **Prompt:** paste the entire contents of `routine/DAILY_ROUTINE_PROMPT.md`, verbatim. It is self-contained and repo-referenced — each run reads `RUNNER_CONTEXT.md`, `DAY_SCORE.md`, `routine/INTERVALS_DATA_REFERENCE.md`, `.claude/skills/generate-day-data/SKILL.md` and `data/daily_log.json` for itself, which is why the prompt stays short and the thinking lives in version control.
3. **Repository:** this repo, with permission to push to `main`. (Direct to `main` is what makes the site redeploy automatically. A `claude/*` branch + review also works, but then nothing publishes until you merge.)
4. **Connectors:** attach **Intervals.icu**. Required — without it the routine writes `routine/LAST_RUN_ERROR.txt` and commits nothing. MCP traffic routes through Anthropic's servers, so there is no network allowlisting to do.
5. **Schedule:** daily, timezone **America/Los_Angeles** — name the timezone rather than a UTC offset so DST is handled for you. Pick a time:
   - **00:15** — the day just ended, so scoring is at its most reliable. Your overnight recovery for the new day does not exist yet, so the routine marks the session **provisional** and attaches downgrade gates you apply on waking. The dashboard labels it as such.
   - **07:00–08:45** *(firmer plans)* — after the morning device sync, so HRV, resting HR and sleep are in and the session is set on real numbers.

   Both work; the prompt detects which situation it is in and behaves accordingly. Prefer a minute that isn't `:00` so you're not landing on the same instant as everyone else.
6. **Model:** a strong one. The scoring and the stream reading are real judgement, not formatting.
7. Save.

## What each run does

1. **Orients** against `data/daily_log.json` so it never double-creates or re-scores.
2. **Closes the day that just ended:** pulls the activities, does the deep stream read (step 7 of the skill — segment on recording gaps, per-rep legs, zone distribution, set pace vs threshold *and* recent race pace), scores it against both goal lines, computes the raced-today probabilities, writes the coaching read, sets `status:"scored"`.
3. **Opens the current day:** prescribes the session, provisional if it's running pre-sync.
4. **Writes the dashboard files:** `data/streams/<date>.json` at full resolution, the manifest, and the wellness upsert.
5. **Commits and pushes** → GitHub Pages redeploys → the site is current within a minute or two.

## Verify it worked

- Check the repo for a new commit titled `daily log: <date> — closed <date> …`.
- The live site's **Today** card should show the new session, and the **Log** calendar a new entry with an amber "needs your review" dot.
- If a run failed, look for `routine/LAST_RUN_ERROR.txt` — by design it writes that and commits nothing rather than a half-entry.

## The review loop

Routine entries land as `reviewed:false`. You amend them in a chat session with the context the routine cannot see — why a session was cut, how it actually felt, what the workout was *meant* to be, on-call weeks, travel — and that flips `reviewed:true`. Both paths produce identical JSON.

Telling it the intended structure matters more than anything else you can add: "4×1 mile, first 1000 m at 5K pace, last 600 at mile pace" turns a pile of numbers into a graded session.

## Limits

- Daily run caps depend on your plan (Pro ~5/day, Max ~15/day). One morning run is well inside any tier.
- The routine layer is a research preview; the API and limits may shift. The fallback is unchanged and reliable: ask for the same thing in a chat session and it produces the identical files.
