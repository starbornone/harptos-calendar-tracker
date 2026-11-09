# Harptos Calendar Tracker

The Harptos Calendar Tracker is a single-screen tool for Dungeon Masters running a Forgotten Realms campaign around Neverwinter and Phandalin. The full tracker will answer three questions during play. What is the in-world date and time, how much daylight is left, and what weather should the party encounter?

The clock starts on **1 Tarsakh 1491 DR, Year of the Scarlet Witch**, at **08:00**. Set the date and time, including festival days, or advance by 1, 2, 4, or 8 hours, 1 day, or 10 days. The clock handles festivals, Shieldmeet, and year changes, and saves the last valid time in the current browser.

The campaign starts in Neverwinter. Select Neverwinter or Phandalin to change locations while keeping the current date and time. The browser restores the selected location on reload.

## Planned additions

- Show Faerûnian time markers and seasonal sunrise and sunset estimates for the selected location.
- Describe current hourly weather using season, time of day, location, and recent conditions. A long jump or a correction back to an earlier hour should produce the same weather as visiting that hour in sequence.
- Restore the weather sequence alongside the saved time and location.
- Output a single line of plain text with the date, hour, time marker, and weather.

The first-release scope is one DM, one campaign, and the two campaign locations. Time advances by DM action. Daylight and weather serve session narration through campaign estimates.

See [Getting started](getting-started.md) for the repository’s current state, [Architecture](architecture.md) for the proposed design, and the [active roadmap](../roadmap/roadmap.json) for implementation order. The [campaign brief](../ROADMAP.md) preserves the original milestone descriptions and setting references.
