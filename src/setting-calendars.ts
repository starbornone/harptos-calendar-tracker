import { CalendarError, CAMPAIGN_START, fromElapsedMinutes, toElapsedMinutes } from "./harptos.ts";
import type { CampaignCalendar } from "./locations.ts";

type Period = readonly [name: string, days: number];
type Calendar = { era: string; periods: readonly Period[]; startYear: number };

function months(names: string, days: number): Period[] {
  return names.split(" ").map((name) => [name, days]);
}

const calendars = {
  galifar: {
    era: "YK",
    startYear: 998,
    periods: months(
      "Zarantyr Olarune Therendor Eyre Dravago Nymm Lharvion Barrakas Rhaan Sypheros Aryth Vult",
      28,
    ),
  },
  exandrian: {
    era: "PD",
    startYear: 836,
    periods: [
      ["Horisal", 29],
      ["Misuthar", 30],
      ["Dualahei", 30],
      ["Thunsheer", 31],
      ["Unndilar", 28],
      ["Brussendar", 31],
      ["Sydenstar", 32],
      ["Fessuran", 29],
      ["Quen’pillar", 27],
      ["Cuersaar", 29],
      ["Duscar", 32],
    ],
  },
  krynn: {
    era: "AC",
    startYear: 351,
    periods: months(
      "Newkolt Deepkolt Brookgreen Yurthgreen Fleurgreen Holmswelth Fierswelt Paleswelt Reapember Gildember Darkember Frostkolt",
      28,
    ),
  },
  greyhawk: {
    era: "CY",
    startYear: 576,
    periods: [
      ["Needfest", 7],
      ...months("Fireseek Readying Coldeven", 28),
      ["Growfest", 7],
      ...months("Planting Flocktime Wealsun", 28),
      ["Richfest", 7],
      ...months("Reaping Goodmonth Harvester", 28),
      ["Brewfest", 7],
      ...months("Patchwall Ready’reat Sunsebb", 28),
    ],
  },
} as const satisfies Record<string, Calendar>;

type DatedCalendar = keyof typeof calendars;
export type OtherCalendar = Exclude<CampaignCalendar, "harptos">;
const MINUTES_PER_DAY = 1440;
const campaignStartDay = Math.floor(toElapsedMinutes(CAMPAIGN_START) / MINUTES_PER_DAY);

export function getSettingCalendar(calendar: OtherCalendar): Calendar | undefined {
  return calendar === "sigil" || calendar === "radiant" ? undefined : calendars[calendar];
}

function yearLength(calendar: Calendar) {
  return calendar.periods.reduce((total, [, days]) => total + days, 0);
}

export function getSettingDate(calendar: OtherCalendar, elapsedMinutes: number) {
  const elapsedDay = Math.floor(elapsedMinutes / MINUTES_PER_DAY);
  const days = elapsedDay - campaignStartDay;
  const definition = getSettingCalendar(calendar);
  if (!definition) return { year: 1, period: "", day: days + 1 };

  const length = yearLength(definition);
  const years = Math.floor(days / length);
  let day = days - years * length + 1;
  for (const [period, count] of definition.periods) {
    if (day <= count) return { year: definition.startYear + years, period, day };
    day -= count;
  }
  throw new Error("Missing setting calendar period.");
}

export function toSettingDateTime(
  calendar: OtherCalendar,
  { year, period, day, hour, minute }: ReturnType<typeof getSettingDate> & { hour: number; minute: number },
) {
  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    throw new CalendarError("invalidSettingTime");
  }
  if (!Number.isSafeInteger(day)) throw new CalendarError("invalidSettingDay");

  let elapsedDay = day - 1;
  const definition = getSettingCalendar(calendar);
  if (definition) {
    if (!Number.isSafeInteger(year)) throw new CalendarError("clockOutOfRange");
    const index = definition.periods.findIndex(([name]) => name === period);
    if (index < 0 || day < 1 || day > definition.periods[index][1]) {
      throw new CalendarError("invalidSettingDay");
    }
    const daysBeforePeriod = definition.periods
      .slice(0, index)
      .reduce((total, [, count]) => total + count, 0);
    elapsedDay +=
      campaignStartDay + (year - definition.startYear) * yearLength(definition) + daysBeforePeriod;
  } else elapsedDay += campaignStartDay;
  return fromElapsedMinutes(elapsedDay * MINUTES_PER_DAY + hour * 60 + minute);
}

// Seasonal anchors are measured from the first day of the local calendar year.
const seasonalDays: Record<DatedCalendar, { winter: number; summer: number }> = {
  galifar: { winter: 0, summer: 168 },
  exandrian: { winter: 315, summer: 145 },
  krynn: { winter: 0, summer: 168 },
  greyhawk: { winter: 3, summer: 185 },
};

export function getSettingSeason(calendar: CampaignCalendar, elapsedMinutes: number) {
  if (calendar === "harptos" || calendar === "sigil" || calendar === "radiant") return undefined;
  const definition = calendars[calendar];
  const length = yearLength(definition);
  const days = Math.floor(elapsedMinutes / MINUTES_PER_DAY) - campaignStartDay;
  return { dayIndex: ((days % length) + length) % length, yearLength: length, ...seasonalDays[calendar] };
}
