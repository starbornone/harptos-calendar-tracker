import assert from "node:assert/strict";
import test from "node:test";
import {
  CAMPAIGN_START,
  advanceHours,
  formatHarptosDate,
  fromElapsedMinutes,
  getTenday,
  toElapsedMinutes,
} from "../src/harptos.ts";

test("uses the campaign date and initial hour", () => {
  assert.equal(formatHarptosDate(CAMPAIGN_START.date), "1 Tarsakh 1491 DR");
  assert.equal(CAMPAIGN_START.hour, 8);
  assert.equal(CAMPAIGN_START.minute, 0);
});

test("crosses the five annual festivals at midnight", () => {
  const transitions = [
    ["Hammer", "Midwinter", "Alturiak"],
    ["Tarsakh", "Greengrass", "Mirtul"],
    ["Flamerule", "Midsummer", "Eleasis"],
    ["Eleint", "Highharvestide", "Marpenoth"],
    ["Uktar", "Feast of the Moon", "Nightal"],
  ];

  for (const [month, festival, nextMonth] of transitions) {
    const before = { date: { year: 1491, month, day: 30 }, hour: 23, minute: 0 };
    const festivalStart = advanceHours(before, 1);
    assert.deepEqual(festivalStart, { date: { year: 1491, festival }, hour: 0, minute: 0 });
    assert.equal(formatHarptosDate(festivalStart.date), `${festival} 1491 DR`);
    assert.deepEqual(advanceHours(festivalStart, 24), {
      date: { year: 1491, month: nextMonth, day: 1 },
      hour: 0,
      minute: 0,
    });
  }
});

test("inserts Shieldmeet after Midsummer in 1492 DR", () => {
  const midsummer = { date: { year: 1492, festival: "Midsummer" }, hour: 23, minute: 0 };
  const shieldmeet = advanceHours(midsummer, 1);
  assert.deepEqual(shieldmeet, { date: { year: 1492, festival: "Shieldmeet" }, hour: 0, minute: 0 });
  assert.deepEqual(advanceHours(shieldmeet, 24), {
    date: { year: 1492, month: "Eleasis", day: 1 },
    hour: 0,
    minute: 0,
  });
  assert.deepEqual(advanceHours(shieldmeet, -1), midsummer);
});

test("rolls from Nightal to Hammer in both year lengths", () => {
  for (const year of [1491, 1492]) {
    const lastHour = { date: { year, month: "Nightal", day: 30 }, hour: 23, minute: 59 };
    assert.deepEqual(advanceHours(lastHour, 1), {
      date: { year: year + 1, month: "Hammer", day: 1 },
      hour: 0,
      minute: 59,
    });
  }
});

test("includes festivals in elapsed-day jumps and preserves the clock time", () => {
  const before = { date: { year: 1491, month: "Tarsakh", day: 25 }, hour: 13, minute: 37 };
  assert.deepEqual(advanceHours(before, 240), {
    date: { year: 1491, month: "Mirtul", day: 4 },
    hour: 13,
    minute: 37,
  });
});

test("assigns three tendays to each month and leaves festivals between them", () => {
  for (const [day, tenday] of [
    [1, 1],
    [10, 1],
    [11, 2],
    [20, 2],
    [21, 3],
    [30, 3],
  ]) {
    assert.equal(getTenday({ year: 1491, month: "Tarsakh", day }), tenday);
  }
  assert.equal(getTenday({ year: 1491, festival: "Greengrass" }), null);
});

test("round-trips every day in a four-year cycle", () => {
  const start = toElapsedMinutes({ date: { year: 1489, month: "Hammer", day: 1 }, hour: 0, minute: 0 });
  const end = toElapsedMinutes({ date: { year: 1493, month: "Hammer", day: 1 }, hour: 0, minute: 0 });
  assert.equal(end - start, 1461 * 1440);
  for (let minute = start; minute < end; minute += 1440) {
    assert.equal(toElapsedMinutes(fromElapsedMinutes(minute)), minute);
  }
  assert.equal(toElapsedMinutes(fromElapsedMinutes(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER);
});

test("rejects invalid calendar dates, clock times, and elapsed inputs", () => {
  const invalidDates = [
    { year: 1491, festival: "Shieldmeet" },
    { year: 1491, month: "Tarsakh", day: 31 },
    { year: 1491, month: "Tarsakh", day: 0 },
    { year: 0, month: "Hammer", day: 1 },
  ];
  for (const date of invalidDates) {
    assert.throws(() => toElapsedMinutes({ ...CAMPAIGN_START, date }), RangeError);
  }
  assert.throws(() => toElapsedMinutes({ ...CAMPAIGN_START, hour: 24 }), RangeError);
  assert.throws(() => toElapsedMinutes({ ...CAMPAIGN_START, minute: 60 }), RangeError);
  assert.throws(() => fromElapsedMinutes(-1), RangeError);
  assert.throws(() => fromElapsedMinutes(1.5), RangeError);
  assert.throws(() => advanceHours(CAMPAIGN_START, 1.5), RangeError);
  assert.throws(() => advanceHours(fromElapsedMinutes(0), -1), RangeError);
});
