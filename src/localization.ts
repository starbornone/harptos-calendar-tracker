import { type HarptosDate } from "./harptos.ts";
import type { LocationId } from "./locations.ts";
import { translate, type Locale, type MessageId } from "./messages.ts";
import type { getFaerunianTime } from "./time-markers.ts";
import type { getHourlyWeather } from "./weather.ts";

export { translate, type Locale, type MessageId } from "./messages.ts";

export const calendarDateLabels = {
  "Hammer": "month.hammer",
  "Alturiak": "month.alturiak",
  "Ches": "month.ches",
  "Tarsakh": "month.tarsakh",
  "Mirtul": "month.mirtul",
  "Kythorn": "month.kythorn",
  "Flamerule": "month.flamerule",
  "Eleasis": "month.eleasis",
  "Eleint": "month.eleint",
  "Marpenoth": "month.marpenoth",
  "Uktar": "month.uktar",
  "Nightal": "month.nightal",
  "Midwinter": "festival.midwinter",
  "Greengrass": "festival.greengrass",
  "Midsummer": "festival.midsummer",
  "Shieldmeet": "festival.shieldmeet",
  "Highharvestide": "festival.highharvestide",
  "Feast of the Moon": "festival.feastOfTheMoon",
} as const satisfies Record<Extract<HarptosDate, { month: string }>["month"] | Extract<HarptosDate, { festival: string }>["festival"], MessageId>;

export const timeLabels = {
  "Sunset": "time.sunset",
  "Midnight": "time.midnight",
  "Moondark": "time.moondark",
  "Night's End": "time.nightsEnd",
  "Foredawn": "time.foredawn",
  "Dawn": "time.dawn",
  "Morning": "time.morning",
  "Mornbright": "time.mornbright",
  "Midmorn": "time.midmorn",
  "High Morn": "time.highMorn",
  "Highsun": "time.highsun",
  "Waterclock": "time.waterclock",
  "Afternoon": "time.afternoon",
  "Time of Summer Sunset": "time.summerSunset",
  "Twilight": "time.twilight",
  "Dusk": "time.dusk",
  "Evening": "time.evening",
  "Steady Light": "time.steady",
  "Peak": "time.peak",
  "Antipeak": "time.antipeak",
  "Brightening": "time.brightening",
  "Dimming": "time.dimming",
} as const satisfies Record<ReturnType<typeof getFaerunianTime>["phase" | "marker"], MessageId>;

export const weatherLabels = {
  "Clear Skies": "weather.clearSkies",
  "Partly Cloudy": "weather.partlyCloudy",
  "Fog": "weather.fog",
  "Overcast": "weather.overcast",
  "Rain": "weather.rain",
  "Snow": "weather.snow",
  "Gusty Winds": "weather.gustyWinds",
  "Thunderstorm": "weather.thunderstorm",
  "Smog": "weather.smog",
  "Drizzle": "weather.drizzle",
  "Clear Air": "weather.clearAir",
  "Ethereal Mist": "weather.etherealMist",
} as const satisfies Record<ReturnType<typeof getHourlyWeather>, MessageId>;

export const locationRegions = {
  "neverwinter": "region.swordCoast",
  "phandalin": "region.swordCoast",
  "baldurs-gate": "region.swordCoast",
  "waterdeep": "region.swordCoast",
  "sharn": "region.breland",
  "sigil": "region.outlands",
  "radiant-citadel": "region.deepEthereal",
  "bazzoxan": "region.xhorhas",
  "kalaman": "region.solamnia",
  "greyhawk": "region.flanaess",
} as const satisfies Record<LocationId, MessageId>;

export function formatLocalizedDate(date: HarptosDate, locale: Locale): string {
  const year = `${date.year} DR`;
  if ("festival" in date) {
    const festival = translate(locale, calendarDateLabels[date.festival]);
    return locale === "en" ? `${festival} ${year}` : `${year} ${festival}`;
  }
  const month = translate(locale, calendarDateLabels[date.month]);
  return locale === "en" ? `${date.day} ${month} ${year}` : `${year} ${month}${date.day}日`;
}
