import assert from "node:assert/strict";
import test from "node:test";
import { getSeasonalDaylight } from "../src/daylight.ts";
import { getFaerunianTime } from "../src/time-markers.ts";

const summer = { year: 1491, festival: "Midsummer" };
const winter = { year: 1491, festival: "Midwinter" };
const summerDaylight = getSeasonalDaylight(summer, "neverwinter");

test("covers all ten phases and switches at their boundaries", () => {
  const cases = [
    [0, 0, "Midnight"],
    [0, 29, "Midnight"],
    [0, 30, "Moondark"],
    [2, 29, "Moondark"],
    [2, 30, "Night's End"],
    [3, 29, "Night's End"],
    [3, 30, "Dawn"],
    [4, 29, "Dawn"],
    [4, 30, "Morning"],
    [11, 29, "Morning"],
    [11, 30, "Highsun"],
    [12, 29, "Highsun"],
    [12, 30, "Afternoon"],
    [18, 59, "Afternoon"],
    [19, 0, "Dusk"],
    [19, 59, "Dusk"],
    [20, 0, "Sunset"],
    [20, 29, "Sunset"],
    [20, 30, "Evening"],
    [23, 29, "Evening"],
    [23, 30, "Midnight"],
  ];
  for (const [hour, minute, expected] of cases) {
    assert.equal(getFaerunianTime({ hour, minute }, summerDaylight).phase, expected, `${hour}:${minute}`);
  }
});

test("recalculates dawn, dusk, and evening with the location and season", () => {
  const phandalin = getSeasonalDaylight(summer, "phandalin");
  const cases = [
    [4, 30, "Morning", "Dawn"],
    [18, 55, "Afternoon", "Dusk"],
    [20, 25, "Sunset", "Evening"],
  ];
  for (const [hour, minute, neverwinterPhase, phandalinPhase] of cases) {
    assert.equal(getFaerunianTime({ hour, minute }, summerDaylight).phase, neverwinterPhase);
    assert.equal(getFaerunianTime({ hour, minute }, phandalin).phase, phandalinPhase);
  }

  const winterDaylight = getSeasonalDaylight(winter, "neverwinter");
  const time = { hour: 7, minute: 45 };
  assert.equal(getFaerunianTime(time, summerDaylight).phase, "Morning");
  assert.equal(getFaerunianTime(time, winterDaylight).phase, "Dawn");
});

test("covers every minute with a clock marker independent of solar phases", () => {
  const winterDaylight = getSeasonalDaylight(winter, "neverwinter");
  const cases = [
    [0, 0, "Midnight"],
    [5, 59, "Foredawn"],
    [6, 0, "Morning"],
    [8, 15, "Mornbright"],
    [8, 59, "Mornbright"],
    [9, 0, "Midmorn"],
    [12, 0, "Highsun"],
    [14, 30, "Waterclock"],
    [15, 0, "Afternoon"],
    [17, 29, "Time of Summer Sunset"],
    [17, 30, "Twilight"],
    [18, 30, "Evening"],
    [23, 30, "Midnight"],
  ];
  for (const [hour, minute, expected] of cases) {
    assert.equal(getFaerunianTime({ hour, minute }, summerDaylight).marker, expected);
  }
  for (let minutes = 0; minutes < 24 * 60; minutes++) {
    const time = { hour: Math.floor(minutes / 60), minute: minutes % 60 };
    const { marker } = getFaerunianTime(time, summerDaylight);
    assert.ok(marker);
    assert.equal(getFaerunianTime(time, winterDaylight).marker, marker);
  }
  assert.deepEqual(getFaerunianTime({ hour: 17, minute: 0 }, winterDaylight), {
    phase: "Evening",
    marker: "Time of Summer Sunset",
  });
});
