import { formatHarptosDate, getHarptosYearTitle, type HarptosDateTime } from "./harptos.ts";
import type { getFaerunianTime } from "./time-markers.ts";
import type { getHourlyWeather } from "./weather.ts";

export function formatCampaignSummary(
  { date, hour }: HarptosDateTime,
  phase: ReturnType<typeof getFaerunianTime>["phase"],
  weather: ReturnType<typeof getHourlyWeather>,
): string {
  const yearTitle = getHarptosYearTitle(date.year);
  const titleSuffix = yearTitle ? `, ${yearTitle}` : "";
  return `${formatHarptosDate(date)}${titleSuffix} - Hour ${hour} (${phase} - ${weather})`;
}
