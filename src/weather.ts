import { getSolarDaylight } from "./daylight.ts";
import { fromElapsedMinutes, toElapsedMinutes, type HarptosDateTime } from "./harptos.ts";
import { campaignLocations, type CampaignLocation, type LocationId } from "./locations.ts";

const SURFACE_FRONT_HOURS = 9;
const PLANAR_FRONT_HOURS = 6;
const UINT32_RANGE = 0x1_0000_0000;

type SurfaceLocation = Extract<CampaignLocation, { mode: "solar" }>;

function hashRoll(hash: number) {
  hash = Math.imul(hash ^ (hash >>> 16), 0x7feb_352d);
  hash = Math.imul(hash ^ (hash >>> 15), 0x846c_a68b);
  return ((hash ^ (hash >>> 16)) >>> 0) / UINT32_RANGE;
}

function seededRoll(index: number, seed: number, salt: number) {
  // Mix both halves of the index independently from the seed and the event salt.
  const low = Math.imul(index, 0x9e37_79b1);
  const high = Math.imul(Math.floor(index / UINT32_RANGE), 0x85eb_ca6b);
  return hashRoll(low ^ high ^ Math.imul(seed, 0xc2b2_ae35) ^ salt);
}

function weightedCondition<Condition extends string>(weights: readonly (readonly [Condition, number])[], fraction: number) {
  let roll = fraction * weights.reduce((total, [, weight]) => total + weight, 0);
  for (const [condition, weight] of weights) {
    if (roll < weight) return condition;
    roll -= weight;
  }
  return weights[0][0];
}

function frontStart(index: number, seed: number, salt: number) {
  if (index === 0) return 0;
  // Offset each boundary by up to six hours, giving fronts of 3–15 hours.
  return index * SURFACE_FRONT_HOURS + Math.floor(7 * seededRoll(index, seed, salt ^ 0x35ae_c621));
}

function surfaceFront(index: number, settings: SurfaceLocation, seed: number) {
  const { rain, snow, wind = 0, warmth: fixedWarmth, salt } = settings.weather;
  const start = frontStart(index, seed, salt);
  const { date } = fromElapsedMinutes(start * 60);
  const { sunrise, sunset } = getSolarDaylight(date, settings.daylight);
  const warmth = fixedWarmth ?? (sunset - sunrise - 8 * 60) / (8 * 60);
  // Several nearby fronts share a wetter or drier spell.
  const wetness = 0.55 + seededRoll(Math.floor(start / 36), seed, salt ^ 0x7c10_f435);
  const weights = [
    ["Clear Skies", 24 + 12 * warmth],
    ["Partly Cloudy", 19],
    ["Overcast", 19 + 8 * (1 - warmth)],
    ["Rain", (rain + 4 * (1 - warmth)) * wetness],
    ["Snow", snow * Math.max(0, 1 - 2 * warmth) * wetness],
    ["Gusty Winds", wind],
  ] as const;
  return { start, warmth, condition: weightedCondition(weights, seededRoll(index, seed, salt)) };
}

function isWetFront(condition: string | undefined) {
  return condition === "Rain" || condition === "Snow";
}

export function getHourlyWeather(dateTime: HarptosDateTime, location: LocationId, seed: number) {
  const hour = Math.floor(toElapsedMinutes(dateTime) / 60);
  const settings: CampaignLocation = campaignLocations[location];
  const { salt } = settings.weather;
  if (settings.mode !== "solar") {
    const offset = ((seed ^ salt) >>> 0) % PLANAR_FRONT_HOURS;
    const front = Math.floor((hour + offset) / PLANAR_FRONT_HOURS);
    const roll = hashRoll(seed ^ salt ^ front ^ Math.imul(Math.floor(front / UINT32_RANGE), 0x9e37_79b1));
    return weightedCondition(settings.weather.conditions, roll);
  }

  const slot = Math.floor(hour / SURFACE_FRONT_HOURS);
  const index = hour < frontStart(slot, seed, salt) ? slot - 1 : slot;
  const { start, warmth, condition } = surfaceFront(index, settings, seed);
  const hoursIntoFront = hour - start;
  if (hoursIntoFront < 2) {
    const previous = index > 0 ? surfaceFront(index - 1, settings, seed).condition : undefined;
    if (previous !== condition) {
      if (hoursIntoFront === 0 && (isWetFront(previous) || isWetFront(condition))) return "Overcast";
      if (hoursIntoFront === 1 && condition === "Rain") return "Drizzle";
    }
  }

  const day = Math.floor(hour / 24);
  if (condition === "Clear Skies" || condition === "Partly Cloudy") {
    const { sunrise } = getSolarDaylight(dateTime.date, settings.daylight);
    const minutesFromSunrise = dateTime.hour * 60 - sunrise;
    if (minutesFromSunrise >= -90 && minutesFromSunrise < 75 &&
        seededRoll(day, seed, salt ^ 0xa09b_5271) < settings.weather.fog / 36) {
      return "Fog";
    }
  }

  if (condition === "Rain" && hoursIntoFront >= 3 &&
      seededRoll(day, seed, salt ^ 0xe347_12b9) < 0.85 * Math.max(0, warmth - 0.35)) {
    const stormStart = 13 + Math.floor(6 * seededRoll(day, seed, salt ^ 0x4ad8_207e));
    const stormLength = 1 + Math.floor(3 * seededRoll(day, seed, salt ^ 0x81b3_de64));
    if (dateTime.hour >= stormStart && dateTime.hour < stormStart + stormLength) return "Thunderstorm";
  }

  return condition;
}
