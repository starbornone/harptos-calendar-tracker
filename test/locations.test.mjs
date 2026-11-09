import assert from "node:assert/strict";
import test from "node:test";
import { getSeasonalDaylight } from "../src/daylight.ts";
import {
  campaignLocations,
  locationIds,
  selectableLocationIds,
  usesHarptosCalendar,
  visibleLocationIds,
} from "../src/locations.ts";
import { getFaerunianTime } from "../src/time-markers.ts";
import { getHourlyWeather } from "../src/weather.ts";

const summer = { year: 1492, festival: "Midsummer" };
const winter = { year: 1492, festival: "Midwinter" };
const duration = ({ sunrise, sunset }) => sunset - sunrise;

test("normalizes Faerûn regions and hides non-Harptos calendars from the selector", () => {
  assert.deepEqual(selectableLocationIds, ["neverwinter", "phandalin", "baldurs-gate", "waterdeep"]);
  for (const id of selectableLocationIds) {
    assert.equal(campaignLocations[id].calendar, "harptos");
    assert.equal(campaignLocations[id].region, "Faerûn · Sword Coast");
  }
  for (const id of locationIds.filter((location) => !usesHarptosCalendar(location))) {
    assert.notEqual(campaignLocations[id].calendar, "harptos");
  }
  assert.deepEqual(visibleLocationIds("neverwinter"), selectableLocationIds);
  assert.deepEqual(visibleLocationIds("sharn"), ["sharn", ...selectableLocationIds]);
});

test("uses regional seasonal daylight and keeps Sharn close to twelve hours", () => {
  for (const id of ["baldurs-gate", "waterdeep", "bazzoxan", "kalaman", "greyhawk"]) {
    assert.ok(duration(getSeasonalDaylight(summer, id)) > duration(getSeasonalDaylight(winter, id)), id);
  }
  assert.ok(duration(getSeasonalDaylight(summer, "waterdeep")) > duration(getSeasonalDaylight(summer, "baldurs-gate")));
  for (const date of [summer, winter]) {
    assert.deepEqual(getSeasonalDaylight(date, "sharn"), { sunrise: 360, sunset: 1080 });
  }
});

test("uses planar light and weather without introducing solar events", () => {
  for (const date of [summer, winter]) {
    const sigil = getSeasonalDaylight(date, "sigil");
    assert.deepEqual(sigil, { peak: 720, antipeak: 0 });
    assert.equal(getFaerunianTime({ hour: 0, minute: 0 }, sigil).phase, "Antipeak");
    assert.equal(getFaerunianTime({ hour: 12, minute: 0 }, sigil).phase, "Peak");

    const citadel = getSeasonalDaylight(date, "radiant-citadel");
    assert.deepEqual(citadel, { steady: true });
    assert.deepEqual(getFaerunianTime({ hour: 8, minute: 0 }, citadel), { phase: "Steady Light", marker: "Mornbright" });
  }

  const time = { date: summer, hour: 12, minute: 0 };
  for (let seed = 0; seed < 32; seed++) {
    assert.ok(["Smog", "Fog", "Drizzle", "Clear Air"].includes(getHourlyWeather(time, "sigil", seed)));
    assert.ok(["Clear Air", "Ethereal Mist"].includes(getHourlyWeather(time, "radiant-citadel", seed)));
  }
});

test("distinguishes rainy Sharn from windier Bazzoxan in winter", () => {
  const time = { date: winter, hour: 12, minute: 0 };
  const sharn = [];
  const bazzoxan = [];
  for (let seed = 0; seed < 128; seed++) {
    sharn.push(getHourlyWeather(time, "sharn", seed));
    bazzoxan.push(getHourlyWeather(time, "bazzoxan", seed));
  }
  assert.ok(!sharn.includes("Snow"));
  assert.ok(bazzoxan.includes("Gusty Winds"));
  assert.ok(sharn.filter(condition => condition === "Rain").length > bazzoxan.filter(condition => condition === "Rain").length);
});
