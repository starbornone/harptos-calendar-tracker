import type { getSeasonalDaylight } from "./daylight.ts";
import type { HarptosDateTime } from "./harptos.ts";

// Descending start times. Each marker runs until the next one begins.
const clockMarkerStarts = [
  [23 * 60 + 30, "Midnight"],
  [18 * 60 + 30, "Evening"],
  [17 * 60 + 30, "Twilight"],
  [16 * 60 + 30, "Time of Summer Sunset"],
  [15 * 60, "Afternoon"],
  [12 * 60 + 30, "Waterclock"],
  [11 * 60 + 30, "Highsun"],
  [10 * 60 + 30, "High Morn"],
  [9 * 60, "Midmorn"],
  [7 * 60 + 30, "Mornbright"],
  [6 * 60, "Morning"],
  [4 * 60 + 30, "Foredawn"],
  [3 * 60 + 30, "Night's End"],
  [30, "Moondark"],
  [0, "Midnight"],
] as const;

export function getFaerunianTime(
  { hour, minute }: Pick<HarptosDateTime, "hour" | "minute">,
  daylight: ReturnType<typeof getSeasonalDaylight>,
) {
  const minutes = hour * 60 + minute;
  const marker = clockMarkerStarts.find(([start]) => minutes >= start)?.[1] ?? "Midnight";

  if ("steady" in daylight) return { phase: "Steady Light", marker } as const;
  if ("peak" in daylight) {
    const { peak, antipeak } = daylight;
    if (minutes < antipeak + 30 || minutes >= antipeak + 24 * 60 - 30)
      return { phase: "Antipeak", marker } as const;
    if (minutes < peak - 30) return { phase: "Brightening", marker } as const;
    if (minutes < peak + 30) return { phase: "Peak", marker } as const;
    return { phase: "Dimming", marker } as const;
  }

  const { sunrise, sunset } = daylight;
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
  return { phase, marker };
}
