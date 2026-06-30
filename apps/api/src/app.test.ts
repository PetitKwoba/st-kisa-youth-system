import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

describe("mock API", () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("returns dashboard metrics", async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/api/dashboard" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      activeMembers: 85,
      welfareKitty: 212500
    });
  });

  it("reports API health and returns members", async () => {
    const app = buildApp();
    apps.push(app);
    const health = await app.inject({ method: "GET", url: "/api/health" });
    const memberList = await app.inject({ method: "GET", url: "/api/members" });
    const contributionList = await app.inject({
      method: "GET",
      url: "/api/contributions"
    });

    expect(health.json()).toMatchObject({ status: "ok" });
    expect(memberList.json()).toHaveLength(4);
    expect(contributionList.statusCode).toBe(200);
  });

  it("rejects an invalid contribution", async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: "/api/contributions",
      payload: {
        memberId: "SKY-001",
        type: "Table banking",
        amount: 1200,
        method: "M-Pesa",
        reference: "TST123"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      message: "Table banking contributions cannot exceed KES 1,000."
    });
  });

  it("records a valid contribution in the mock repository", async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: "/api/contributions",
      payload: {
        memberId: "SKY-001",
        type: "Welfare kitty",
        amount: 250,
        method: "M-Pesa",
        reference: "TST456"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      memberId: "SKY-001",
      status: "Matched",
      amount: 250
    });
  });

  it("rejects malformed contributions and unknown members", async () => {
    const app = buildApp();
    apps.push(app);
    const malformed = await app.inject({
      method: "POST",
      url: "/api/contributions",
      payload: { amount: -1 }
    });
    const missingMember = await app.inject({
      method: "POST",
      url: "/api/contributions",
      payload: {
        memberId: "SKY-999",
        type: "Welfare kitty",
        amount: 250,
        method: "M-Pesa",
        reference: "TST999"
      }
    });

    expect(malformed.statusCode).toBe(400);
    expect(missingMember.statusCode).toBe(404);
  });
});
