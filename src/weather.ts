import { getSeasonalDaylight } from "./daylight.ts";
import { fromElapsedMinutes, toElapsedMinutes, type HarptosDateTime } from "./harptos.ts";

const profiles = {
  neverwinter: { fog: 18, rain: 19, snow: 5, salt: 0x9e37_79b9 },
  phandalin: { fog: 9, rain: 15, snow: 24, salt: 0x85eb_ca6b },
};

type WeatherLocation = keyof typeof profiles;
const HOURS_PER_FRONT = 6;
const UINT32_RANGE = 0x1_0000_0000;

function frontRoll(hour: number, seed: number, salt: number) {
  const offset = ((seed ^ salt) >>> 0) % HOURS_PER_FRONT;
  const front = Math.floor((hour + offset) / HOURS_PER_FRONT);
  // Mix the high bits too, since a Harptos hour can exceed the 32-bit range.
  let hash = seed ^ salt ^ front ^ Math.imul(Math.floor(front / UINT32_RANGE), 0x9e37_79b1);
  hash = Math.imul(hash ^ (hash >>> 16), 0x7feb_352d);
  hash = Math.imul(hash ^ (hash >>> 15), 0x846c_a68b);
  return ((hash ^ (hash >>> 16)) >>> 0) / UINT32_RANGE;
}

function pickCondition(dateTime: HarptosDateTime, hour: number, location: WeatherLocation, seed: number) {
  const profile = profiles[location];
  const { sunrise, sunset } = getSeasonalDaylight(dateTime.date, location);
  const warmth = (sunset - sunrise - 8 * 60) / (8 * 60);
  const nearDawn = Math.max(0, 1 - Math.abs(dateTime.hour * 60 - sunrise) / (3 * 60));
  const nearAfternoon = Math.max(0, 1 - Math.abs(dateTime.hour - 16) / 5);

  const weights = [
    ["Clear Skies", 27 + 14 * warmth],
    ["Fog", 2 + profile.fog * nearDawn],
    ["Overcast", 24 + 12 * (1 - warmth)],
    ["Rain", profile.rain + 5 * (1 - warmth)],
    ["Snow", profile.snow * Math.max(0, 1 - 2 * warmth)],
    ["Thunderstorm", warmth * (3 + 20 * nearAfternoon)],
  ] as const;

  let roll = frontRoll(hour, seed, profile.salt) * weights.reduce((total, [, weight]) => total + weight, 0);
  for (const [condition, weight] of weights) {
    if (roll < weight) return condition;
    roll -= weight;
  }
  return "Clear Skies";
}

export function getHourlyWeather(dateTime: HarptosDateTime, location: WeatherLocation, seed: number) {
  const hour = Math.floor(toElapsedMinutes(dateTime) / 60);
  const condition = pickCondition(dateTime, hour, location, seed);
  if (condition !== "Thunderstorm") return condition;
  if (hour === 0) return "Overcast";

  const previousTime = fromElapsedMinutes((hour - 1) * 60);
  const previous = pickCondition(previousTime, hour - 1, location, seed);
  // A previous storm candidate is either a storm or overcast, so both allow a storm now.
  return previous === "Overcast" || previous === "Rain" || previous === "Thunderstorm"
    ? "Thunderstorm"
    : "Overcast";
}
