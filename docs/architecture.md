# Architecture

Vite serves [index.html](../index.html) and bundles the TypeScript app. [src/main.tsx](../src/main.tsx) mounts the React screen. [src/App.tsx](../src/App.tsx) restores the clock from `localStorage` and saves it after a valid edit or advance. The [date editor](../src/components/clock-editor.tsx) and advance buttons use the same [Harptos calendar rules](../src/harptos.ts). The saved value is a count of elapsed minutes from 00:00 on 1 Hammer 1 DR, stored under the versioned key `harptos-calendar-tracker:clock:v1`. The calendar module is independent of the browser and supports positive DR years within the safe integer range of elapsed minutes.

The [campaign location selector](../src/App.tsx) stores `neverwinter` or `phandalin` under `harptos-calendar-tracker:location:v1`. The clock and location use separate keys so switching locations leaves the saved clock intact. A missing or unknown location defaults to Neverwinter and the saved time is restored independently.

[src/daylight.ts](../src/daylight.ts) uses the Harptos day index and year length to estimate sunrise and sunset as minutes after midnight. The date and location determine both values, so advancing within a single day keeps its estimates. The calendar index includes festival days and Shieldmeet.

[src/time-markers.ts](../src/time-markers.ts) combines the clock with those estimates to derive the current phase. It also looks up named markers by clock time. Both labels are recalculated from the clock and location on every change.

[src/weather.ts](../src/weather.ts) derives the hourly condition from the date, hour, location, and campaign seed. [src/main.tsx](../src/main.tsx) creates and saves the seed under `harptos-calendar-tracker:weather-seed:v1` on first load. If storage is unavailable, the model uses a fixed fallback seed.

```mermaid
flowchart LR
    Input[DM sets time, advances time, or selects a location] --> State[Campaign state]
    Harptos[Harptos calendar rules] --> State
    State --> Daylight[Daylight and time markers]
    State --> Weather[Hourly weather sequence]
    State --> Display[Campaign display]
    Daylight --> Display
    Weather --> Display
    State <--> Save[Browser-local save]
```

## Campaign state and derived views

- **Calendar and clock.** Convert between a Harptos date and a continuous measure of campaign time. Validate the requested date and time before updating state. Keep regular dates and intercalary festivals distinct when parsing and formatting. Day advances add 24 or 240 elapsed hours, including festival hours.
- **Daylight and phase.** Derive sunrise and sunset from the Harptos date and location, then combine them with the clock to find the current phase. Named clock markers use fixed times and can appear alongside the phase.
- **Weather.** Derive a weather-front roll from the seed and location. Reweight conditions by seasonal daylight and local hour, and check the preceding hour when a thunderstorm is possible. Direct jumps use the same sequence as hourly advances.
- **Display and save.** Present the clock, daylight, weather, and location controls together. Restore the seed alongside the clock and location to reconstruct the current conditions. [src/campaign-summary.ts](../src/campaign-summary.ts) formats the same date, hour, phase, and weather shown by the clock as a single plain-text line.

## How a change lands

For a calendar change, identify the affected date boundary and verify both direct entry and time advances across it. For a daylight or weather change, check its output on the same campaign date in both locations. For a display or save change, run the set-time, advance, and reload flow together. Capture behavior changes in the relevant [decision record](decisions.md) and move the [roadmap item](roadmap-format.md) in the same change as the implementation.
