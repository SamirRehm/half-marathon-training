# Day Score (0–100) — "did today change the probability of running 1:20 on 2026-10-31?"

The score measures **the change in P(1:20 half on Oct 31, 2026) that today's data implies.** It is a *derivative, not a level* — it asks whether today made the north-star goal MORE likely (high score), LESS likely (low score), or left it essentially unchanged (neutral, ~60).

- **~85–100** — today meaningfully RAISED the odds: banked adaptation you didn't have, or proved fitness you hadn't shown, at acceptable risk.
- **~60** — NEUTRAL: today neither helped nor hurt. A fine-but-unremarkable day, or a maintenance/hold-serve day.
- **~15–45** — today LOWERED the odds: added injury risk, dug a fatigue hole, deepened the over-intensity pattern, missed work the trajectory needed, or under-fueled.
- null — no data.

North star = **1:20:00** (3:47.5/km). Two scores are computed, and they are **independent probability-changes against two different goals — NOT the same score with an offset:**
- `score` = ΔP(**1:20**), the dream/north-star line.
- `score_committed` = ΔP(**1:25**), the realistic/committed line.

**They can and should DIVERGE, sometimes in opposite directions — the gap between them is itself the signal, and neither is always higher.** Because the two goals need different things:
- A **breakthrough** (e.g. a strong 10K TT / PR) raises P(1:20) *a lot* (it's evidence the hard goal is alive) but barely moves P(1:25) (already likely, didn't need proof) → `score` > `score_committed`. A breakthrough should score HIGHER against 1:20.
- A **routine maintenance day**, especially once the 1:20 bar has risen, may read neutral-or-negative vs 1:20 (you needed more) while still solidly neutral vs 1:25 (on track) → `score_committed` > `score`.
- A **missed key session** hurts P(1:20) more than P(1:25) (the tight goal has less margin) → `score` < `score_committed`.
- An **injury/setback** hurts both, but hits the tighter 1:20 harder.

Interpretation the UI should make legible: when `score` sits BELOW `score_committed`, the dream is slipping while the realistic goal holds; when a breakthrough pushes `score` ABOVE `score_committed`, something specifically revived the hard goal. **Never compute one as the other ± a constant.** Evaluate each against what ITS goal's trajectory needs on this date.

The daily HM **prediction** (elsewhere) is the separate "what could you run today" figure (Riegel-based, ±3–5% at 10K→half, leaning slightly conservative because this athlete is speed-biased with an endurance deficit — his true half runs a touch slower than a naive 10K conversion). THIS score is "did today nudge the goal odds up or down."

Computed by the routine, stored per day, ALWAYS shown with its +/− breakdown. Human review may override.

---

## Why this design
1. **Probability-change, not absolute quality.** "How good was this day" smuggles in fixed value judgments; "how did this day move the odds" is what actually matters and is honest about being a derivative.
2. **All three real training days can hit 100.** A perfectly-executed easy day, quality day, AND long run are each the best possible thing on the day they were called for — so each maxes at 100. The ranking between them does NOT live in the ceiling; it lives in *whether the day was the right type given the plan and the athlete's state*. A workout doesn't beat an easy run by having a higher cap — they're equal — it simply has a narrower set of days on which it is the correct choice.
3. **The rising bar is EMERGENT, not bolted on.** Because the score is a probability-*change*, "falling behind" appears automatically: an easy 11 km that RAISED P(1:20) in July merely HOLDS it in September (by then the trajectory needs more), so it scores neutral with no special-cased bar. A string of neutral days where the calendar should be green *is* the athlete slipping off the 1:20 line — the math does the honesty for free.

## P(1:20) is not directly measurable — the score is a principled proxy estimate
We cannot compute a true probability from the data. So the score estimates *directional* probability-change from proxies with known sign. It is an honest estimate, not false precision.

```
SCORE = 60 (neutral, ΔP≈0)
      +  Σ  raisers   (things known to increase P(1:20), sized by magnitude & how much they applied today)
      −  Σ  loweres   (things known to decrease P(1:20))
clamped [0,100];  no-data = null
```
The same proxy can be a raiser or a lowerer depending on context (e.g. a workout on a green day = raiser; the same workout as a 4th-hard-day-in-8 = lowerer). Context is judged against: the plan (what the day was FOR), the athlete's state (form/HRV/RHR/sleep), recent load (last 7–10 days), and the goal trajectory (what P(1:20) needs by now).

