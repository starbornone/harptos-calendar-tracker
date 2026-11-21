import { translate, type Locale, type MessageId } from "./messages.ts";

export class HarptosRangeError extends RangeError {
  readonly messageId: Extract<MessageId, `calendar.error${string}`>;

  constructor(messageId: HarptosRangeError["messageId"]) {
    super(translate("en", messageId));
    this.messageId = messageId;
  }
}

const DAYS_PER_MONTH = 30;
const DAYS_PER_TENDAY = 10;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;
const YEARS_PER_CYCLE = 4;

const YEAR_LAYOUT = [
  { month: "Hammer", festivals: ["Midwinter"] },
  { month: "Alturiak", festivals: [] },
  { month: "Ches", festivals: [] },
  { month: "Tarsakh", festivals: ["Greengrass"] },
  { month: "Mirtul", festivals: [] },
  { month: "Kythorn", festivals: [] },
  { month: "Flamerule", festivals: ["Midsummer", "Shieldmeet"] },
  { month: "Eleasis", festivals: [] },
  { month: "Eleint", festivals: ["Highharvestide"] },
  { month: "Marpenoth", festivals: [] },
  { month: "Uktar", festivals: ["Feast of the Moon"] },
  { month: "Nightal", festivals: [] },
] as const;

type HarptosMonth = (typeof YEAR_LAYOUT)[number]["month"];
type HarptosFestival = (typeof YEAR_LAYOUT)[number]["festivals"][number];
type CalendarDay = { month: HarptosMonth; day: number } | { festival: HarptosFestival };

export const HARPTOS_MONTHS = YEAR_LAYOUT.map(({ month }) => month);
export const HARPTOS_FESTIVALS = YEAR_LAYOUT.flatMap<HarptosFestival>(({ festivals }) => festivals);

export type HarptosDate = { year: number } & CalendarDay;
export type HarptosDateTime = { date: HarptosDate; hour: number; minute: number };

export const CAMPAIGN_START: HarptosDateTime = {
  date: { year: 1491, month: "Tarsakh", day: 1 },
  hour: 8,
  minute: 0,
};

function buildYear(includeShieldmeet: boolean): CalendarDay[] {
  const days: CalendarDay[] = [];
  for (const { month, festivals } of YEAR_LAYOUT) {
    for (let day = 1; day <= DAYS_PER_MONTH; day++) {
      days.push({ month, day });
    }
    for (const festival of festivals) {
      if (festival !== "Shieldmeet" || includeShieldmeet) {
        days.push({ festival });
      }
    }
  }
  return days;
}

const COMMON_YEAR = buildYear(false);
const SHIELDMEET_YEAR = buildYear(true);
const DAYS_PER_CYCLE = COMMON_YEAR.length * (YEARS_PER_CYCLE - 1) + SHIELDMEET_YEAR.length;

function daysInYear(year: number): CalendarDay[] {
  return hasShieldmeet(year) ? SHIELDMEET_YEAR : COMMON_YEAR;
}

function hasShieldmeet(year: number): boolean {
  return year % YEARS_PER_CYCLE === 0;
}

export function getHarptosYearPosition(date: HarptosDate) {
  if (!Number.isSafeInteger(date.year) || date.year < 1) {
    throw new HarptosRangeError("calendar.errorYear");
  }

  const yearDays = daysInYear(date.year);
  const dayIndex = yearDays.findIndex((day) => {
    if ("festival" in date) {
      return "festival" in day && day.festival === date.festival;
    }
    return "month" in day && day.month === date.month && day.day === date.day;
  });
  if (dayIndex === -1) {
    if ("festival" in date && date.festival === "Shieldmeet") {
      throw new HarptosRangeError("calendar.errorShieldmeet");
    }
    throw new HarptosRangeError("calendar.errorDay");
  }
  return { dayIndex, yearLength: yearDays.length };
}

export function getTenday(date: HarptosDate): number | null {
  getHarptosYearPosition(date);
  return "festival" in date ? null : Math.ceil(date.day / DAYS_PER_TENDAY);
}

