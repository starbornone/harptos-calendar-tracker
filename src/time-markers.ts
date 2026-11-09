import type { getSeasonalDaylight } from "./daylight.ts";
import type { HarptosDateTime } from "./harptos.ts";

const namedClockMarkers = [
  [5 * 60, "Foredawn"],
  [8 * 60, "Mornbright"],
  [10 * 60, "Midmorn"],
  [11 * 60, "High Morn"],
  [14 * 60, "Waterclock"],
  [17 * 60, "Time of Summer Sunset"],
  [18 * 60, "Twilight"],
] as const;

export function getFaerunianTime(
  { hour, minute }: Pick<HarptosDateTime, "hour" | "minute">,
  { sunrise, sunset }: ReturnType<typeof getSeasonalDaylight>,
) {
  const minutes = hour * 60 + minute;
  // Latest phase first. The fallback covers 00:00 through 00:29.
  const phaseStarts = [
    [23 * 60 + 30, "Midnight"],
    [sunset + 30, "Evening"],
    [sunset, "Sunset"],
    [sunset - 60, "Dusk"],
    [12 * 60 + 30, "Afternoon"],
    [11 * 60 + 30, "Highsun"],
    [sunrise + 30, "Morning"],
    [sunrise - 30, "Dawn"],
    [sunrise - 90, "Night's End"],
    [30, "Moondark"],
  ] as const;
  const phase = phaseStarts.find(([start]) => minutes >= start)?.[1] ?? "Midnight";
  const marker = namedClockMarkers.find(([center]) => minutes >= center - 15 && minutes < center + 15)?.[1] ?? null;

  return { phase, marker };
}
