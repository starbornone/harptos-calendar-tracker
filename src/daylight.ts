import { getHarptosYearPosition, type HarptosDate } from "./harptos.ts";

const NOON = 12 * 60;

// Campaign estimates of the seasonal change in daylight on either side of noon.
const seasonalSwing = { neverwinter: 120, phandalin: 110 };

export function getSeasonalDaylight(date: HarptosDate, location: keyof typeof seasonalSwing) {
  const { dayIndex, yearLength } = getHarptosYearPosition(date);
  const { dayIndex: summer } = getHarptosYearPosition({ year: date.year, month: "Kythorn", day: 20 });
  const { dayIndex: winter } = getHarptosYearPosition({ year: date.year, month: "Nightal", day: 20 });
  const daysAfterSummer = (dayIndex - summer + yearLength) % yearLength;
  const summerToWinter = winter - summer;

  // Give each half of the curve its own length so Shieldmeet cannot shift a solstice.
  const seasonalAngle = daysAfterSummer <= summerToWinter
    ? Math.PI * daysAfterSummer / summerToWinter
    : Math.PI + Math.PI * (daysAfterSummer - summerToWinter) / (yearLength - summerToWinter);
  const halfDaylight = Math.round(NOON / 2 + seasonalSwing[location] * Math.cos(seasonalAngle));

  return { sunrise: NOON - halfDaylight, sunset: NOON + halfDaylight };
}
