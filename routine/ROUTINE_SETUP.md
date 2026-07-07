# Setting up the daily routine (Claude Code)

How to turn `DAILY_ROUTINE_PROMPT.md` into a live, scheduled Claude Code routine. Do this AFTER the repo is on GitHub and deployed (the routine commits to the repo, so the repo must exist first).

## What a routine is
A **Claude Code routine** is a saved prompt + repo + connectors that runs autonomously on Anthropic's cloud on a schedule — no local machine needed, runs when your laptop is closed. (Research preview; behavior/limits may change — treat as switch-off-able, not load-bearing. The manual "check in with a chat session" loop produces the identical files as a fallback.)

## Prerequisites
1. The repo is on GitHub (public) and the routine has **write access** to it (it commits the daily log).
2. The **Intervals.icu connector** is added to your Claude account and authenticated **as you** (Settings → Connectors). This is what lets the routine read your wellness + activities. See `INTERVALS_DATA_REFERENCE.md` for exactly what it pulls.
3. The site is deployed with auto-redeploy on push (so the routine's commits publish themselves).

## Create it
1. Go to **claude.ai/code/routines** (or the Routines panel in the Claude Desktop sidebar → New routine → Remote; or `/schedule` in the Claude Code CLI).
2. **Prompt:** paste the entire contents of `routine/DAILY_ROUTINE_PROMPT.md`, verbatim. It's self-contained and repo-referenced (it reads `RUNNER_CONTEXT.md`, `DAY_SCORE.md`, `INTERVALS_DATA_REFERENCE.md`, and `data/daily_log.json` each run).
3. **Repository:** select this repo. Allow it to push (branch setting per your preference — `claude/` branch + review, or main for direct commits).
4. **Connectors:** attach **Intervals.icu** (required). MCP connector traffic routes through Anthropic's servers, so no extra network allowlisting is needed.
5. **Schedule:** daily, **08:45 America/Los_Angeles (Pacific).** This timing matters — it's after the morning device sync so overnight recovery (HRV/RHR/sleep) is in, which the "open today" job needs to prescribe today's session.
6. **Model:** a strong model (the routine does real analysis + judgment). Save.

## What it does each run (two-invocation model)
See `DAILY_ROUTINE_PROMPT.md` for the full spec. In short, every morning it:
1. **Orients** against `data/daily_log.json` (what's been scored, what's prescribed) — so it never double-creates or re-scores.
2. **Closes yesterday:** pulls yesterday's completed activity (+ streams for workouts/long runs), scores it (probability-change day-score), computes the raced-today probability, writes the coaching read, sets `status:"scored"`.
3. **Opens today:** reads this morning's recovery, prescribes today's session (recovery-led, plan-aware), sets `status:"prescribed"`.
4. **Commits + pushes** → site auto-redeploys.

## Verify it's working
- After the first run, check `data/daily_log.json` got a new/updated day and the site shows it.
- If a run failed, look for `routine/LAST_RUN_ERROR.txt` in the repo (the routine writes this and commits nothing rather than a half-entry).
- Entries are `reviewed:false` — you amend them in a chat session with context the routine can't know (why a run was skipped, how it felt, on-call/travel), which flips `reviewed:true`.

## Limits
- Daily run caps by plan (Pro ~5/day, Max ~15/day) — one morning run is well within any tier.
- Research preview: the API surface and limits may shift. Keep the manual chat loop as the reliable fallback.
