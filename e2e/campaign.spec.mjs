import { expect, test } from "@playwright/test";
import { toElapsedMinutes } from "../src/harptos.ts";

const campaignKey = "harptos-calendar-tracker:campaign:v1";
const time = toElapsedMinutes({ date: { year: 1492, festival: "Shieldmeet" }, hour: 23, minute: 47 });
const shared = `/?view=ledger&share=1&time=${time}&location=waterdeep&seed=42#clock-heading`;

test("the visible Harptos month follows clock edits and festival advances on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const month = page.locator(".month-panel");
  const currentDate = month.locator('[aria-current="date"]');
  await expect(month.getByRole("list", { name: "First tenday" }).getByRole("listitem")).toHaveCount(10);
  await expect(currentDate).toContainText("1 Tarsakh 1491 DR");
  await page.getByRole("button", { name: "Set Current Time" }).click();
  await page.getByLabel("Year (DR)").fill("1492");
  await page.getByLabel("Month or festival").selectOption("Flamerule");
  await page.getByLabel("Day of month").fill("30");
  await page.getByLabel("Time (24-hour)").fill("23:00");
  await page.getByRole("button", { name: "Set Time", exact: true }).click();
  await expect(currentDate).toContainText("30 Flamerule 1492 DR");
  await page.getByRole("button", { name: "+1 hour", exact: true }).click();
  await expect(currentDate).toHaveText("Midsummer");
  await page.getByRole("button", { name: "+1 day", exact: true }).click();
  await expect(currentDate).toHaveText("Shieldmeet");
  await page.getByRole("button", { name: "+1 day", exact: true }).click();
  await expect(currentDate).toContainText("1 Eleasis 1492 DR");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});

test("a local calendar edit survives advancing, sharing, and switching settings", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Sharn" }).check();
  await expect(page.locator(".clock-date")).toHaveText("1 Zarantyr 998 YK");
  await page.getByRole("button", { name: "Set Current Time" }).click();
  await page.getByLabel("Month or festival week").selectOption("Vult");
  await page.getByLabel("Day", { exact: true }).fill("28");
  await page.getByLabel("Time (24-hour)").fill("23:00");
  await page.getByRole("button", { name: "Set Time", exact: true }).click();
  await page.getByRole("button", { name: "+1 hour", exact: true }).click();
  await expect(page.locator(".clock-date")).toHaveText("1 Zarantyr 999 YK");
  await expect(page.getByRole("textbox", { name: "Campaign summary" })).toHaveValue(
    /^1 Zarantyr 999 YK - Hour 0/,
  );
  await page.getByRole("button", { name: "Share Campaign" }).click();
  const link = await page.getByRole("textbox", { name: "Share link" }).inputValue();
  await page.getByRole("radio", { name: "Neverwinter" }).check();
  await expect(page.locator(".clock-date")).toHaveText(/1492 DR$/);
  await page.goto(link);
  await expect(page.locator(".clock-date")).toHaveText("1 Zarantyr 999 YK");
  await expect(page.getByRole("radio", { name: "Sharn" })).toBeChecked();
});

test("preview keeps the local save until adoption and restores the adopted moment on reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Phandalin" }).check();
  const saved = await page.evaluate((key) => localStorage.getItem(key), campaignKey);
  await page.goto(shared);
  await expect(page.getByRole("heading", { name: "Shared campaign preview" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Set Current Time" })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Waterdeep" })).toBeDisabled();
  await expect(page.getByText("Shieldmeet 1492 DR", { exact: true })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), campaignKey)).toBe(saved);

  await page.getByRole("button", { name: "Adopt Shared Campaign" }).click();
  await expect(page).toHaveURL(/\/\?view=ledger#clock-heading$/);
  await expect(page.getByRole("button", { name: "Set Current Time" })).toBeEnabled();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), campaignKey)).toEqual({
    time,
    location: "waterdeep",
    seed: 42,
  });
  await page.reload();
  await expect(page.getByRole("radio", { name: "Waterdeep" })).toBeChecked();
  await expect(page.getByText("23:47", { exact: true })).toBeVisible();
});

test("back to saved campaign and invalid links restore the local moment", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "+1 hour", exact: true }).click();
  await page.goto(shared);
  await page.getByRole("button", { name: "Back to Saved Campaign" }).click();
  await expect(page).toHaveURL(/\/\?view=ledger#clock-heading$/);
  await expect(page.getByText("09:00", { exact: true })).toBeVisible();
  await page.goto("/?share=2");
  await expect(
    page.getByText("This share link is invalid or unsupported. Showing your local campaign."),
  ).toBeVisible();
  await expect(page.getByText("09:00", { exact: true })).toBeVisible();
});

test("clipboard errors leave the summary and share link available to copy manually", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("Clipboard unavailable")) },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Copy campaign summary" }).click();
  await expect(page.getByText("Select the campaign summary field and copy it manually.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Campaign summary" })).toHaveValue(/1 Tarsakh 1491 DR/);
  await page.getByRole("button", { name: "Share Campaign" }).click();
  await page.getByRole("button", { name: "Copy Link" }).click();
  await expect(page.getByText("Select the share link field and copy it manually.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Share link" })).toHaveValue(
    /share=1.*location=neverwinter/,
  );
});

test("the next successful edit saves the clock and location after a failed write", async ({ page }) => {
  await page.goto("/");
  const original = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), campaignKey);
  await page.evaluate(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      Storage.prototype.setItem = originalSetItem;
      throw new DOMException("Storage full", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "+1 hour", exact: true }).click();
  await expect(
    page.getByText("Campaign updated for this tab. Your browser could not save it for reload."),
  ).toBeVisible();
  await expect(page.getByText("09:00", { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "Phandalin" }).check();
  await page.reload();
  await expect(page.getByRole("radio", { name: "Phandalin" })).toBeChecked();
  await expect(page.getByText("09:00", { exact: true })).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), campaignKey)).toEqual({
    time: original.time + 60,
    location: "phandalin",
    seed: original.seed,
  });
});
