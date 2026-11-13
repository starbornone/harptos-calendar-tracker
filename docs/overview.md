# Harptos Calendar Tracker

The Harptos Calendar Tracker is a single-screen tool for Dungeon Masters tracking one campaign across settings. During play it shows the current date and time, local light, and hourly weather.

The clock starts on **1 Tarsakh 1491 DR, Year of the Scarlet Witch**, at **08:00**. Set the date and time, including festival days, or advance by 1, 2, 4, or 8 hours, 1 day, or 10 days. The clock handles festivals, Shieldmeet, and year changes, and saves the last valid time in the current browser. The Harptos month view groups regular days by tenday, lists the festivals after that month, and highlights the campaign day.

The campaign starts in Neverwinter. The selector also offers Phandalin, Baldur’s Gate, Waterdeep, Halruaa, Sharn, Sigil, the Radiant Citadel, Bazzoxan, Kalaman, and Greyhawk. Changing locations keeps the campaign moment and displays its date in the selected location’s calendar. The browser restores the selected location on reload. If a save fails, the next successful edit saves the current tab’s full campaign. The clock shows the local light phase and a clock marker for every hour of the day.

The clock also shows an hourly weather condition. Weather follows local fronts of varying lengths, with fog near dawn, cloud as rain or snow moves in or out, and brief thunderstorms on warm afternoons. The saved campaign seed gives the same weather when you revisit an hour, skip ahead, or reload.

The **Campaign summary** is a selectable line of plain text with the date, year title when available, unpadded hour, current phase, and local weather. The copy icon puts the current line on the clipboard. The line updates with the clock or location.

**Share Campaign** creates a URL with the date, time, location, and weather seed. Opening the link shows a read-only preview with the same weather. **Adopt Shared Campaign** saves that moment and enables editing. Browsers that adopt the same link get the same weather whenever their campaign time and location match. **Back to Saved Campaign** resumes the browser’s existing campaign.

Time advances by DM action. The date editor uses the same calendar as the clock and summary. Sigil and the Radiant Citadel use a campaign day count. Daylight and weather are estimates for session narration. See the [local profiles](decisions.md#7-use-local-conditions-with-a-shared-campaign-clock).

The interface defaults to English and honors an existing Simplified Chinese preference. The campaign summary, footer disclaimer, and shared preview use the current language.

See [Getting started](getting-started.md) to run the tracker and repeat the mock session, [Architecture](architecture.md) for the design, and the [roadmap](../roadmap/roadmap.json) for release status. The [campaign brief](../ROADMAP.md) preserves the original milestone descriptions and setting references.
