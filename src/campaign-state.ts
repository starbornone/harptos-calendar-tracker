import type { MessageId } from "./localization.ts";
import { CAMPAIGN_START, fromElapsedMinutes, toElapsedMinutes, type HarptosDateTime } from "./harptos.ts";
import { locationIds, type LocationId } from "./locations.ts";

export type CampaignState = {
  dateTime: HarptosDateTime;
  locationId: LocationId;
  weatherSeed: number;
};

export type CampaignView = {
  campaign: CampaignState;
  notice: MessageId | "";
};

const defaultCampaign: CampaignState = {
  dateTime: CAMPAIGN_START,
  locationId: "neverwinter",
  weatherSeed: 0,
};

const campaignKey = "harptos-calendar-tracker:campaign:v1";
const legacyClockKey = "harptos-calendar-tracker:clock:v1";
const legacyLocationKey = "harptos-calendar-tracker:location:v1";
const legacySeedKey = "harptos-calendar-tracker:weather-seed:v1";
const shareParams = ["share", "time", "location", "seed"] as const;

type CampaignStorage = Pick<Storage, "getItem" | "setItem">;

function readUnsignedInteger(value: unknown, max = Number.MAX_SAFE_INTEGER): number | undefined {
  const number = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  return typeof number === "number" && Number.isSafeInteger(number) && number >= 0 && number <= max
    ? number
    : undefined;
}

function readLocation(value: unknown): LocationId | undefined {
  return locationIds.find((id) => id === value);
}

function readCampaign(time: unknown, location: unknown, seed: unknown): CampaignState | undefined {
  const minutes = readUnsignedInteger(time);
  const locationId = readLocation(location);
  const weatherSeed = readUnsignedInteger(seed, 0xffff_ffff);
  if (minutes === undefined || locationId === undefined || weatherSeed === undefined) return undefined;
  return { dateTime: fromElapsedMinutes(minutes), locationId, weatherSeed };
}

export function readSharedCampaign(url: URL) {
  const query = url.searchParams;
  if (!query.has("share")) return { status: "absent" } as const;
  if (query.get("share") !== "1" || shareParams.some((key) => query.getAll(key).length !== 1)) {
    return { status: "invalid" } as const;
  }
  const campaign = readCampaign(query.get("time"), query.get("location"), query.get("seed"));
  return campaign ? ({ status: "valid", campaign } as const) : ({ status: "invalid" } as const);
}

export function makeShareUrl(url: URL, campaign: CampaignState): string {
  const link = new URL(url);
  link.searchParams.set("share", "1");
  link.searchParams.set("time", String(toElapsedMinutes(campaign.dateTime)));
  link.searchParams.set("location", campaign.locationId);
  link.searchParams.set("seed", String(campaign.weatherSeed));
  return link.href;
}

export function clearShareUrl(url: URL): URL {
  const link = new URL(url);
  for (const param of shareParams) link.searchParams.delete(param);
  return link;
}

function readSavedSnapshot(storage: CampaignStorage): CampaignState | undefined {
  const saved = storage.getItem(campaignKey);
  if (saved === null) return undefined;
  try {
    const snapshot = JSON.parse(saved);
    return readCampaign(snapshot?.time, snapshot?.location, snapshot?.seed);
  } catch {
    return undefined;
  }
}

export function saveCampaign(campaign: CampaignState, storage: CampaignStorage = localStorage): void {
  storage.setItem(
    campaignKey,
    JSON.stringify({
      time: toElapsedMinutes(campaign.dateTime),
      location: campaign.locationId,
      seed: campaign.weatherSeed,
    }),
  );
}

export function updateSavedCampaign(
  current: CampaignState,
  change: Partial<Pick<CampaignState, "dateTime" | "locationId">>,
  storage: CampaignStorage = localStorage,
): CampaignState {
  const next = { ...current, ...change };
  saveCampaign(next, storage);
  return next;
}

export function loadSavedCampaign(storage?: CampaignStorage): CampaignView {
  try {
    storage ??= localStorage;
    const saved = readSavedSnapshot(storage);
    if (saved) return { campaign: saved, notice: "" };

    const clock = storage.getItem(legacyClockKey);
    const minutes = readUnsignedInteger(clock);
    const locationId = readLocation(storage.getItem(legacyLocationKey)) ?? defaultCampaign.locationId;
    const savedSeed = readUnsignedInteger(storage.getItem(legacySeedKey), 0xffff_ffff);
    const campaign = {
      dateTime: minutes === undefined ? defaultCampaign.dateTime : fromElapsedMinutes(minutes),
      locationId,
      weatherSeed: savedSeed ?? crypto.getRandomValues(new Uint32Array(1))[0],
    };
    let notice: CampaignView["notice"] = clock !== null && minutes === undefined ? "invalidSavedClock" : "";
    if (savedSeed === undefined) {
      try {
        saveCampaign(campaign, storage);
      } catch {
        campaign.weatherSeed = defaultCampaign.weatherSeed;
        notice = "initialSaveFailure";
      }
    }
    return { campaign, notice };
  } catch {
    return { campaign: defaultCampaign, notice: "restoreFailure" };
  }
}
