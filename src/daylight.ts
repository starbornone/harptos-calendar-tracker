import { getHarptosYearPosition, toElapsedMinutes, type HarptosDate } from "./harptos.ts";
import {
  campaignLocations,
  type CampaignCalendar,
  type LocationId,
  type SolarDaylightProfile,
} from "./locations.ts";
import { getSettingSeason } from "./setting-calendars.ts";

const NOON = 12 * 60;

function getHarptosSeason(date: HarptosDate) {
  return {
    ...getHarptosYearPosition(date),
    summer: getHarptosYearPosition({ year: date.year, festival: "Midsummer" }).dayIndex,
    winter: getHarptosYearPosition({ year: date.year, festival: "Midwinter" }).dayIndex,
  };
}

export function getSolarDaylight(
  date: HarptosDate,
  profile: SolarDaylightProfile,
  calendar: CampaignCalendar = "harptos",
) {
  const localSeason =
    calendar === "harptos"
      ? undefined
      : getSettingSeason(calendar, toElapsedMinutes({ date, hour: 0, minute: 0 }));
  const { dayIndex, yearLength, summer, winter } = localSeason ?? getHarptosSeason(date);
  const daysAfterSummer = (dayIndex - summer + yearLength) % yearLength;
  const summerToWinter = (winter - summer + yearLength) % yearLength;

  // Keep the seasonal extremes on their festivals in common and Shieldmeet years.
  const seasonalAngle =
    daysAfterSummer <= summerToWinter
      ? (Math.PI * daysAfterSummer) / summerToWinter
      : Math.PI + (Math.PI * (daysAfterSummer - summerToWinter)) / (yearLength - summerToWinter);
  const summerFraction = (1 + Math.cos(seasonalAngle)) / 2;
  const daylight = profile.winter + (profile.summer - profile.winter) * summerFraction;
  const halfDaylight = Math.round(daylight / 2);

  return { sunrise: NOON - halfDaylight, sunset: NOON + halfDaylight };
}

type LocalDaylight =
  | ReturnType<typeof getSolarDaylight>
  | { peak: number; antipeak: number }
  | { steady: true };

export function getSeasonalDaylight(date: HarptosDate, location: LocationId): LocalDaylight {
  const profile = campaignLocations[location];
  switch (profile.mode) {
    case "solar":
      return getSolarDaylight(date, profile.daylight, profile.calendar);
    case "sigil":
      return { peak: NOON, antipeak: 0 };
    case "auroral":
      return { steady: true };
  }
}
