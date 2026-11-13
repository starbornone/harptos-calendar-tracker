import assert from "node:assert/strict";
import test from "node:test";
import { getSeasonalDaylight } from "../src/daylight.ts";
import { advanceHours, CAMPAIGN_START, fromElapsedMinutes, toElapsedMinutes } from "../src/harptos.ts";
import { getSettingDate, toSettingDateTime } from "../src/setting-calendars.ts";

const start = toElapsedMinutes(CAMPAIGN_START);
const settings = [
  ["galifar", "Zarantyr", 998, "Vult", 28, 336],
  ["exandrian", "Horisal", 836, "Duscar", 32, 328],
  ["krynn", "Newkolt", 351, "Frostkolt", 28, 336],
  ["greyhawk", "Needfest", 576, "Sunsebb", 28, 364],
];

test("setting calendars cross month, festival week, and year boundaries", () => {
  for (const [calendar, first, year, last, lastDay, length] of settings) {
    assert.deepEqual(getSettingDate(calendar, start), { year, period: first, day: 1 });
    assert.deepEqual(getSettingDate(calendar, start - 1440), { year: year - 1, period: last, day: lastDay });
    assert.deepEqual(getSettingDate(calendar, start + length * 1440), {
      year: year + 1,
      period: first,
      day: 1,
    });
  }
  assert.deepEqual(getSettingDate("greyhawk", start + 7 * 1440), { year: 576, period: "Fireseek", day: 1 });
  assert.deepEqual(getSettingDate("exandrian", start + 29 * 1440), { year: 836, period: "Misuthar", day: 1 });
  assert.throws(
    () => toSettingDateTime("galifar", { year: 998, period: "Zarantyr", day: 29, hour: 0, minute: 0 }),
    RangeError,
  );
});

test("all settings round-trip the full supported clock range", () => {
  for (const calendar of [...settings.map(([id]) => id), "sigil", "radiant"]) {
    for (const elapsed of [0, start - 1440, start, start + 1440, Number.MAX_SAFE_INTEGER]) {
      const { hour, minute } = fromElapsedMinutes(elapsed);
      const localDate = getSettingDate(calendar, elapsed);
      assert.equal(
        toElapsedMinutes(toSettingDateTime(calendar, { ...localDate, hour, minute })),
        elapsed,
        calendar,
      );
    }
  }
});

test("solar daylight follows the local seasonal anchors", () => {
  for (const [location, winter, summer, shortDay, longDay] of [
    ["bazzoxan", 315, 145, 580, 860],
    ["kalaman", 0, 168, 540, 900],
    ["greyhawk", 3, 185, 570, 870],
  ]) {
    for (const [offset, expected] of [
      [winter, shortDay],
      [summer, longDay],
    ]) {
      const date = advanceHours(CAMPAIGN_START, offset * 24).date;
      const { sunrise, sunset } = getSeasonalDaylight(date, location);
      assert.equal(sunset - sunrise, expected, location);
    }
  }
});
