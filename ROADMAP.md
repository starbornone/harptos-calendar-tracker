# Harptos Calendar Tracker Roadmap

Build a single-screen DM tool for tracking in-game time, daylight, and weather during the Neverwinter and Phandalin campaign. The campaign starts on **1 Tarsakh 1491 DR, Year of the Scarlet Witch**. Proposed defaults are **08:00 in Neverwinter**, with an editable clock and a location selector for Neverwinter and Phandalin. The first release assumes one campaign saved in the current browser. [1491 DR calendar](https://forgottenrealms.fandom.com/wiki/1491_DR) · [Phandalin setting guide](https://www.dndbeyond.com/posts/1515-visit-phandalin-d-ds-most-popular-starter-town)

## 1. Playable campaign clock

- Build the Harptos calendar around 24-hour days, twelve 30-day months, and three tendays per month. Handle the five annual festival days between months and insert Shieldmeet after Midsummer every fourth year, beginning with 1492 DR for this campaign. [Calendar of Harptos](https://forgottenrealms.fandom.com/wiki/Calendar_of_Harptos) · [Official Shieldmeet errata](https://www.dndbeyond.com/sources/dnd/sae/dungeon-masters-guide-2014#TheCalendarofHarptosp33) · [1492 DR calendar](https://forgottenrealms.fandom.com/wiki/1492_DR)
- Show the current Harptos date and 24-hour time. **Set Current Time** accepts a valid campaign date and time, including festival dates. Add **+1 hour**, **+2 hours**, **+4 hours**, **+8 hours**, **+1 day**, and **+10 days**. Day buttons advance 24 and 240 elapsed hours respectively, including any festival days crossed.
- Save the campaign clock after each edit and restore it on reload. If an entry is invalid, show what needs fixing and retain the last valid time.

**Ready when** 23:00 on 30 Tarsakh advances to 00:00 on Greengrass with **+1 hour**, followed by 1 Mirtul with **+1 day**. From 25 Tarsakh, **+10 days** reaches 4 Mirtul at the same clock time. Check the 1492 Shieldmeet sequence, a 1491 Midsummer without Shieldmeet, and the rollover from 30 Nightal to 1 Hammer. Confirm that reload restores an edited time.

## 2. Daylight and Faerûnian time markers

- Add the location selector and show estimated sunrise and sunset for the selected date. Use roughly eight hours of daylight around Midwinter and sixteen around Midsummer for northern Faerûn, and twelve hours year-round for the Halruaa profile.
- Show the current Faerûnian phase alongside the numeric clock. Use Midnight, Moondark, Night’s End, Dawn, Morning, Highsun, Afternoon, Dusk, Sunset, and Evening. Anchor Dawn to sunrise, Dusk to the lead-up to sunset, and Evening to the period after sunset. [Hours of the day](https://forgottenrealms.fandom.com/wiki/Hours_of_the_day)
- Show the current clock marker alongside the phase. Use continuous ranges across the 24-hour clock, including Foredawn around 05:00, Mornbright around 08:00, Midmorn around 10:00, High Morn around 11:00, Waterclock around 14:00, Time of Summer Sunset around 17:00, and Twilight around 18:00. [Hours of the day](https://forgottenrealms.fandom.com/wiki/Hours_of_the_day)

**Ready when** summer daylight lasts longer than winter daylight, dawn and evening labels follow the displayed solar times, and switching locations keeps the campaign date and clock intact.

## 3. Hourly weather

- Show a short current condition such as **Clear Skies**, **Overcast**, **Rain**, or **Thunderstorm**. Weight conditions by season, time of day, and location. Give Neverwinter a milder winter profile and use configurable inland weights for Phandalin. [Neverwinter setting guide](https://www.dndbeyond.com/posts/1485-take-a-tour-of-these-popular-locations-in-the)
- Vary front lengths and let wetter or drier spells span several fronts. Give precipitation a cloudy transition, favor fog near dawn, and let short thunderstorms develop within warm afternoon rain.
- Save a campaign seed and include it in share links. Derive each location’s hourly weather from the same sequence when advancing, revisiting an hour, reloading, or adopting a shared campaign.

**Ready when** an eight-hour jump gives the same result as eight one-hour advances for the same seed and location. Check a ten-day jump, reload, and two browsers advancing from the same shared campaign. Sample summer and winter across the selectable locations for varied durations and plausible transitions.

## 4. Table-ready release

- Run a mock session starting on 1 Tarsakh 1491 DR. Advance through travel from Neverwinter to Phandalin, cross midnight during a rest, correct the clock manually, and skip a tenday of downtime.
- Keep the date, phase, daylight, weather, and time controls visible at a glance. Check keyboard access, narrow-screen layout, and reload recovery for the clock, location, and weather together.

**Ready when** the DM can run the mock session from a single screen and resume it after closing and reopening the tracker.

Campaign reference. [Harptos Monthly and Lunar Calendar by MidnightFriday](https://www.deviantart.com/midnightfriday/journal/DnD%29-Harptos-Monthly-and-Lunar-Calendar-929404456)
