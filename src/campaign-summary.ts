import { getHarptosYearTitle, type HarptosDateTime } from "./harptos.ts";
import { formatLocalizedDate, translate, type Locale } from "./localization.ts";
import type { getFaerunianTime } from "./time-markers.ts";
import type { getHourlyWeather } from "./weather.ts";

export function formatCampaignSummary(
  { date, hour }: HarptosDateTime,
  phase: ReturnType<typeof getFaerunianTime>["phase"],
  weather: ReturnType<typeof getHourlyWeather>,
  locale: Locale = "en",
): string {
  const yearTitle = getHarptosYearTitle(date.year);
  const dateLabel = formatLocalizedDate(date, locale);
  if (locale === "zh-Hans") {
    const titleSuffix = yearTitle ? `，${translate(locale, yearTitle)}` : "";
    return `${dateLabel}${titleSuffix} · ${hour}时（${translate(locale, phase)} · ${translate(locale, weather)}）`;
  }
  const titleSuffix = yearTitle ? `, ${yearTitle}` : "";
  return `${dateLabel}${titleSuffix} - Hour ${hour} (${phase} - ${weather})`;
}
