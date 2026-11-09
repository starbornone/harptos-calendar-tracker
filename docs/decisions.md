# Decisions

These records capture the campaign requirements and first-release design choices from the [overview](overview.md) and [campaign brief](../ROADMAP.md). Implementation progress is tracked in the [active roadmap](../roadmap/roadmap.json).

## 1. Use a manual Harptos campaign clock

**Context.** A DM advances time during travel, rests, and downtime. Named holidays interrupt the regular sequence of Harptos months.

**Decision.** Use a 24-hour campaign day and begin on 1 Tarsakh 1491 DR. Represent the clock as elapsed minutes from 00:00 on 1 Hammer 1 DR and support positive DR years. Use the same timeline for direct edits and fixed elapsed-time advances. Treat festival days and Shieldmeet as valid days in the timeline.

**Consequences.** Crossing midnight or a festival can change the displayed date. A ten-day advance preserves the clock time, even when a festival shifts the destination’s day of the month.

## 2. Keep the first campaign in one browser

**Context.** The first release serves a single DM running sessions in Neverwinter and Phandalin. The starting hour and initial location were unspecified.

**Decision.** Use browser-local persistence for one campaign. The clock starts at 08:00 in Neverwinter. Let the DM set the time and switch between Neverwinter and Phandalin. Save the time and location independently so each can be restored on its own.

**Consequences.** The campaign can resume in the same browser profile after a reload. A fresh profile or cleared site data starts a fresh campaign. Switching locations keeps the current date and time.

## 3. Separate solar phases from clock markers

**Context.** Sunrise and sunset vary with season and location. Some Faerûnian markers refer to approximate clock times.

**Decision.** Use a smooth seasonal curve with its longest day on 20 Kythorn and shortest on 20 Nightal. Center daylight on 12:00 and round sunrise and sunset to the nearest minute. Use 8–16 hours of daylight for Neverwinter and 8 hours 20 minutes to 15 hours 40 minutes for Phandalin as campaign tuning choices. Phandalin is south of Neverwinter, so the model gives it a slightly narrower seasonal range. [Harptos calendar](https://forgottenrealms.fandom.com/wiki/Calendar_of_Harptos) · [D&D Beyond’s Phandalin guide](https://www.dndbeyond.com/posts/1515-visit-phandalin-d-ds-most-popular-starter-town)

**Phase windows.** Dawn begins 30 minutes before sunrise and lasts an hour. Night's End starts 90 minutes before sunrise and runs until Dawn. Dusk starts one hour before sunset, Sunset starts at sunset, and Evening starts 30 minutes later. Midnight and Highsun each span 30 minutes on either side of 00:00 and 12:00, respectively. These boundaries are campaign rules for the setting’s informal phases. [Faerûnian hours of the day](https://forgottenrealms.fandom.com/wiki/Hours_of_the_day)

**Consequences.** Sunrise and sunset change with date and location. Festival days count as elapsed days in the curve, and Shieldmeet leaves the solstice dates fixed. Named markers start 15 minutes before their clock time and last 30 minutes, so Time of Summer Sunset can appear near 17:00 alongside a different estimated sunset for the selected date.

## 4. Generate a repeatable weather sequence

**Context.** The DM can advance a single hour, skip downtime, switch locations, or correct the clock. Independent hourly rolls can give abrupt transitions or change conditions when the same hour is revisited.

**Decision.** Use one saved campaign seed with a sequence for each location. A weather front shares a roll across six hours while the condition weights vary by local hour and season. Favor fog near dawn and thunderstorms on warm afternoons. Give Neverwinter a milder winter profile and more fog, and give Phandalin more winter snow as campaign tuning choices. [Neverwinter setting guide](https://www.dndbeyond.com/posts/1485-take-a-tour-of-these-popular-locations-in-the) · [Phandalin setting guide](https://www.dndbeyond.com/posts/1515-visit-phandalin-d-ds-most-popular-starter-town)

**Consequences.** The same seed, location, and hour reproduce the same condition after a jump, rewind, or reload. A thunderstorm can start after overcast or rain, or continue from the previous hour. If a storm roll lacks that lead-in, the hour is overcast.

## 5. Track work in three JSON files

**Context.** Agents and importers need a stable way to distinguish queued, finished, and cancelled work.

**Decision.** Use the [roadmap format](roadmap-format.md) and treat the three JSON files as the source for item status. Preserve the Markdown campaign brief for design context.

**Consequences.** Each item keeps its ID as it moves, and status changes land with the work. The shared project metadata stays synchronized across the three files.

## 6. Build the tracker with Vite, TypeScript, and shadcn/ui

**Context.** The tracker has one screen and the calendar can run entirely in the browser.

**Decision.** Use Vite with TypeScript and React for shadcn/ui. Keep the Harptos rules in a module shared by the browser and Node’s built-in test runner. Use charcoal, parchment, and gold as the base palette, with ember copper for Neverwinter and mineral green for Phandelver. [Midnight Archive](https://www.midnightarchive.online/) · [shadcn/ui theming](https://ui.shadcn.com/docs/theming)

**Consequences.** The production build produces static files in `dist/`. Calendar tests run in Node without starting a browser or server. New shadcn/ui components inherit the semantic color tokens in [src/index.css](../src/index.css).