### RAISERS — things that increase P(1:20) (the day scores UP when these are present & the day was the right vehicle for them)
- **Absorbable aerobic volume** (easy-run minutes at genuinely easy effort: HR ≤ ~145 / intensity ≤ ~78% / within ~15 s/km of easy target). The athlete's deficit is aerobic base (35:33 10K engine vs 1:30+ endurance) → this is the single biggest raiser, because it's both high-value AND repeatable. Value scales with minutes accrued vs the volume the trajectory needs by this date, × purity (drops sharply if effort drifts to "steady" — same stimulus, higher cost, the signature error).
- **Fitness DEMONSTRATED** (a race, time trial, or breakthrough workout that reveals capability the athlete hadn't shown — e.g. a faster 10K, a tempo held at a new pace, a long run at a pace/HR that beats prior bests) → **the single strongest raiser, up to ~+40.** A day that PROVES you got faster raised P(1:20) almost by definition, REGARDLESS of its fatigue/ATL cost. This is scored on the *evidence of new fitness*, and it explicitly OVERRIDES the intensity/density/red-day lowerers for that day — you do not penalize a breakthrough for being hard. (The fatigue it creates is handled the NEXT day, via that day's readiness, not by docking the breakthrough itself.)
- **Prescribed quality landed** (right pace band, reps completed) ON a day it was the correct choice (planned, green readiness, intensity-density in budget) → strong raiser: sharpens the top end 1:20 needs. (Distinct from a breakthrough: this executes known fitness well; a breakthrough reveals NEW fitness.)
- **Long run, goal-adequate, with LOW decoupling** (flat HR across a STEADY-effort run = the base is genuinely there). The most goal-specific session for this athlete → strong raiser; length milestones toward 16–18 km add. NOTE: decoupling is a clean signal ONLY on steady/easy long runs — on a PROGRESSION run that speeds up, HR is *supposed* to rise, so high "decoupling" there is mostly the negative split, not base deficit. Weight decoupling heavily on steady runs, lightly-or-not-at-all on progressions/workouts.
- **CTL rising while freshness is respected** (ramp in the healthy build zone ~+1…+2.5/wk, form not crashing) → raiser: the build is compounding without digging a hole.
- **Correctly-taken rest/recovery when needed** (fatigued/depleted/ill/life) → mild raiser: protects continuity, and every historical collapse was a broken block. Rest is not zero.
- **Leading indicators of the gap closing** (decoupling shrinking week-over-week, efficiency factor improving at a given HR, easy pace dropping at constant HR, cadence toward 176–180) → raisers: direct evidence P(1:20) went up.
- **Cross-training** (easy bike/elliptical/swim, esp. as an Achilles/load precaution) → **mild raiser** (~half the aerobic credit of the equivalent run — real aerobic maintenance and smart load management, but less run-specific). Never scored as a zero/missed day.
- **Weight 7-day avg trending toward ~128–130 at a safe rate WITH recovery intact** → mild raiser (worth real time at half distance).

### LOWERERS — things that decrease P(1:20) (the day scores DOWN)
- **Intensity on a day that needed easy/rest** — purity-killed easy day, or hard running on a recovery slot. The signature failure mode → strong lowerer, sized by severity.
- **Intensity-density too high** across the last 7–10 days (too large a share at threshold+; e.g. 4th hard day in 8) → lowerer, multi-day not just today.
- **Hot ramp / fatigue hole** — rampRate > ~+4/wk, or a day pushing form below ~−20 → lowerer: the boom-bust early-warning that preceded every crash (2022/2023/2024).
- **Hard work on a red day** (form < ~−15, HRV suppressed ~10–15%+, RHR up 3–5+, poor sleep) → lowerer: mortgages the next several days for a small bump.
- **Missed prescribed key work** with no legitimate reason → lowerer: the trajectory needed it.
- **Under-fuel signal** — weight dropping > ~0.4 kg/wk, or weight loss co-occurring with degraded HRV/RHR → lowerer: cannibalizes the aerobic-base and tendon-remodeling the goal depends on.
- **Injury/tendon-risk signals** (Achilles complaint, big unaccustomed load spike, plyometric overload) → strong lowerer: a flare that costs 2 weeks is the biggest single threat to Oct 31.
- **Unplanned zero by CHOICE / broken streak** (skipped without reason, motivation lapse) → lowerer: continuity is the #1 historical failure.
- **INVOLUNTARY lost day** (illness, injury, travel with no access, legitimate life) → only a **mild** lowerer (~−8 to −12, floor around 50), NOT the full behavioral-miss penalty. Rationale: it's not a training *choice*, so don't punish it like one — but a true probability-change is still slightly negative because the calendar has one fewer day against a rising trajectory. If illness/injury is serious or multi-day, the ongoing risk to the block is the real signal (flag it), not the single day's score.

