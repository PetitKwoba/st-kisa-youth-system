import { expect, test } from "@playwright/test";

test("board user can navigate to members and search", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /board administrator/i }).click();
  if ((page.viewportSize()?.width ?? 1024) < 800) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await page.getByRole("link", { name: "Members" }).click();
  await page.getByRole("searchbox", { name: "Search members" }).fill("SKY-004");
  await expect(page.getByText("David Wekesa")).toBeVisible();
  await expect(page.getByText("Mary Nasimiyu")).toBeHidden();
});

test("treasurer can open the contribution form", async ({ page }) => {
  await page.goto("/contributions");
  await page.getByRole("button", { name: /treasurer/i }).click();
  await page.getByRole("button", { name: "Post contribution" }).click();
  await expect(
    page.getByRole("heading", { name: "Post a contribution" })
  ).toBeVisible();
});

test("member can sign in and access personal requests", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Member/i }).click();
  await expect(page.getByRole("heading", { name: /good morning, david wekesa/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Members" })).toHaveCount(0);
  if ((page.viewportSize()?.width ?? 1024) < 800) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await page.getByRole("link", { name: "Refunds" }).click();
  await expect(page.getByRole("heading", { name: "Refund requests" })).toBeVisible();
});
