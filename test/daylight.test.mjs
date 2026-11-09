import assert from "node:assert/strict";
import test from "node:test";
import { getSeasonalDaylight } from "../src/daylight.ts";
import { advanceHours } from "../src/harptos.ts";

test("uses each northern location's festival estimates in common and Shieldmeet years", () => {
  for (const year of [1491, 1492]) {
    const summer = { year, festival: "Midsummer" };
    const winter = { year, festival: "Midwinter" };
    assert.deepEqual(getSeasonalDaylight(summer, "neverwinter"), { sunrise: 240, sunset: 1200 });
    assert.deepEqual(getSeasonalDaylight(winter, "neverwinter"), { sunrise: 480, sunset: 960 });
    assert.deepEqual(getSeasonalDaylight(summer, "phandalin"), { sunrise: 250, sunset: 1190 });
    assert.deepEqual(getSeasonalDaylight(winter, "phandalin"), { sunrise: 480, sunset: 960 });
  }
});

test("keeps Halruaa at twelve hours of daylight through a Shieldmeet year", () => {
  let time = { date: { year: 1492, month: "Hammer", day: 1 }, hour: 0, minute: 0 };
  while (time.date.year === 1492) {
    assert.deepEqual(getSeasonalDaylight(time.date, "halruaa"), { sunrise: 360, sunset: 1080 });
    time = advanceHours(time, 24);
  }
});

test("lengthens daylight in spring and shortens it in autumn", () => {
  for (const location of ["neverwinter", "phandalin"]) {
    const earlierSpring = getSeasonalDaylight({ year: 1491, month: "Ches", day: 10 }, location);
    const laterSpring = getSeasonalDaylight({ year: 1491, month: "Tarsakh", day: 10 }, location);
    assert.ok(laterSpring.sunrise < earlierSpring.sunrise);
    assert.ok(laterSpring.sunset > earlierSpring.sunset);

    const earlierAutumn = getSeasonalDaylight({ year: 1491, month: "Eleint", day: 10 }, location);
    const laterAutumn = getSeasonalDaylight({ year: 1491, month: "Marpenoth", day: 10 }, location);
    assert.ok(laterAutumn.sunrise > earlierAutumn.sunrise);
    assert.ok(laterAutumn.sunset < earlierAutumn.sunset);
  }
});

test("keeps the seasonal curve continuous across festivals and the year boundary", () => {
  const dates = [
    { year: 1491, month: "Tarsakh", day: 30 },
    { year: 1491, festival: "Greengrass" },
    { year: 1492, festival: "Midsummer" },
    { year: 1492, festival: "Shieldmeet" },
    { year: 1492, month: "Nightal", day: 30 },
  ];

  for (const date of dates) {
    const tomorrow = advanceHours({ date, hour: 0, minute: 0 }, 24).date;
    const today = getSeasonalDaylight(date, "neverwinter");
    const next = getSeasonalDaylight(tomorrow, "neverwinter");
    assert.ok(Math.abs(next.sunrise - today.sunrise) <= 3);
    assert.ok(Math.abs(next.sunset - today.sunset) <= 3);
  }
});
