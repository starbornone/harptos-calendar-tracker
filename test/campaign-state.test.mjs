import assert from "node:assert/strict";
import test from "node:test";
import {
  clearShareUrl,
  loadSavedCampaign,
  makeShareUrl,
  readSharedCampaign,
  saveCampaign,
  updateSavedCampaign,
} from "../src/campaign-state.ts";
import { advanceHours, CAMPAIGN_START, fromElapsedMinutes, toElapsedMinutes } from "../src/harptos.ts";
import { getHourlyWeather } from "../src/weather.ts";

const moment = {
  dateTime: { date: { year: 1492, festival: "Shieldmeet" }, hour: 23, minute: 47 },
  locationId: "radiant-citadel",
  weatherSeed: 0xffff_ffff,
};

test("share URLs round-trip festival dates, minutes, location, and seeded weather", () => {
  const page = new URL("https://tracker.example/ledger/?view=table#clock-heading");
  const link = new URL(makeShareUrl(page, moment));
  assert.equal(link.pathname, page.pathname);
  assert.equal(link.hash, page.hash);
  assert.equal(link.searchParams.get("view"), "table");
  assert.equal(link.searchParams.get("share"), "1");
  assert.deepEqual(readSharedCampaign(link), { status: "valid", campaign: moment });
  const { campaign } = readSharedCampaign(link);
  assert.equal(
    getHourlyWeather(campaign.dateTime, campaign.locationId, campaign.weatherSeed),
    getHourlyWeather(moment.dateTime, moment.locationId, moment.weatherSeed),
  );
  assert.equal(clearShareUrl(link).href, page.href);
  assert.deepEqual(readSharedCampaign(page), { status: "absent" });
});

test("share URLs accept both endpoints of the supported clock range and seed zero", () => {
  for (const minutes of [0, Number.MAX_SAFE_INTEGER]) {
    const campaign = { ...moment, dateTime: fromElapsedMinutes(minutes), weatherSeed: 0 };
    const url = new URL(makeShareUrl(new URL("https://tracker.example/"), campaign));
    assert.deepEqual(readSharedCampaign(url), { status: "valid", campaign });
  }
});

test("a shared weather seed reproduces future conditions after adoption and reload", () => {
  const sender = { ...moment, locationId: "waterdeep", weatherSeed: 329 };
  const link = new URL(makeShareUrl(new URL("https://tracker.example/"), sender));
  const shared = readSharedCampaign(link);
  assert.equal(shared.status, "valid");
  const entries = new Map();
  const storage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
  saveCampaign({ ...sender, weatherSeed: 42 }, storage);
  saveCampaign(shared.campaign, storage);
  const recipient = loadSavedCampaign(storage).campaign;
  const weather = ({ dateTime, locationId, weatherSeed }) =>
    getHourlyWeather(dateTime, locationId, weatherSeed);
  const conditions = new Set();
  for (let hours = 1; hours <= 240; hours++) {
    const fromSender = weather({ ...sender, dateTime: advanceHours(sender.dateTime, hours) });
    recipient.dateTime = advanceHours(recipient.dateTime, 1);
    assert.equal(weather(recipient), fromSender, `hour ${hours}`);
    conditions.add(fromSender);
  }
  assert.ok(conditions.size > 1);
});

test("share URLs reject incomplete, ambiguous, or out-of-range snapshots", () => {
  const page = new URL("https://tracker.example/");
  for (const [key, value] of [
    ["share", "2"],
    ["time", "-1"],
    ["time", "1e6"],
    ["time", "9007199254740992"],
    ["location", "constructor"],
    ["seed", "4294967296"],
    ["seed", "3.5"],
    ["seed", " "],
  ]) {
    const link = new URL(makeShareUrl(page, moment));
    link.searchParams.set(key, value);
    assert.deepEqual(readSharedCampaign(link), { status: "invalid" }, `${key}=${value}`);
  }
  for (const key of ["time", "location", "seed"]) {
    const link = new URL(makeShareUrl(page, moment));
    link.searchParams.append(key, link.searchParams.get(key));
    assert.deepEqual(readSharedCampaign(link), { status: "invalid" });
    link.searchParams.delete(key);
    assert.deepEqual(readSharedCampaign(link), { status: "invalid" });
  }
});

test("saved campaigns restore legacy values and replace all fields together on adoption", () => {
  const legacy = { dateTime: CAMPAIGN_START, locationId: "phandalin", weatherSeed: 42 };
  const entries = new Map([
    ["harptos-calendar-tracker:clock:v1", String(toElapsedMinutes(legacy.dateTime))],
    ["harptos-calendar-tracker:location:v1", legacy.locationId],
    ["harptos-calendar-tracker:weather-seed:v1", String(legacy.weatherSeed)],
  ]);
  const storage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
  assert.deepEqual(loadSavedCampaign(storage), { campaign: legacy, notice: "" });
  assert.equal(entries.size, 3);

  saveCampaign(moment, storage);
  assert.equal(entries.size, 4);
  assert.deepEqual(loadSavedCampaign(storage), { campaign: moment, notice: "" });

  const updated = updateSavedCampaign(moment, { locationId: "sigil" }, storage);
  assert.deepEqual(updated, { ...moment, locationId: "sigil" });
  assert.deepEqual(loadSavedCampaign(storage).campaign, updated);
});
