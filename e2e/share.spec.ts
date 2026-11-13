import { expect, test } from "@playwright/test";
import { makeShareUrl } from "../src/campaign-state.ts";
import { advanceHours, CAMPAIGN_START } from "../src/harptos.ts";

const returnPath = "/?view=table#clock-heading";

function sharedLink(baseURL: string | undefined) {
  return makeShareUrl(new URL(returnPath, baseURL), {
    dateTime: advanceHours(CAMPAIGN_START, 6),
    locationId: "waterdeep",
    weatherSeed: 42,
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "+1 hour" }).click();
  await expect(page.locator(".clock-time")).toHaveText("09:00");
});

test("previews the shared campaign without replacing the saved campaign", async ({ page, baseURL }) => {
  const url = sharedLink(baseURL);
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "Shared campaign preview" })).toBeVisible();
  await expect(page.locator(".clock-time")).toHaveText("14:00");
  const waterdeep = page.getByRole("radio", { name: "Waterdeep" });
  await expect(waterdeep).toBeChecked();
  await expect(waterdeep).toBeDisabled();
  await expect(page.getByRole("button", { name: "+1 hour" })).toBeHidden();

  await page.getByRole("button", { name: "Back to Saved Campaign" }).click();
  await expect(page).toHaveURL(new URL(returnPath, baseURL).href);
  await expect(page.getByRole("heading", { name: "Shared campaign preview" })).toBeHidden();
  await expect(page.locator(".clock-time")).toHaveText("09:00");
  await expect(page.getByRole("radio", { name: "Neverwinter" })).toBeChecked();
  await expect(page.getByRole("button", { name: "+1 hour" })).toBeEnabled();
});

test("adopts the shared time, location, and seed and restores them on reload", async ({ page, baseURL }) => {
  const url = sharedLink(baseURL);
  await page.goto(url);
  await page.getByRole("button", { name: "Adopt Shared Campaign" }).click();
  await expect(page).toHaveURL(new URL(returnPath, baseURL).href);
  await expect(page.getByRole("status").filter({ hasText: "Shared campaign adopted and saved in this browser." })).toBeVisible();
  await expect(page.getByRole("button", { name: "+1 hour" })).toBeEnabled();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Shared campaign preview" })).toBeHidden();
  await expect(page.locator(".clock-time")).toHaveText("14:00");
  await expect(page.getByRole("radio", { name: "Waterdeep" })).toBeChecked();
  await page.getByRole("button", { name: "Share Campaign" }).click();
  await expect(page.getByRole("textbox", { name: "Share link" })).toHaveValue(url);
});

test("shows the saved campaign and a notice for an invalid share link", async ({ page }) => {
  await page.goto("/?share=1&time=invalid&location=waterdeep&seed=42");
  await expect(page.getByRole("status").filter({ hasText: "This share link is invalid or unsupported." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shared campaign preview" })).toBeHidden();
  await expect(page.locator(".clock-time")).toHaveText("09:00");
  await expect(page.getByRole("radio", { name: "Neverwinter" })).toBeChecked();
  await expect(page.getByRole("button", { name: "+1 hour" })).toBeEnabled();
});

test("offers a selectable share link when the clipboard write is denied", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new DOMException("Clipboard permission denied", "NotAllowedError");
        },
      },
    });
  });
  await page.reload();
  await page.getByRole("button", { name: "Share Campaign" }).click();
  await page.getByRole("button", { name: "Copy Link" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Select the share link field and copy it manually." })).toBeVisible();

  const field = page.getByRole("textbox", { name: "Share link" });
  await expect(field).toHaveValue(/\?share=1&time=\d+&location=neverwinter&seed=\d+$/);
  await field.click();
  await expect(field).toBeFocused();
  expect(await field.evaluate((input: HTMLInputElement) => input.value.slice(
    input.selectionStart ?? 0, input.selectionEnd ?? 0,
  ))).toBe(await field.inputValue());
});
