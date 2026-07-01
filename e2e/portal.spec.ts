import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function signIn(page: Page, email: string) {
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("Demo@2026");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("board user can navigate to members and search", async ({ page }) => {
  await page.goto("/");
  await signIn(page, "admin@stkisa.org");
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
  await signIn(page, "treasurer@stkisa.org");
  await page.getByRole("button", { name: "Post contribution" }).click();
  await expect(
    page.getByRole("heading", { name: "Post a contribution" })
  ).toBeVisible();
});

test("member can sign in and access personal requests", async ({ page }) => {
  await page.goto("/");
  await signIn(page, "member@stkisa.org");
  await expect(page.getByRole("heading", { name: /good morning, david wekesa/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Members" })).toHaveCount(0);
  if ((page.viewportSize()?.width ?? 1024) < 800) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await page.getByRole("link", { name: "Refunds" }).click();
  await expect(page.getByRole("heading", { name: "Refund requests" })).toBeVisible();
});

test("treasurer can act on the current approval step", async ({ page }) => {
  await page.goto("/approvals");
  await signIn(page, "treasurer@stkisa.org");
  await expect(page.getByRole("heading", { name: "Approval inbox" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Reject" }).first()).toBeVisible();
});