## Magnitude discipline (important — most days should NOT swing wildly)
A true P(1:20) barely moves on any single ordinary day; it moves on ACCUMULATION and TREND. So:
- **Typical days cluster 50–75.** An ordinary good easy day is ~68–75, an ordinary rest day ~58–62, an ordinary sub-par day ~45–55. Reserve the extremes for genuinely probability-moving events.
- **Wide swings (85–100 or <40) require a REAL probability event:** a breakthrough/PR/strong TT (up), or a real setback — injury, an illness that threatens the block, a hot-ramp spike into deep fatigue, a broken streak after a good run (down).
- A perfect-but-routine easy day CAN reach the 90s in base phase (because banking the missing base genuinely raises the odds early) — but as the base fills, routine days compress toward neutral on their own (the emergent bar). Do not inflate every solid day into the 90s; solid ≠ probability-moving.

## Green-recovery floor (guard against over-swing)
A day with GOOD recovery signals (sleep good/excellent, HRV ≥ baseline, RHR ≤ baseline) and only a SHORT or EASY run — or rest — has **not** lowered P(1:20), and the score MUST NOT say it did. Floor such days at roughly NEUTRAL (~58–60), even if the run was paced hotter than ideal. Over-intensity on a short run when the body is fresh is at worst a "didn't help as much as easy would have" (neutral), NOT a "hurt the race" (sub-50). Reserve sub-50 for days that genuinely raise risk or break continuity: hard work on a RED/under-recovered day, a fatigue-hole spike (form crashing / hot ramp INTO deep fatigue), an intensity-density pattern while ALREADY tired, a broken streak, or an injury/illness setback. A single short/easy run on a green day is not one of these. (This directly corrects an earlier over-penalty: a rested 5 km should land ~neutral, not in the 40s.)

## How the pieces combine (judgment, not a rigid sum)
- Identify the day's TYPE and whether it matched the plan/state. If it was the right vehicle, its raisers count fully; if it was the wrong choice (e.g. intensity when easy was needed), the raiser is muted and the relevant lowerer fires.
- State metrics (form/HRV/RHR/sleep) modulate how much a hard day's contribution counts — green amplifies, red suppresses. Easy days are robust to state (their value holds even tired). This is why the same workout can be a raiser or a lowerer.
- Risk/density/fuel/injury terms look ACROSS days, not just today.
- Neutral days are common and CORRECT to score ~60 — not every day can raise the odds, and holding serve is fine.

## Ceilings & ordering the model enforces (sanity check)
- **Any** perfectly-executed, correctly-chosen day type → up to **100** (easy, quality, and long are equal-ceiling).
- On a **green** day: a great workout and a great long run and a great easy day can ALL reach the 90s–100 — the differentiator is which was the right choice today, not the type.
- On a **red/fatigued** day: correct rest scores high (raiser: protects the goal); the workout the athlete *wanted* scores low (lowerer: mortgages the future). The system pulls toward the right call exactly when instinct says push.
- Quality does not out-ceiling easy; it simply has fewer days on which it's the correct vehicle. On a tired day, easy/rest decisively outscore a workout.
- The bar rises by itself: identical easy run → raiser (high) vs 1:20 in July, neutral (~60) vs 1:20 in September, because by then it only holds the tight-goal odds. Note the 1:25 line rises MORE SLOWLY (it needs less), so mid-build the two scores separate — that separation is the point, not a bug.

## Output object (per day)
```json
{
  "date":"2026-07-05","score":63,"score_committed":70,"bar_phase":"base",
  "delta_p":"slightly positive",
  "components":[
    {"label":"Long run — longest since Mar 22 (aerobic base, the deficit)","delta":+14,"cat":"raiser"},
    {"label":"…but decoupling ~6% = base not deep yet (caps the gain)","delta":-4,"cat":"context"},
    {"label":"Back-half easy→steady creep (purity ↓)","delta":-5,"cat":"lowerer"},
    {"label":"Recovery green, work well-supported","delta":+2,"cat":"raiser"},
    {"label":"Ramp +3.3/wk — hot (risk building)","delta":-4,"cat":"lowerer"}
  ],
  "reviewed":false
}
```
Show `components` as the +/− breakdown, ~4–6 lines. `score` = vs 1:20; `score_committed` = vs 1:25. `delta_p` is a plain-language tag (raised / held / lowered).

