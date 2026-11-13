const calendarErrors = {
  invalidSettingTime: "Enter a clock time from 00:00 to 23:59.",
  invalidSettingDay: "That day does not occur in the selected period.",
  invalidHarptosYear: "A Harptos year must be a positive integer in DR.",
  invalidShieldmeetYear: "Shieldmeet occurs only in years divisible by four, such as 1492 DR.",
  invalidHarptosDay: "That day or festival does not occur in the given Harptos year.",
  invalidHarptosTime: "Enter a Harptos clock time from 00:00 to 23:59.",
  clockOutOfRange: "The Harptos date is outside the supported range.",
  invalidAdvance: "Advance by a supported number of whole hours.",
} as const;

export class CalendarError extends RangeError {
  readonly code: keyof typeof calendarErrors;

  constructor(code: keyof typeof calendarErrors) {
    super(calendarErrors[code]);
    this.code = code;
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
  return year % YEARS_PER_CYCLE === 0 ? SHIELDMEET_YEAR : COMMON_YEAR;
}

export function getHarptosYearPosition(date: HarptosDate) {
  if (!Number.isSafeInteger(date.year) || date.year < 1) {
    throw new CalendarError("invalidHarptosYear");
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
      throw new CalendarError("invalidShieldmeetYear");
    }
    throw new CalendarError("invalidHarptosDay");
  }
  return { dayIndex, yearLength: yearDays.length };
}

export function getTenday(date: HarptosDate): number | null {
  getHarptosYearPosition(date);
  return "festival" in date ? null : Math.ceil(date.day / DAYS_PER_TENDAY);
}

export function getHarptosMonthView(date: HarptosDate) {
  const period = YEAR_LAYOUT.find(({ month, festivals }) =>
    "festival" in date
      ? (festivals as readonly HarptosFestival[]).includes(date.festival)
      : month === date.month,
  );
  if (!period) throw new Error("Missing Harptos month.");
  return {
    month: period.month,
    festivals: period.festivals.filter(
      (festival) => festival !== "Shieldmeet" || date.year % YEARS_PER_CYCLE === 0,
    ),
  };
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
    throw new CalendarError("invalidHarptosTime");
  }

  const yearsElapsed = date.year - 1;
  const daysElapsed =
    yearsElapsed * COMMON_YEAR.length + Math.floor(yearsElapsed / YEARS_PER_CYCLE) + dayIndex;
  const elapsedMinutes = daysElapsed * MINUTES_PER_DAY + hour * MINUTES_PER_HOUR + minute;
  if (!Number.isSafeInteger(elapsedMinutes)) {
    throw new CalendarError("clockOutOfRange");
  }
  return elapsedMinutes;
}

export function fromElapsedMinutes(elapsedMinutes: number): HarptosDateTime {
  if (!Number.isSafeInteger(elapsedMinutes) || elapsedMinutes < 0) {
    throw new CalendarError("clockOutOfRange");
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
    throw new CalendarError("invalidAdvance");
  }
  return fromElapsedMinutes(toElapsedMinutes(dateTime) + minutes);
}

export function formatHarptosDate(date: HarptosDate): string {
  const dayLabel = "festival" in date ? date.festival : `${date.day} ${date.month}`;
  return `${dayLabel} ${date.year} DR`;
}

export function getHarptosYearTitle(year: number) {
  return year === 1491 ? "Year of the Scarlet Witch" : null;
}

export function formatHarptosTime({ hour, minute }: Pick<HarptosDateTime, "hour" | "minute">): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
