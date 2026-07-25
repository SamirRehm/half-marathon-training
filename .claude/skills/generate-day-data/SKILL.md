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
4. A **deep stream read** (step 7) — the findings that the day's score and coaching entry must be based on. Never score a run from its averages.

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

### 7. Deep stream read — EVERY run, EVERY time, no exceptions

**There is no such thing as a run that doesn't need this.** Not a 25-minute recovery jog, not a shakeout, not a run whose averages look unremarkable, not the fourth easy Wednesday in a row. Every activity of type Run gets the full read in **7A** before anything is scored, and the session type only decides what gets *added* on top in 7B — never whether the read happens.

The reason is empirical: the two worst analysis failures on this athlete were on runs that looked least interesting.
- A club night whose averages read as a tidy quality day (103.5% intensity, green recovery, good warmup) was a 5K raced in six pieces at 98% of max HR with 73% of the work at Z5+ — 30 points of scoring error.
- A long run averaging 141 bpm at 72.6% read as "the first genuinely easy long run of the build." It was 12 km genuinely easy followed by 4 km at 4:51/4:52/4:37/4:27 and HR 160–165, against a prescription with a 148 ceiling. The average described neither half.

Both were missed by trusting a summary. A mean is a claim that a run had one character; most runs don't.

"Nothing notable" is a legitimate **conclusion**, but only after 7A has actually been computed. Record the numbers either way — a boring run's numbers are what make next month's trend readable, and a recovery jog run at 79% with HR drifting into the 160s *is* a finding even though nothing dramatic happened.

Compute everything below from the **full-resolution** arrays and write it into the day's `stream_read` object, then reflect it in `entry` / `components`.

#### 7A. Mandatory battery — run this on every Run
1. **Segment the run first** (recording gaps — see below). You cannot know a run was unstructured until you have looked; assuming it was is how structure gets missed.
2. **Zone distribution as percentages**, not just seconds — and explicitly `pct_z5_plus` and `z7_secs`. For a base-phase athlete these two decide whether a session was aerobic or anaerobic work.
3. **Peak HR as a percentage of max (190).** Anything ≥95% means the session went to the well, whatever the label on it said.
4. **Moving vs elapsed**, i.e. stopped time. Report it whenever it is ≥5 min. Standing time drags the average HR down, so a run with 40 minutes of stops reads far easier in aggregate than the running was — and long rests are also what let an athlete hold paces they otherwise couldn't, so a set that only works because of its rests is not the stimulus it appears to be.
5. **Prescribed vs executed**, in the prescription's own units (the pace band and/or HR ceiling from the previous day's `note_next`). State the delta in s/km or bpm. If there was no prescription, say so.
6. **Cadence trend across the session** (per rep, or first half vs second). A drop of ≥3 spm is a mechanical fatigue tell and usually precedes a pace collapse.
7. **The finish against the body of the run.** Split the moving time and compare the last quarter with the rest. A finish ≥20 s/km quicker is a gear change: report the finish pace, the body pace, the gap, and the HR at each — never average it away. This applies to workouts too, where it reads as the closing rep either holding or fading.
8. **Easy purity** — % of time in Z1–Z2. Meaningful on every run, including quality days, because it says how much of the session was actually cheap. Note it is computed on moving samples, so stops don't distort it, but a fast finish *dilutes* it — read it next to check 7.
9. **Decoupling** on any steady effort ≥25 min, with the negative-split caveat when the run progressed. **EF (m/beat)** for the like-for-like trend against previous easy and long runs.

#### 7B. Then add, according to what the run turned out to be
Everything in 7A still applies; these are additions, not alternatives.

**Is it structure, or was he just tired? Two signals, either sufficient**
Pauses alone prove nothing — a continuous run stops at crossings, or because the athlete needed a breather. Decide with these, and do NOT require the reps to be uniform (that would reject a 1600/1200/800/400 pyramid or a fartlek, both real sessions):
- **Deliberate recoveries cluster.** Consistent length, ≥1 min. Jul 21 2026 rests ran 172/200/211 s — obviously planned. Jul 23 2026 ran 28/37/52/74/87/231/276 s — obviously not.
- **Work and float alternate in pace.** Structured work swaps fast/slow/fast/slow. A progression run or a long run with a fast finish also spreads its paces, but *monotonically* — the quick blocks bunch at the end. Alternation is what separates them, and it is also what identifies a fartlek.

Rank the evidence: clustered standing rests (strongest) → Intervals' own work/recovery detection when the recoveries were jogged → a pace-only read from uneven pauses (weakest, and say so). If none of these fires, it is a continuous run: report the pauses explicitly ("6 pauses totalling 13:26, too uneven to be recoveries") rather than silently dropping them, and use moving-time splits so the stops don't inflate the paces.

