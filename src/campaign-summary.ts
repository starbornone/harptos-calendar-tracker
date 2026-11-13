import { getHarptosYearTitle, type HarptosDateTime } from "./harptos.ts";
import { formatLocalizedDate, timeLabels, translate, weatherLabels, type Locale } from "./localization.ts";
import type { getFaerunianTime } from "./time-markers.ts";
import type { getHourlyWeather } from "./weather.ts";

export function formatCampaignSummary(
  { date, hour }: HarptosDateTime,
  phase: ReturnType<typeof getFaerunianTime>["phase"],
  weather: ReturnType<typeof getHourlyWeather>,
  locale: Locale = "en",
): string {
  const yearTitle = getHarptosYearTitle(date.year, locale);
  const dateLabel = formatLocalizedDate(date, locale);
  const phaseLabel = translate(locale, timeLabels[phase]);
  const weatherLabel = translate(locale, weatherLabels[weather]);
  if (locale === "zh-Hans") {
    const titleSuffix = yearTitle ? `，${yearTitle}` : "";
    return `${dateLabel}${titleSuffix} · ${hour}时（${phaseLabel} · ${weatherLabel}）`;
  }
  const titleSuffix = yearTitle ? `, ${yearTitle}` : "";
  return `${dateLabel}${titleSuffix} - Hour ${hour} (${phaseLabel} - ${weatherLabel})`;
}
