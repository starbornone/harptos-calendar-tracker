# Decisions

These records capture the campaign requirements and first-release design choices from the [overview](overview.md) and [campaign brief](../ROADMAP.md). Implementation progress is tracked in the [active roadmap](../roadmap/roadmap.json).

## 1. Use a manual Harptos campaign clock

**Context.** A DM advances time during travel, rests, and downtime. Named holidays interrupt the regular sequence of Harptos months.

**Decision.** Use a 24-hour campaign day and begin on 1 Tarsakh 1491 DR. Represent the clock as elapsed minutes from 00:00 on 1 Hammer 1 DR and support positive DR years. Use the same timeline for direct edits and fixed elapsed-time advances. Treat festival days and Shieldmeet as valid days in the timeline.

**Consequences.** Crossing midnight or a festival can change the displayed date. A ten-day advance preserves the clock time, even when a festival shifts the destination’s day of the month.

## 2. Keep the first campaign in one browser

**Context.** The first release serves a single DM running sessions in Neverwinter and Phandalin. The starting hour and initial location were unspecified.

**Decision.** Use browser-local persistence for one campaign. The clock starts at 08:00 in Neverwinter. Let the DM set the time and switch locations. Restore the last saved time and location when the campaign resumes.

**Consequences.** The campaign can resume in the same browser profile after a reload. A fresh profile or cleared site data starts a fresh campaign. Switching locations keeps the current date and time.

## 3. Separate solar phases from clock markers

**Context.** Sunrise and sunset vary with season and location. Some Faerûnian markers refer to approximate clock times.

**Decision.** Center daylight on 12:00 and round sunrise and sunset to the nearest minute. Use the Harptos festivals as campaign tuning points, with 8 hours of daylight on Midwinter and 16 hours in Neverwinter or 15 hours 40 minutes in Phandalin on Midsummer. The Halruaa daylight profile uses 12 hours year-round. [Harptos calendar](https://forgottenrealms.fandom.com/wiki/Calendar_of_Harptos)

**Phase windows.** Dawn begins 30 minutes before sunrise and lasts an hour. Night's End starts 90 minutes before sunrise and runs until Dawn. Dusk starts one hour before sunset, Sunset starts at sunset, and Evening starts 30 minutes later. Midnight and Highsun each span 30 minutes on either side of 00:00 and 12:00, respectively. These boundaries are campaign rules for the setting’s informal phases. [Faerûnian hours of the day](https://forgottenrealms.fandom.com/wiki/Hours_of_the_day)

**Consequences.** The northern curve stays near its longest and shortest days around the festivals, including in Shieldmeet years. Clock marker ranges cover all 24 hours. For example, Mornbright runs from 07:30 until Midmorn begins at 09:00, and Time of Summer Sunset runs from 16:30 until Twilight begins at 17:30. Solar phases still follow the date and location.

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

## 7. Use local conditions with a shared campaign clock

**Decision.** Keep one Harptos date and 24-hour clock across settings. Greyhawk refers to the Free City. The daylight lengths and weather weights are campaign estimates based on the settings’ geography and descriptions. [Sword Coast cities](https://www.dndbeyond.com/posts/1519-how-to-run-city-campaigns-in-dungeons-dragons) · [Sharn: City of Towers](https://files.spawningpool.net/docs/Vault2.0.-.TTRPG-Gamebooks/Dungeons%20%26%20Dragons%20%5Bmulti%5D/D%26D%203rd%20Edition/Eberron/Sharn%20-%20City%20of%20Towers.pdf) · [Call of the Netherdeep](https://www.dndbeyond.com/sources/dnd/cotn) · [Shadow of the Dragon Queen](https://www.dndbeyond.com/sources/dnd/sotdq) · [Greyhawk setting guide](https://www.dndbeyond.com/posts/1834-greyhawk-returns-in-the-2024-dungeon-masters-guide)

| Location | Daylight or ambient light | Weather emphasis |
| --- | --- | --- |
| Baldur’s Gate | 9h 20m–14h 40m | River fog and rain, with rare snow |
| Waterdeep | 8h 40m–15h 20m | Coastal rain and wind, with winter snow |
| Sharn | 12h year-round | Warm, frequent rain and thunderstorms |
| Sigil | Peak at 12:00 and Antipeak at 00:00 | Smog, fog, and drizzle |
| The Radiant Citadel | Steady Auroral Diamond light | Clear air and ethereal mist |
| Bazzoxan | 9h 40m–14h 20m | Gusty winds, little rain, and some winter snow |
| Kalaman | 9h–15h | Harbor fog, rain, and wind |
| Greyhawk | 9h 30m–14h 30m | River fog, rain, and winter snow |

**Consequences.** The solar estimates stay centered on noon. Sigil’s phase tracks its ambient light cycle, and the Radiant Citadel stays at Steady Light. Both retain the campaign’s clock marker. [Sigil and the Outlands](https://www.dndbeyond.com/sources/dnd/paitm/sato) · [The Radiant Citadel and the Ethereal Plane](https://www.dndbeyond.com/posts/1239-what-is-the-ethereal-plane-get-lost-in-this-realm)

## 8. Preview shared moments before adopting

**Decision.** Use a versioned query string to carry the elapsed minute, location ID, and weather seed. Open a valid link as a read-only preview. Save all three fields together when the recipient adopts the moment.

**Consequences.** The URL reproduces the shared weather with the same model and leaves the recipient’s local campaign intact during preview. The app can restore saves written under the earlier per-field keys.
