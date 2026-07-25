---
name: generate-day-data
description: Generate the Split dashboard's per-day data files for a given date — full-resolution stream day-file with Intervals.icu auto-detected intervals, wellness upsert, manifest update. Use when generating or backfilling a day's dashboard data; the daily routine runs this every morning for yesterday.
---

# generate-day-data — one day of dashboard data, exactly to schema

Produces the static JSON the Split dashboard (public/index.html) renders. Follow this exactly — the site's analytics depend on the shapes and rules below. Repo root: the half-marathon-training checkout.

## Inputs
- **DATE** (argument, `YYYY-MM-DD`; default = yesterday in America/Los_Angeles).
- All day boundaries are **Pacific-local**; date activities by `start_date_local` (evening runs cross midnight UTC — never date by UTC).

## Prerequisites
- Intervals.icu MCP connector, authenticated as the athlete.
- Write access to the repo. **Do NOT commit** — the caller (routine step 4, or the human) commits.

## Outputs
1. `data/streams/<DATE>.json` — only if the day had ≥1 activity
2. `data/streams/index.json` — DATE added to `dates` (sorted, unique)
3. `data/wellness.json` — DATE row upserted (plus today's row when run the morning after, which is the normal routine case)

## Procedure

### 1. List the day's activities
`activities_list(from_date=DATE−1, to_date=DATE+1)`, then keep rows whose `start_date_local` date == DATE. None → skip the day-file (no empty files), still do step 6.

### 2. Per activity, pull three things
a. **`activity_detail_get`** → meta fields (mapping in step 3) + `stream_types` (drives the streams request — this is how 422s are avoided).
b. **Runs only: `activity_intervals_get`** → from **`icu_intervals`** (NOT `icu_groups`) build `intervals`: one compact object per interval, in order:
   `{"type":<WORK|RECOVERY>,"i0":<start_index>,"i1":<end_index>,"d":<distance 1dp>,"mov":<moving_time>,"el":<elapsed_time>,"v":<average_speed 3dp>,"gap":<gap 3dp>,"hr":<average_heartrate>,"max_hr":<max_heartrate>,"cad":<average_cadence 1dp>,"intensity":<int>,"zone":<zone>}`
   Omit null keys; omit `intervals` entirely if the call fails or returns none. These are Intervals.icu's **server-side auto-detected** segments — they exist with or without watch laps, are computed on full-resolution data, and their `i0`/`i1` indexes align 1:1 with the streams stored below. They are the dashboard's preferred source of workout structure.
c. **`activity_streams_get`** with `types` = intersection of `stream_types` with `[time,distance,velocity_smooth,heartrate,cadence,altitude,watts]`, PLUS `grade_smooth` for Runs (works even when unlisted). Non-Run activities (tennis etc.): `time,heartrate` only. On a 422: retry with `time,watts,heartrate,velocity_smooth,cadence`.
   **NEVER request `latlng` or `temp` — the repo is public; GPS traces stay private.** Never `torque`/`fixed_altitude`.

### 3. Build the day-file — FULL resolution
Store **every sample** (no downsampling; the athlete wants maximum granularity). Rounding: `v` 3dp; `d`/`alt`/`grade` 1dp; `t`/`hr`/`cad`/`watts` ints. All present stream arrays must have equal length — truncate all to the shortest on mismatch.

COMPACT JSON (single line, no pretty-print):
```json
{"date":"<DATE>","tz":"America/Los_Angeles","activities":[{
 "id":"i…","name":"…","type":"Run","start_local":"YYYY-MM-DDTHH:MM:SS",
 "meta":{"distance_m":,"moving_s":,"elapsed_s":,"avg_hr":,"max_hr":,"avg_speed":,"gap_speed":,
         "cadence_rpm":,"stride_m":,"intensity":,"load":,"calories":,"elev_gain_m":,"elev_loss_m":,
         "hr_zone_secs":[7 ints],"decoupling":,"ef":,"interval_summary":[],"device":"","race":false},
 "intervals":[…runs only…],
 "streams":{"t":[],"d":[],"v":[],"hr":[],"cad":[],"alt":[],"grade":[],"watts":[]}
}]}
```
Meta mapping from `activity_detail_get`: `distance_m`=distance, `moving_s`=moving_time, `elapsed_s`=elapsed_time, `avg_hr`=average_heartrate, `max_hr`=max_heartrate, `avg_speed`=average_speed (3dp), `gap_speed`=gap (3dp), `cadence_rpm`=average_cadence (1dp — per-leg as recorded, do NOT double), `stride_m`=average_stride (2dp), `intensity`=icu_intensity (1dp), `load`=icu_training_load, `elev_gain_m`/`elev_loss_m` (1dp), `hr_zone_secs`=icu_hr_zone_times, `decoupling` (2dp), `ef`=icu_efficiency_factor (3dp), `device`=device_name. Omit null keys; omit absent streams. Multiple activities in one file, ordered by `start_local`.

### 4. Large-file write (required above ~80KB — long runs always)
A single write can't carry a 200KB+ file. Write the JSON as consecutive text parts `<scratchpad>/<DATE>_p01.txt`, `_p02.txt`, … (each ≤80KB, split between array elements, NO added whitespace/newlines at boundaries), then join:
```powershell
powershell -NoProfile -Command "$p=Get-ChildItem '<scratchpad>\<DATE>_p*.txt'|Sort-Object Name|ForEach-Object{[IO.File]::ReadAllText($_.FullName)};[IO.File]::WriteAllText('<repo>\data\streams\<DATE>.json',($p -join ''))"
```
Delete the parts afterwards.

### 5. Manifest
Add DATE to `data/streams/index.json` `dates` — keep sorted ascending, no duplicates. (The site discovers day-files through this manifest.)

### 6. Wellness upsert
`wellness_recent_list(from_date=DATE, to_date=today)`. Upsert into `data/wellness.json` `days` (sorted by `d`) a row for DATE and for today: `{"d","ctl":1dp,"atl":1dp,"ramp":rampRate 1dp,"hrv","rhr":restingHR,"sleepSecs","sleepScore","sleepQ":sleepQuality,"vo2max":1dp,"weight":1dp,"steps"}` — drop null fields. (Today's morning row feeds the site's "recovery today" ribbon; tomorrow's run finalizes it.)

### 7. Validate (must pass before finishing)
- `(Get-Content -Raw <file> | ConvertFrom-Json).activities.Count` parses and matches.
- Every stream array length equals the others AND the API's original sample count.
- `t` non-decreasing; `intervals[].i1` ≤ stream length.
- Report: per activity — samples stored/original, streams included, interval count, byte size.

## The context-awareness contract (why the file looks like this)
The file carries **raw truth**; the dashboard derives all presentation:
- **Session type** (intervals / tempo / threshold effort / long / steady / easy / recovery) is classified from `intervals` (segment speeds vs the session's own spread; preferred) with velocity-stream detection as fallback.
- **Workouts** render warmup / per-rep / recoveries / cooldown structure (from `intervals`) and NO km splits; **easy/steady/long runs** render km splits plus the progress signals (easy-purity %Z1–Z2, decoupling, EF, cadence-vs-176–180).
So never pre-digest, filter, or "summarize" data here — completeness at full resolution IS the contract. Metric definitions live in the site's methods dialog (public/index.html); keep them in sync if analytics change.

## Gotchas
- **Timezone**: always Pacific `start_date_local`; check the neighboring UTC day before declaring a run missing.
- **422s**: only request streams listed in `stream_types` (+`grade_smooth` for runs).
- **Cadence** is per-leg rpm (~86 = 172 spm); store as recorded — the site doubles for display.
- **Non-Run activities**: `t`+`hr` only, no `intervals`, no run metrics.
- **Empty wellness fields aren't errors** — unlogged; drop them.
- If any pull fails irrecoverably: write `routine/LAST_RUN_ERROR.txt` with the error and produce nothing partial.
