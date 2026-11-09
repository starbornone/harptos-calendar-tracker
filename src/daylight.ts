import { getHarptosYearPosition, type HarptosDate } from "./harptos.ts";

const NOON = 12 * 60;

// Minutes of daylight at the campaign's seasonal extremes.
const daylightProfiles = {
  neverwinter: { winter: 8 * 60, summer: 16 * 60 },
  phandalin: { winter: 8 * 60, summer: 15 * 60 + 40 },
  halruaa: { winter: 12 * 60, summer: 12 * 60 },
};

export function getSeasonalDaylight(date: HarptosDate, location: keyof typeof daylightProfiles) {
  const { dayIndex, yearLength } = getHarptosYearPosition(date);
  const { dayIndex: summer } = getHarptosYearPosition({ year: date.year, festival: "Midsummer" });
  const { dayIndex: winter } = getHarptosYearPosition({ year: date.year, festival: "Midwinter" });
  const daysAfterSummer = (dayIndex - summer + yearLength) % yearLength;
  const summerToWinter = yearLength - summer + winter;

  // Keep the seasonal extremes on their festivals in common and Shieldmeet years.
  const seasonalAngle = daysAfterSummer <= summerToWinter
    ? Math.PI * daysAfterSummer / summerToWinter
    : Math.PI + Math.PI * (daysAfterSummer - summerToWinter) / (yearLength - summerToWinter);
  const profile = daylightProfiles[location];
  const summerFraction = (1 + Math.cos(seasonalAngle)) / 2;
  const daylight = profile.winter + (profile.summer - profile.winter) * summerFraction;
  const halfDaylight = Math.round(daylight / 2);

  return { sunrise: NOON - halfDaylight, sunset: NOON + halfDaylight };
}
