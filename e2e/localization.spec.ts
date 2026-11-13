import { expect, test } from "@playwright/test";

test("localizes saved Chinese preferences, calendar errors, and copy feedback", async ({ page, context, baseURL }) => {
  await context.addInitScript(() => {
    localStorage.setItem("harptos-calendar-tracker:language", "zh-Hans");
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => { throw new DOMException("Denied", "NotAllowedError"); } },
    });
  });
  await page.goto("/");
  await expect(page).toHaveTitle("哈普托斯历追踪器");
  await expect(page.getByRole("heading", { name: "战役时钟" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "无冬城" })).toBeChecked();
  await expect(page.getByRole("heading", { name: "塔萨克月 1491 DR" })).toBeVisible();

  await page.getByRole("button", { name: "设置当前时间" }).click();
  const editor = page.getByRole("dialog", { name: "设置当前时间" });
  await editor.getByLabel("月份或节日").selectOption("Shieldmeet");
  await editor.getByRole("button", { name: "设置时间", exact: true }).click();
  await expect(editor.getByRole("alert")).toHaveText("盾会节只出现在可被4整除的年份，例如 1492 DR。");
  await editor.getByRole("button", { name: "取消" }).click();

  await page.getByRole("button", { name: "复制战役摘要" }).click();
  await expect(page.getByRole("status").filter({ hasText: "请选择战役摘要字段并手动复制。" })).toBeVisible();

  await page.goto(new URL("/?share=1", baseURL).href);
  await expect(page.getByRole("status").filter({ hasText: "此分享链接无效或不受支持。" })).toBeVisible();
  await page.getByRole("button", { name: "Use English" }).click();
  await expect(page.getByRole("heading", { name: "Campaign clock" })).toBeVisible();
});
