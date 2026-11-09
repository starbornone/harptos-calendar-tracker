# Decisions

These records capture the campaign requirements and first-release design choices from the [overview](overview.md) and [campaign brief](../ROADMAP.md). Implementation progress is tracked in the [active roadmap](../roadmap/roadmap.json).

## 1. Use a manual Harptos campaign clock

**Context.** A DM advances time during travel, rests, and downtime. Named holidays interrupt the regular sequence of Harptos months.

**Decision.** Use a 24-hour campaign day and begin on 1 Tarsakh 1491 DR. Support direct date and time edits and fixed elapsed-time advances. Treat festival days and Shieldmeet as valid days in the timeline.

**Consequences.** Crossing midnight or a festival can change the displayed date. A ten-day advance preserves the clock time, even when a festival shifts the destination’s day of the month.

## 2. Keep the first campaign in one browser

**Context.** The first release serves a single DM running sessions in Neverwinter and Phandalin. The starting hour and initial location were unspecified.

**Decision.** Use browser-local persistence for one campaign. Proposed first-run defaults are 08:00 and Neverwinter. Let the DM set the time and switch between Neverwinter and Phandalin.

**Consequences.** The campaign can resume in the same browser profile after a reload. A fresh profile or cleared site data starts a fresh campaign. The default hour can be corrected immediately through the clock control.

## 3. Separate solar phases from clock markers

**Context.** Sunrise and sunset vary with season and location. Some Faerûnian markers refer to approximate clock times.

**Decision.** Estimate daylight from a simple seasonal model. Display daylight-dependent phases alongside named clock markers when they apply. Treat the eight-to-sixteen-hour daylight range as a campaign tuning assumption.

**Consequences.** Dawn and dusk move through the year. A marker such as Time of Summer Sunset can appear near 17:00 alongside a different estimated sunset for the selected date.

## 4. Generate a repeatable weather sequence

**Context.** The DM can advance a single hour, skip downtime, switch locations, or correct the clock. Independent hourly rolls can give abrupt transitions or change conditions when the same hour is revisited.

**Decision.** Use one saved campaign seed with a sequence for each location. Weight conditions by season, hour, and location, with transitions influenced by the previous hour.

**Consequences.** Skipped hours still influence the result, and the same campaign, location, and hour reproduce the same condition. The model needs a plausible cloud or rain lead-in to a thunderstorm.

## 5. Track work in three JSON files

**Context.** Agents and importers need a stable way to distinguish queued, finished, and cancelled work.

**Decision.** Use the [roadmap format](roadmap-format.md) and treat the three JSON files as the source for item status. Preserve the Markdown campaign brief for design context.

**Consequences.** Each item keeps its ID as it moves, and status changes land with the work. The shared project metadata stays synchronized across the three files.
