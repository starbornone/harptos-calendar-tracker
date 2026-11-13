import { expect, test } from "@playwright/test";

test("follows clock edits and advances through Midsummer and Shieldmeet", async ({ page }) => {
  await page.goto("/");
  const calendar = page.getByRole("region", { name: "Harptos calendar" });
  const currentDay = calendar.locator('[aria-current="date"]');
  await expect(calendar.getByRole("heading", { name: "Tarsakh 1491 DR" })).toBeVisible();
  await expect(calendar.getByRole("heading", { name: /^Tenday [123]$/ })).toHaveCount(3);
  await expect(calendar.getByRole("listitem")).toHaveCount(31);
  await expect(calendar.getByText("Greengrass")).toBeVisible();
  await expect(currentDay).toHaveAccessibleName("1 Tarsakh 1491 DR");

  async function setFlamerule(year: string) {
    await page.getByRole("button", { name: "Set Current Time" }).click();
    const editor = page.getByRole("dialog", { name: "Set Current Time" });
    await editor.getByLabel("Year (DR)").fill(year);
    await editor.getByLabel("Month or festival").selectOption("Flamerule");
    await editor.getByLabel("Day of month").fill("30");
    await editor.getByLabel("Time (24-hour)").fill("23:00");
    await editor.getByRole("button", { name: "Set Time" }).click();
  }

  await setFlamerule("1491");
  await expect(calendar.getByRole("heading", { name: "Flamerule 1491 DR" })).toBeVisible();
  await expect(calendar.getByText("Midsummer")).toBeVisible();
  await expect(calendar.getByText("Shieldmeet")).toHaveCount(0);

  await setFlamerule("1492");
  await expect(calendar.getByRole("heading", { name: "Flamerule 1492 DR" })).toBeVisible();
  await expect(calendar.getByText("Shieldmeet")).toBeVisible();
  await expect(currentDay).toHaveAccessibleName("30 Flamerule 1492 DR");

  await page.getByRole("button", { name: "+1 hour", exact: true }).click();
  await expect(currentDay).toHaveText("Midsummer");
  await page.getByRole("button", { name: "+1 day", exact: true }).click();
  await expect(currentDay).toHaveText("Shieldmeet");
  await page.getByRole("button", { name: "+1 day", exact: true }).click();
  await expect(calendar.getByRole("heading", { name: "Eleasis 1492 DR" })).toBeVisible();
  await expect(currentDay).toHaveAccessibleName("1 Eleasis 1492 DR");
});
