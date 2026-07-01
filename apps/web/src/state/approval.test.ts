import { describe, expect, it } from "vitest";
import {
  applyApprovalDecision,
  createApprovalSteps,
  type ApprovalRequest
} from "./approval";

function request(kind: ApprovalRequest["kind"]): ApprovalRequest {
  return {
    id: "REQ-001",
    kind,
    referenceId: "WF-2026-014",
    requesterId: "SKY-004",
    requesterName: "David Wekesa",
    amount: 12500,
    evidenceStatus: "Attached",
    policyChecks: ["Member record verified"],
    status: "Pending",
    steps: createApprovalSteps(kind),
    history: [],
    createdAt: "2026-07-01T08:00:00.000Z"
  };
}

describe("approval workflow", () => {
  it("creates the approved role order for each request type", () => {
    expect(createApprovalSteps("WELFARE").map((step) => step.role)).toEqual([
      "TREASURER",
      "SECRETARY",
      "CHAIRPERSON"
    ]);
    expect(createApprovalSteps("REFUND").map((step) => step.role)).toEqual([
      "TREASURER",
      "CHAIRPERSON"
    ]);
    expect(createApprovalSteps("INVESTMENT").map((step) => step.role)).toEqual([
      "TREASURER",
      "CHAIRPERSON"
    ]);
  });

  it("rejects unauthorized and out-of-order decisions", () => {
    const result = applyApprovalDecision(request("WELFARE"), {
      actor: {
        id: "secretary",
        name: "Faith Nanjala",
        role: "SECRETARY"
      },
      decision: "APPROVE",
      comment: "",
      actedAt: "2026-07-01T09:00:00.000Z"
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected unauthorized action to fail");
    expect(result.error).toBe("This request is awaiting Treasurer action.");
  });

  it("advances ordered approvals and prevents duplicate action", () => {
    const first = applyApprovalDecision(request("REFUND"), {
      actor: { id: "treasurer", name: "Peter Wafula", role: "TREASURER" },
      decision: "APPROVE",
      comment: "Balance verified",
      actedAt: "2026-07-01T09:00:00.000Z"
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.request.status).toBe("Pending");
    expect(first.request.steps[1]?.status).toBe("Pending");

    const duplicate = applyApprovalDecision(first.request, {
      actor: { id: "treasurer", name: "Peter Wafula", role: "TREASURER" },
      decision: "APPROVE",
      comment: "",
      actedAt: "2026-07-01T09:01:00.000Z"
    });
    expect(duplicate.ok).toBe(false);
    if (duplicate.ok) throw new Error("Expected duplicate action to fail");
    expect(duplicate.error).toBe("This request is awaiting Chairperson action.");
  });

  it("requires a rejection reason and records terminal audit history", () => {
    const missingReason = applyApprovalDecision(request("INVESTMENT"), {
      actor: { id: "treasurer", name: "Peter Wafula", role: "TREASURER" },
      decision: "REJECT",
      comment: " ",
      actedAt: "2026-07-01T09:00:00.000Z"
    });
    expect(missingReason.ok).toBe(false);
    if (missingReason.ok) throw new Error("Expected rejection without reason to fail");
    expect(missingReason.error).toBe("A rejection reason is required.");

    const rejected = applyApprovalDecision(request("INVESTMENT"), {
      actor: { id: "treasurer", name: "Peter Wafula", role: "TREASURER" },
      decision: "REJECT",
      comment: "Liquidity threshold exceeded",
      actedAt: "2026-07-01T09:00:00.000Z"
    });
    expect(rejected.ok).toBe(true);
    if (!rejected.ok) return;
    expect(rejected.request.status).toBe("Rejected");
    expect(rejected.request.history[0]).toMatchObject({
      actorRole: "TREASURER",
      decision: "REJECT",
      comment: "Liquidity threshold exceeded"
    });
  });

  it("reaches approved only after the final required role acts", () => {
    const initial = request("WELFARE");
    const treasurer = applyApprovalDecision(initial, {
      actor: { id: "t", name: "Treasurer", role: "TREASURER" },
      decision: "APPROVE",
      comment: "",
      actedAt: "2026-07-01T09:00:00.000Z"
    });
    if (!treasurer.ok) throw new Error(treasurer.error);
    const secretary = applyApprovalDecision(treasurer.request, {
      actor: { id: "s", name: "Secretary", role: "SECRETARY" },
      decision: "APPROVE",
      comment: "",
      actedAt: "2026-07-01T10:00:00.000Z"
    });
    if (!secretary.ok) throw new Error(secretary.error);
    expect(secretary.request.status).toBe("Pending");
    const chair = applyApprovalDecision(secretary.request, {
      actor: { id: "c", name: "Chairperson", role: "CHAIRPERSON" },
      decision: "APPROVE",
      comment: "",
      actedAt: "2026-07-01T11:00:00.000Z"
    });
    if (!chair.ok) throw new Error(chair.error);
    expect(chair.request.status).toBe("Approved");
  });
});
