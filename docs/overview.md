# Harptos Calendar Tracker

The Harptos Calendar Tracker is planned as a single-screen tool for Dungeon Masters running a Forgotten Realms campaign around Neverwinter and Phandalin. It answers three questions during play. What is the in-world date and time, how much daylight is left, and what weather should the party encounter?

The campaign starts on **1 Tarsakh 1491 DR, Year of the Scarlet Witch**. The first-run proposal is **08:00 in Neverwinter**, with an editable campaign clock. The repository currently contains planning documentation. The controls and displays described here are planned capabilities.

## What the tracker will do

- Set the current Harptos date and time or advance by 1, 2, 4, or 8 hours, 1 day, or 10 days. The clock handles festival days, Shieldmeet, and year changes.
- Show a numeric clock, Faerûnian time markers, and seasonal sunrise and sunset estimates for the selected campaign location.
- Describe current hourly weather using season, time of day, location, and recent conditions. A long jump or a correction back to an earlier hour should produce the same weather as visiting that hour in sequence.
- Resume one campaign from the same browser with its clock, location, and weather sequence intact.

The first-release scope is one DM, one campaign, and the two campaign locations. Time advances by DM action. Daylight and weather serve session narration through campaign estimates.

See [Getting started](getting-started.md) for the repository’s current state, [Architecture](architecture.md) for the proposed design, and the [active roadmap](../roadmap/roadmap.json) for implementation order. The [campaign brief](../ROADMAP.md) preserves the original milestone descriptions and setting references.
