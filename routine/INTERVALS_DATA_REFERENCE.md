# Intervals.icu — data reference for the routine

Everything the routine can pull from Intervals.icu, which fields matter, and how to read them. Derived from the live API. The connector authenticates **as the athlete** (added in Claude Code → Settings → Connectors). All tool names below are the Intervals.icu MCP connector tools.

---

## Connection & auth
- The routine reaches Intervals.icu through the **Intervals.icu MCP connector**, attached to the routine and authenticated as the athlete. No API key goes in the repo.
- If a pull fails with an auth error, the connector needs re-authorizing (Settings → Connectors) — the routine should write `routine/LAST_RUN_ERROR.txt` and commit nothing rather than guess.

## TIMEZONE (critical)
Athlete is **US Pacific (UTC−8/−7)**. Intervals stores timestamps in UTC, BUT the API's `start_date_local` field is already in Pacific — **use `start_date_local` to date activities.** Evening Pacific runs (7–9 PM) fall on the *next* UTC day, so a naive UTC "today"/"yesterday" query mis-dates them. Always resolve "today"/"yesterday" in Pacific local; if a run seems missing, check the neighboring UTC day.

---

## Tools & what to call

### `athlete_today_get`
One-call snapshot of today: wellness + any completed activities + planned events + fitness. Good first pull for the "open today" job. Returns a `wellness` block (see fields below) and `_meta` with section counts.

### `wellness_recent_list` (from_date, to_date)
Daily wellness rows. Use for a specific day (`from=to=that date`, Pacific) or a range. **This is the recovery/fitness source.**

### `activities_list` (from_date, to_date, limit)
Completed activities in a window. Each row has the summary fields (distance, moving_time, average_heartrate, icu_intensity, icu_training_load, start_date_local, type, total_elevation_gain, id, name). **Use `id` to fetch detail/streams.** NOTE the API returns activities dated by UTC window — pull a slightly wider window and filter by `start_date_local` to Pacific-yesterday to avoid boundary misses.

### `activity_detail_get` (activity_id)
The FULL record for one activity — 200+ fields. Use for any workout / long run / notable day. Key fields below.

### `activity_streams_get` (activity_id)
Second-by-second arrays. **This is where the real read lives** — averages hide the story. Available streams: `time`, `velocity_smooth` (→ pace), `heartrate`, `cadence`, `watts` (running power — the Garmin records it), `distance`, `altitude`, `fixed_altitude`, `latlng`, `torque`. Analyze how pace/HR/cadence/power EVOLVE across the run.

### `activity_intervals_get` (activity_id)
Auto-detected + manual laps/intervals with per-interval averages (pace, HR, cadence, gap, zone). Use to read workout structure (rep splits, fade across reps).

### Supporting (occasional)
- `athlete_sport_settings_run_get` → HR zones, LTHR (172), max HR (190), threshold pace.
- `athlete_ftp_run_get` → threshold HR/pace.
- `athlete_power_curves_get` / `athlete_pace_curves_get` (type=Run, newest=date) → best-effort curves for benchmarking (e.g. "is today's 5k a season best").
- `activity_power_curve_get` (activity_id) → that run's power curve.

---

## WELLNESS fields (per day) — what to grab & how to read

**Populated for this athlete (grab every day):**
| field | meaning | how to read |
|---|---|---|
| `ctl` | Chronic Training Load = **fitness** | rising = building; the goal needs ~mid-30s+ by Labor Day. Now ~20. |
| `atl` | Acute Training Load = **fatigue** | spikes after hard days; compare to CTL for form. |
| `form` (compute) | **CTL − ATL** | freshness. < −15 = deep fatigue (suppress hard work); positive = fresh/tapered. |
| `rampRate` | CTL change /wk | healthy build ~+1…+2.5. >~+4 = injury-risk ramp (penalize). |
| `hrv` | overnight HRV (ms) | baseline ~87 (range 77–99). ≥ baseline = recovered; a ~10–15% drop = flag. |
| `restingHR` | overnight RHR | baseline 46–48. Up 3–5 = fatigue/illness flag. |
| `sleepSecs` | sleep duration | /3600 for hours. ≥7.5 h good; <6 h = downgrade the day. |
| `sleepScore` | device sleep score | higher better (0–100). |
| `sleepQuality` | subjective | **INVERTED: 1 = excellent, 2 = good** (lower is better). |
| `vo2max` | device VO2max est | trend marker; ~54 now (was 58 Nov 2025). |
| `weight` | body weight (kg) | currently EMPTY — athlete to start logging. Interpret 7-day avg only; target ~128–130 lb (~58–59 kg). |