**Segment on the recording gaps FIRST — they are the workout, not noise**
This athlete stops the watch during standing recoveries. So discontinuities in the `t` channel are the rep boundaries, and they are the most reliable structural signal available — more reliable than laps, and far more reliable than any velocity-threshold detector. Before anything else: scan `t` for jumps (>20 s), split the activity into the moving blocks between them, and treat the jump durations as the recoveries. Four blocks of ~365 s separated by ~200 s gaps is `4 x 1 mile off 3 minutes`; nothing else it could be.

**Never judge rep execution from autolap kilometres.** Auto-laps straddle rep boundaries — the tail of one rep's fast finish plus the head of the next rep's controlled start — which manufactures a phantom mid-set collapse. On 2026-07-21 that artefact produced a confident, completely wrong report of "rep 4 cracked to 3:59 with cadence falling," and a 30-point scoring error. If gap-derived blocks exist, they win.

**Then look for structure INSIDE each rep.** A rep is often not one pace: 2026-07-21 was 1000 m at 5K pace + ~560 m at mile pace, repeated four times. Whole-rep averages hide that completely. Split each rep where its pace steps (or at the prescribed distance, if known) and report both legs with their own pace and HR. Check whether the step is consistent across reps — a repeating internal pattern is design, never fade.

**Ask what the session was meant to be.** If `note_next` or `planned` doesn't state the structure, say what the stream shows and ask the athlete rather than assuming. "Six kilometre reps" and "four mile reps with an internal gear change" score very differently, and only one of them was real.

**If the run HAS structure (intervals / tempo / threshold / fartlek)**
- **Per-rep pace, HR and cadence** from the gap-derived blocks, or the `intervals` array when the recoveries were jogged. Then judge the *shape*: even, progressive, or ragged. A rep that drops ≥8 s/km off its neighbour with cadence falling is a crack, not a variation — call it out with the rep number.
- **Set average pace vs (a) the threshold estimate and (b) the athlete's best 5K/10K pace for the window.** This is the single most diagnostic comparison available: if a rep set averages at or faster than recent 5K race pace, the athlete raced, and the session should be scored as a race-effort day regardless of what it was called.
- **Whether HR actually recovered between reps** (the minimum HR in each gap). Starting successive reps above ~85% of max means there was no recovery and the set became one continuous maximal effort.
- **Warmup and cooldown quality** — these are separate activity files on club/track nights. A cooldown above Z2 means the session never ended.

**If the run has NO structure (easy / steady / long / recovery)**
- **Kilometre splits on moving time**, so stops don't inflate the paces, with per-split HR — this is where a gear change becomes visible split by split.
- **Disclose the pauses explicitly** if there were any, with their count, total and range, and why they didn't qualify as recoveries. Silently dropping them overstates how continuous the effort was.
- **Whether HR drifted one-way at constant pace** — the aerobic-drift read, distinct from decoupling.
- Note that the 7A finish check matters *most* here. The 2026-07-18 long run is the cautionary case: nothing in its averages hinted at 4 km of tempo inside it.

**Non-Run activities** (tennis and similar) carry only `t` and `hr`, so the read is short: duration, zone distribution, peak HR. Do it anyway and score it as cross-training — a mild raiser, never a zero.

Write the honest read even when it contradicts the obvious framing — the Jul 21 2026 club night looked like a well-executed quality day by its averages (103.5% intensity, green recovery, good warmup) and the stream showed a 5K raced in six pieces at 98% of max HR with 73% of the work at Z5+. Scoring it from the aggregates got it wrong by 30 points.

### 8. Validate (must pass before finishing)
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
- **Never estimate a sample. Omit the stream instead.** Every value in a day-file must be read data or computed from read data. If a stream can't be transcribed reliably — e.g. a barometric `altitude` array on a flat track session comes back as a long run-length step function whose boundary index you cannot count exactly — **drop that stream key for that activity** and say so. Omitting is schema-valid and the site degrades gracefully; a plausible-looking estimate is not recoverable later because nothing marks it as one. (Precedent: `2026-07-19` / `i167207575` has no `alt` for this reason.) Note that `alt` feeds only the decorative elevation strip — GAP uses the separately-fetched `grade_smooth`, so dropping it costs no metric.
- **Timezone**: always Pacific `start_date_local`; check the neighboring UTC day before declaring a run missing.
- **422s**: only request streams listed in `stream_types` (+`grade_smooth` for runs).
- **Cadence** is per-leg rpm (~86 = 172 spm); store as recorded — the site doubles for display.
- **Non-Run activities**: `t`+`hr` only, no `intervals`, no run metrics.
- **Empty wellness fields aren't errors** — unlogged; drop them.
- If any pull fails irrecoverably: write `routine/LAST_RUN_ERROR.txt` with the error and produce nothing partial.