## Worked examples (recomputed as probability-change)
- **Jul 5, long run 12 km @ 5:24 (planned 5:45), HR→167, decoup ~6%, green, ramp +3.3:** biggest raiser = longest run since March (real aerobic base). But two things blunt the ΔP: decoupling ~6% says the base isn't deep yet (the gain is smaller than the distance suggests), and the back-half purity loss + hot ramp are mild lowerers. Net: today nudged P(1:20) slightly UP. → **63 vs 1:20, 70 vs 1:25.** Good, not great — helped, but not the clean easy-or-controlled-long day that would've helped more.
- **Jul 6, prescribed OFF/true-jog; ran 25 min @ 5:10, HR→160s, 3rd hard-ish in 8:** no meaningful raiser (25 min at low purity on a rest slot banks little absorbable volume); lowerers fire (intensity on a recovery day, multi-day density). Today slightly LOWERED the odds. → **43 vs 1:20, 50 vs 1:25.** Not a disaster, but it moved the wrong way.
- **Ideal base-phase easy day (July): easy 11 km @ 5:50, HR 142, green, on a streak, cadence creeping up:** pure absorbable volume at exactly the effort the deficit needs, zero lowerers, continuity + leading-indicator raisers. Today clearly RAISED P(1:20). → **≈100 vs 1:20, 100 vs 1:25.** The green we want the calendar full of now.
- **Same easy 11 km in September:** by then the trajectory needs ~16 km long runs / higher easy volume, so 11 km merely HOLDS the odds rather than raising them → **≈60 (neutral).** The bar rose on its own; the effort didn't. A month of these neutrals with no green = visibly slipping off the 1:20 line.
- **Perfect prescribed threshold session on a green Tuesday (planned, density in budget, nailed paces):** strong raiser (sharpens the top end 1:20 needs), well-supported by recovery, no lowerers → **≈100.** Proof that quality days reach 100 too — when they're the right choice.

---

# Current-Fitness Goal Probability — P(hit goal if raced TODAY)

Separate from the day-SCORE (a *change*), the routine estimates **the probability of hitting each goal time if the athlete raced a half marathon TODAY, at current fitness.** This is a pure readout of where fitness IS right now vs the target — NOT a race-day forecast, NO build/interruption speculation. It is ~0% today (fitness is far from the goal) and rises ONLY as fitness rises (projected half time drops toward target). The chart shows fitness marching toward the goal line.

## Model (transparent — a confidence band around current fitness)
```
pred_now = current predicted half time  (from CTL/recent efforts → Riegel ^1.06,
           with the conservative speed-bias adjustment: this athlete is speed-biased
           with an endurance deficit, so his true half runs a touch SLOWER than a
           naive 10K conversion — bias pred_now slightly slow)
sigma    = realistic 1-day spread of that prediction (day-to-day form, pacing,
           conditions, measurement noise). Use ~2.5-3.5% of pred_now
           (≈ 2.5-3.5 min on a ~95-100 min half). Wider when data is sparse/noisy.
P(goal today) = Phi( (goal_time - pred_now) / sigma )
   # fraction of the current-fitness distribution that falls at or below the goal time
```
- `Phi` = normal CDF. Intuition: if your fitness projects to 1:37 with a ±3 min spread, the odds any single race today comes in at 1:20 (17 min faster) are vanishingly small → ~0%. When pred_now reaches ~1:23 with the same spread, P(1:20) climbs through the teens; at pred_now≈1:20 it's ~50%; faster, higher.
- Compute for BOTH goals with the same pred_now/sigma. P(1:20) < P(1:25) ALWAYS (1:20 is further from current fitness). This is a fitness gap, nothing else.
- **No interrupt_risk, no weeks_left, no trajectory multiplier.** Those belonged to the race-day-forecast model, which we are NOT using. This is strictly "how close is fitness today."

## Calibration anchors (so the routine's numbers are sane)
As of 2026-07-06: pred_now ≈ 1:37-1:38 (CTL ~20, base ~15 mi/wk). With sigma ≈ 3 min:
- **P(1:20 today) ≈ 0%** (rounds to 0; ~17 min gap is many sigma away). Honest: current fitness is nowhere near 1:20.
- **P(1:25 today) ≈ 0%** (~12-13 min gap, also many sigma). Also essentially zero today.
Both are ~0 now BY DESIGN — that's the truth of a base-phase fitness level, and the whole point is to watch them lift off as pred_now falls. Waypoints as fitness improves (independent of any build risk): pred_now 1:30 → P(1:25)~5%, P(1:20)~0%; pred_now 1:26 → P(1:25)~35%, P(1:20)~2%; pred_now 1:23 → P(1:25)~80%, P(1:20)~15%; pred_now 1:21 → P(1:25)~95%, P(1:20)~37%. The curve is the story.

## Storage (per day, on the SCORED entry — it reflects fitness after that day's training)
```json
"p_120": 0.00,  "p_125": 0.00,  "pred_half": "1:37:45",
"prob_note": "current-fitness readout; raced-today odds. ~0% now — pred ~1:37 vs 1:20/1:25 targets. Rises as fitness improves."
```
UI: chart of `p_120` and `p_125` over time (0-100%), labeled "if raced today," race day marked. Expect ~0 now; the story is lift-off as `pred_half` drops.