**Available but currently EMPTY (grab if they appear — they light up when the athlete starts logging / adds a sensor):** `avgSleepingHR`, `respiration`, `spO2`, `bloodGlucose`, `hydration`/`hydrationVolume`, `soreness`, `fatigue`, `mood`, `motivation`, `stress`, `readiness`, `bodyFat`, `abdomen`, nutrition (`kcalConsumed`, `carbohydrates`, `protein`, `fatTotal`), `baevskySI`, `lactate`, and a free-text `comments`. The UI renders whatever is present, so grabbing them is future-proof.

---

## ACTIVITY fields — what to grab & how to read

**Summary (always):** `distance` (m), `moving_time`/`elapsed_time` (s), `average_heartrate`, `max_heartrate`, `icu_intensity` (% of threshold), `icu_training_load` (TSS-like), `start_date_local`, `type`, `total_elevation_gain`/`loss`, `id`, `name`, `calories`.

**Form & efficiency (grab — these were under-used before and matter for the goal):**
| field | meaning | how to read |
|---|---|---|
| `average_cadence` | steps/min (may report as ~86 = half of 172 — double it) | ~172–175 now; nudging toward 176–180 is a cheap Achilles-load lever. Track the trend. |
| `average_stride` | stride length (m) | longer stride at same pace = more Achilles load; watch alongside cadence. |
| `pace` | avg pace (m/s or s/km) | the raw speed. |
| `gap` | **grade-adjusted pace** | USE THIS on hilly routes — judges effort fairly vs raw pace. Athlete's routes have real elevation. |
| `icu_efficiency_factor` | speed per HR beat | **key fitness-trend marker** — improving EF at a given HR = aerobic fitness rising. Compare like-for-like (easy runs vs easy runs). |
| `decoupling` | HR drift (Pw:HR or Pa:HR) | aerobic durability. LOW on a steady long run = base is there. **Only meaningful on STEADY efforts** — on a progression/workout, rising HR is mostly the negative split, so weight lightly. |
| `trimp` | HR-based training impulse | alt load measure. |
| `polarization_index` | intensity distribution | context on how polarized the session was. |

**Intensity distribution (grab — the truth about how a run was actually run):**
- `icu_hr_zone_times` = array of seconds in each HR zone `[z1,z2,z3,z4,z5,z6,z7]` against zones `[145,153,162,171,176,181,190]`. This is the REAL easy-vs-hard breakdown of a run — far better than the single average. Use it to judge easy-purity (was an "easy" run actually in Z1–Z2, or did it drift to Z3+?).

**Structure & subjective:**
- `interval_summary` = auto-detected rep structure (e.g. "10x 5m24s 158bpm"). Quick read of a workout.
- `feel`, `perceived_exertion`, `session_rpe` = subjective fields the athlete *could* fill (currently empty) — grab if present, they add context no metric captures.
- `device_name` (Garmin Forerunner 255), `race` (bool), `commute` (bool).

**Streams (for workouts/long runs/anomalies)** — from `activity_streams_get`, analyze the full arrays:
- **pace (`velocity_smooth`) evolution:** did they hold the prescribed pace, or drift? negative-split? surge on hills?
- **`heartrate` drift:** rising HR at steady pace = decoupling (base signal on steady runs).
- **`cadence` stability:** holds ~172+ even when tired? (mechanically good.)
- **`watts` (power):** surges vs cruise (e.g. attacking hills vs easing over them); power is steadier than pace on hills.
- **`altitude`:** contextualizes pace/HR spikes as terrain, not effort.

---

## How the routine USES this (ties to DAY_SCORE.md)

- **Recovery (wellness)** → the readiness read for JOB 2 (prescribe today): HRV/RHR vs baseline, sleep, form. Green → can absorb quality; red → downgrade.
- **Activity averages + `icu_hr_zone_times` + streams** → the day-SCORE for JOB 1 (score yesterday): was it the right day type, run at the right effort (easy-purity from zone times), with what decoupling (base signal on steady runs).
- **`icu_efficiency_factor`, `decoupling` trend, `average_cadence` trend, pace-at-HR** → the leading-indicator raisers in DAY_SCORE (signs the gap is closing).
- **`ctl` + recent efforts → pred_now → the raced-today probability** (P(sub-1:20)/P(sub-1:25)).
- **`data/activities.csv` (full 4.5-yr history)** → historical context: is this a post-injury best? how does current CTL/volume compare to 2022–23 peak? has this weekly load been handled before?

## Gotchas
- **Cadence** often reports as ~half (86 not 172) — it's counting one leg. Double it, or note the convention.
- **Averages lie on varied runs** — always pull streams for anything that isn't a flat steady effort.
- **`decoupling` is null on many runs** — compute from streams (first-third vs last-third pace:HR) when needed, and only trust it on steady efforts.
- **Timezone** (see above) is the single most common dating error — always `start_date_local` + Pacific.
- **Empty wellness fields aren't errors** — they're unlogged; render/skip gracefully.
