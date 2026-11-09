import assert from "node:assert/strict";
import test from "node:test";
import { formatCampaignSummary } from "../src/campaign-summary.ts";

test("matches the agreed one-line format with an unpadded hour", () => {
  const time = { date: { year: 1491, month: "Tarsakh", day: 1 }, hour: 6, minute: 0 };
  assert.equal(
    formatCampaignSummary(time, "Night's End", "Clear Skies"),
    "1 Tarsakh 1491 DR, Year of the Scarlet Witch - Hour 6 (Night's End - Clear Skies)",
  );
});

test("formats a festival at midnight and omits the comma when the year title is unavailable", () => {
  const time = { date: { year: 1492, festival: "Shieldmeet" }, hour: 0, minute: 35 };
  assert.equal(formatCampaignSummary(time, "Moondark", "Rain"), "Shieldmeet 1492 DR - Hour 0 (Moondark - Rain)");
});

test("formats Chinese summaries for months and festivals with the DR abbreviation", () => {
  const time = { date: { year: 1491, month: "Tarsakh", day: 1 }, hour: 8, minute: 0 };
  assert.equal(
    formatCampaignSummary(time, "Morning", "Clear Skies", "zh-Hans"),
    "1491 DR 塔萨克月1日，绯红女巫之年 · 8时（早晨 · 晴空）",
  );
  const festival = { date: { year: 1492, festival: "Shieldmeet" }, hour: 0, minute: 35 };
  assert.equal(
    formatCampaignSummary(festival, "Moondark", "Rain", "zh-Hans"),
    "1492 DR 盾会节 · 0时（月隐 · 雨）",
  );
});
