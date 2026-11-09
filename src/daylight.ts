import { getHarptosYearPosition, type HarptosDate } from "./harptos.ts";
import { campaignLocations, type LocationId, type SolarDaylightProfile } from "./locations.ts";

const NOON = 12 * 60;

export function getSolarDaylight(date: HarptosDate, profile: SolarDaylightProfile) {
  const { dayIndex, yearLength } = getHarptosYearPosition(date);
  const { dayIndex: summer } = getHarptosYearPosition({ year: date.year, festival: "Midsummer" });
  const { dayIndex: winter } = getHarptosYearPosition({ year: date.year, festival: "Midwinter" });
  const daysAfterSummer = (dayIndex - summer + yearLength) % yearLength;
  const summerToWinter = yearLength - summer + winter;

  // Keep the seasonal extremes on their festivals in common and Shieldmeet years.
  const seasonalAngle = daysAfterSummer <= summerToWinter
    ? Math.PI * daysAfterSummer / summerToWinter
    : Math.PI + Math.PI * (daysAfterSummer - summerToWinter) / (yearLength - summerToWinter);
  const summerFraction = (1 + Math.cos(seasonalAngle)) / 2;
  const daylight = profile.winter + (profile.summer - profile.winter) * summerFraction;
  const halfDaylight = Math.round(daylight / 2);

  return { sunrise: NOON - halfDaylight, sunset: NOON + halfDaylight };
}

type LocalDaylight = ReturnType<typeof getSolarDaylight> | { peak: number; antipeak: number } | { steady: true };

export function getSeasonalDaylight(date: HarptosDate, location: LocationId | "halruaa"): LocalDaylight {
  if (location === "halruaa") return getSolarDaylight(date, { winter: 720, summer: 720 });

  const profile = campaignLocations[location];
  switch (profile.mode) {
    case "solar": return getSolarDaylight(date, profile.daylight);
    case "sigil": return { peak: NOON, antipeak: 0 };
    case "auroral": return { steady: true };
  }
}
