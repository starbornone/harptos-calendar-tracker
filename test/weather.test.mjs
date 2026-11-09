import assert from "node:assert/strict";
import test from "node:test";
import { advanceHours, fromElapsedMinutes } from "../src/harptos.ts";
import { getHourlyWeather } from "../src/weather.ts";

const summer = { year: 1492, month: "Kythorn", day: 20 };
const winter = { year: 1492, month: "Nightal", day: 20 };
const locations = ["neverwinter", "phandalin"];

function countCondition(condition, date, hour, location) {
  let count = 0;
  for (let seed = 0; seed < 512; seed++) {
    if (getHourlyWeather({ date, hour, minute: 0 }, location, seed) === condition) count++;
  }
  return count;
}

test("weights winter snow more heavily in Phandalin and favors dawn fog and afternoon storms", () => {
  const neverwinterSnow = countCondition("Snow", winter, 12, "neverwinter");
  const phandalinSnow = countCondition("Snow", winter, 12, "phandalin");
  assert.ok(neverwinterSnow > 0 && phandalinSnow > neverwinterSnow);
  assert.equal(countCondition("Snow", summer, 12, "phandalin"), 0);

  for (const location of locations) {
    assert.ok(countCondition("Fog", summer, 4, location) > countCondition("Fog", summer, 16, location));
    const afternoonStorms = countCondition("Thunderstorm", summer, 16, location);
    assert.ok(afternoonStorms > countCondition("Thunderstorm", summer, 4, location));
    assert.ok(afternoonStorms > countCondition("Thunderstorm", winter, 16, location));
  }
});

test("keeps each location's hourly weather stable through jumps and revisits", () => {
  const start = { date: { year: 1492, month: "Flamerule", day: 30 }, hour: 17, minute: 0 };
  for (const location of locations) {
    const weatherAt = (dateTime) => getHourlyWeather(dateTime, location, 329);
    const original = weatherAt(start);
    assert.equal(weatherAt({ ...start, minute: 59 }), original);

    for (const jump of [8, 240]) {
      const direct = weatherAt(advanceHours(start, jump));
      let stepped = start;
      let condition = original;
      for (let hour = 0; hour < jump; hour++) {
        stepped = advanceHours(stepped, 1);
        condition = weatherAt(stepped);
      }
      assert.equal(condition, direct);
      assert.equal(weatherAt(advanceHours(stepped, -jump)), original);
    }
  }
});

test("makes thunderstorms follow cloud, rain, or an ongoing storm", () => {
  let stormHours = 0;
  for (const location of locations) {
    for (let seed = 0; seed < 12; seed++) {
      let dateTime = { date: summer, hour: 0, minute: 0 };
      let previous = getHourlyWeather(dateTime, location, seed);
      for (let hour = 0; hour < 240; hour++) {
        dateTime = advanceHours(dateTime, 1);
        const condition = getHourlyWeather(dateTime, location, seed);
        if (condition === "Thunderstorm") {
          stormHours++;
          assert.ok(["Overcast", "Rain", "Thunderstorm"].includes(previous), `Storm followed ${previous}`);
        }
        previous = condition;
      }
    }
  }
  assert.ok(stormHours > 0);
});

test("calculates weather at either end of the supported timeline", () => {
  for (const elapsed of [0, Number.MAX_SAFE_INTEGER]) {
    const weather = getHourlyWeather(fromElapsedMinutes(elapsed), "phandalin", 1234);
    assert.ok(["Clear Skies", "Fog", "Overcast", "Rain", "Snow", "Thunderstorm"].includes(weather));
  }
});
