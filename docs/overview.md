# Harptos Calendar Tracker

The Harptos Calendar Tracker is a single-screen tool for Dungeon Masters running a Forgotten Realms campaign around Neverwinter and Phandalin. During play it shows the current date and time, sunrise and sunset, and the local weather.

The clock starts on **1 Tarsakh 1491 DR, Year of the Scarlet Witch**, at **08:00**. Set the date and time, including festival days, or advance by 1, 2, 4, or 8 hours, 1 day, or 10 days. The clock handles festivals, Shieldmeet, and year changes, and saves the last valid time in the current browser.

The campaign starts in Neverwinter. Select Neverwinter or Phandalin to change locations while keeping the current date and time. The browser restores the selected location on reload. The clock displays estimated sunrise and sunset for the selected location and date, the current Faerûnian phase, and any active named clock marker.

The clock also shows an hourly weather condition. Weather depends on location, season, time of day, and recent conditions. The saved campaign seed gives the same weather when you revisit an hour, skip ahead, or reload.

## Planned additions

- Output a single line of plain text with the date, hour, time marker, and weather.

The first-release scope is one DM, one campaign, and the two campaign locations. Time advances by DM action. Daylight and weather serve session narration through campaign estimates.

See [Getting started](getting-started.md) for the repository’s current state, [Architecture](architecture.md) for the proposed design, and the [active roadmap](../roadmap/roadmap.json) for implementation order. The [campaign brief](../ROADMAP.md) preserves the original milestone descriptions and setting references.
