import { getHarptosYearTitle, type HarptosDateTime } from "./harptos.ts";
import { formatCampaignDate, translate, type Locale } from "./localization.ts";
import type { CampaignCalendar } from "./locations.ts";
import type { getFaerunianTime } from "./time-markers.ts";
import type { getHourlyWeather } from "./weather.ts";

export function formatCampaignSummary(
  dateTime: HarptosDateTime,
  phase: ReturnType<typeof getFaerunianTime>["phase"],
  weather: ReturnType<typeof getHourlyWeather>,
  locale: Locale = "en",
  calendar: CampaignCalendar = "harptos",
): string {
  const { date, hour } = dateTime;
  const yearTitle = calendar === "harptos" ? getHarptosYearTitle(date.year) : null;
  const dateLabel = formatCampaignDate(dateTime, calendar, locale);
  if (locale === "zh-Hans") {
    const titleSuffix = yearTitle ? `，${translate(locale, yearTitle)}` : "";
    return `${dateLabel}${titleSuffix} · ${hour}时（${translate(locale, phase)} · ${translate(locale, weather)}）`;
  }
  const titleSuffix = yearTitle ? `, ${yearTitle}` : "";
  return `${dateLabel}${titleSuffix} - Hour ${hour} (${phase} - ${weather})`;
}