export function getHarptosMonthView(date: HarptosDate) {
  // Festival days belong to the view for the month immediately before them.
  const period = YEAR_LAYOUT.find(
    ({ month, festivals }: { month: HarptosMonth; festivals: readonly HarptosFestival[] }) =>
      "festival" in date ? festivals.includes(date.festival) : month === date.month,
  );
  if (!period) throw new RangeError("Unknown Harptos month or festival.");

  const tendays = Array.from({ length: DAYS_PER_MONTH / DAYS_PER_TENDAY }, (_, index) =>
    Array.from({ length: DAYS_PER_TENDAY }, (_, day) => index * DAYS_PER_TENDAY + day + 1),
  );
  const festivals = period.festivals.filter(
    (festival) => festival !== "Shieldmeet" || hasShieldmeet(date.year),
  );
  return { month: period.month, tendays, festivals };
}

// Count elapsed minutes from 00:00 on 1 Hammer 1 DR.
export function toElapsedMinutes({ date, hour, minute }: HarptosDateTime): number {
  const { dayIndex } = getHarptosYearPosition(date);
  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour >= HOURS_PER_DAY ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute >= MINUTES_PER_HOUR
  ) {
    throw new HarptosRangeError("calendar.errorTime");
  }

  const yearsElapsed = date.year - 1;
  const daysElapsed =
    yearsElapsed * COMMON_YEAR.length + Math.floor(yearsElapsed / YEARS_PER_CYCLE) + dayIndex;
  const elapsedMinutes = daysElapsed * MINUTES_PER_DAY + hour * MINUTES_PER_HOUR + minute;
  if (!Number.isSafeInteger(elapsedMinutes)) {
    throw new HarptosRangeError("calendar.errorRange");
  }
  return elapsedMinutes;
}

export function fromElapsedMinutes(elapsedMinutes: number): HarptosDateTime {
  if (!Number.isSafeInteger(elapsedMinutes) || elapsedMinutes < 0) {
    throw new HarptosRangeError("calendar.errorRange");
  }

  const daysElapsed = Math.floor(elapsedMinutes / MINUTES_PER_DAY);
  const minutesToday = elapsedMinutes % MINUTES_PER_DAY;
  const cycle = Math.floor(daysElapsed / DAYS_PER_CYCLE);
  const dayOfCycle = daysElapsed % DAYS_PER_CYCLE;
  // Each cycle ends with the longer Shieldmeet year.
  const yearOfCycle = Math.min(Math.floor(dayOfCycle / COMMON_YEAR.length), YEARS_PER_CYCLE - 1);
  const year = cycle * YEARS_PER_CYCLE + yearOfCycle + 1;
  const day = daysInYear(year)[dayOfCycle - yearOfCycle * COMMON_YEAR.length];

  return {
    date: { year, ...day },
    hour: Math.floor(minutesToday / MINUTES_PER_HOUR),
    minute: minutesToday % MINUTES_PER_HOUR,
  };
}

export function advanceHours(dateTime: HarptosDateTime, hours: number): HarptosDateTime {
  const minutes = hours * MINUTES_PER_HOUR;
  if (!Number.isSafeInteger(hours) || !Number.isSafeInteger(minutes)) {
    throw new HarptosRangeError("calendar.errorAdvance");
  }
  return fromElapsedMinutes(toElapsedMinutes(dateTime) + minutes);
}

export function formatHarptosDate(date: HarptosDate): string {
  const dayLabel = "festival" in date ? date.festival : `${date.day} ${date.month}`;
  return `${dayLabel} ${date.year} DR`;
}

export function getHarptosYearTitle(year: number, locale: Locale = "en"): string | null {
  return year === 1491 ? translate(locale, "calendar.yearScarletWitch") : null;
}

export function formatHarptosTime({ hour, minute }: Pick<HarptosDateTime, "hour" | "minute">): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
