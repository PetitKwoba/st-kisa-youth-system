export type ApprovalKind = "WELFARE" | "REFUND" | "INVESTMENT";
export type ApprovalRole = "TREASURER" | "SECRETARY" | "CHAIRPERSON";
export type ApprovalDecision = "APPROVE" | "REJECT";
export type ApprovalStatus = "Pending" | "Approved" | "Rejected";
export type ApprovalStepStatus =
  | "Waiting"
  | "Pending"
  | "Approved"
  | "Rejected";

export interface ApprovalStep {
  id: string;
  role: ApprovalRole;
  label: string;
  status: ApprovalStepStatus;
  actedBy: string | null;
  actedAt: string | null;
  comment: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: ApprovalRole;
  decision: ApprovalDecision;
  comment: string;
  actedAt: string;
}

export interface ApprovalRequest {
  id: string;
  kind: ApprovalKind;
  referenceId: string;
  requesterId: string;
  requesterName: string;
  amount: number;
  evidenceStatus: string;
  policyChecks: string[];
  status: ApprovalStatus;
  steps: ApprovalStep[];
  history: ApprovalHistoryEntry[];
  createdAt: string;
}

export interface ApprovalAction {
  actor: {
    id: string;
    name: string;
    role: ApprovalRole | string;
  };
  decision: ApprovalDecision;
  comment: string;
  actedAt: string;
}

const workflowRoles: Record<
  ApprovalKind,
  Array<{ role: ApprovalRole; label: string }>
> = {
  WELFARE: [
    { role: "TREASURER", label: "Financial verification" },
    { role: "SECRETARY", label: "Record and evidence approval" },
    { role: "CHAIRPERSON", label: "Final authorization" }
  ],
  REFUND: [
    { role: "TREASURER", label: "Balance and deductions verification" },
    { role: "CHAIRPERSON", label: "Executive Committee authorization" }
  ],
  INVESTMENT: [
    { role: "TREASURER", label: "Liquidity and instrument verification" },
    { role: "CHAIRPERSON", label: "Committee authorization" }
  ]
};

export function createApprovalSteps(kind: ApprovalKind): ApprovalStep[] {
  return workflowRoles[kind].map((step, index) => ({
    id: `${kind.toLowerCase()}-${index + 1}`,
    ...step,
    status: index === 0 ? "Pending" : "Waiting",
    actedBy: null,
    actedAt: null,
    comment: ""
  }));
}

export function getPendingApprovalStep(request: ApprovalRequest) {
  return request.steps.find((step) => step.status === "Pending") ?? null;
}

export function applyApprovalDecision(
  request: ApprovalRequest,
  action: ApprovalAction
):
  | { ok: true; request: ApprovalRequest }
  | { ok: false; error: string } {
  if (request.status !== "Pending") {
    return { ok: false, error: `This request is already ${request.status.toLowerCase()}.` };
  }

  const pendingIndex = request.steps.findIndex(
    (step) => step.status === "Pending"
  );
  const pendingStep = request.steps[pendingIndex];
  if (!pendingStep) {
    return { ok: false, error: "This request has no pending approval step." };
  }
  if (action.actor.role !== pendingStep.role) {
    const roleLabel =
      pendingStep.role.charAt(0) + pendingStep.role.slice(1).toLowerCase();
    return {
      ok: false,
      error: `This request is awaiting ${roleLabel} action.`
    };
  }

  const comment = action.comment.trim();
  if (action.decision === "REJECT" && !comment) {
    return { ok: false, error: "A rejection reason is required." };
  }

  const steps = request.steps.map((step, index) => {
    if (index === pendingIndex) {
      return {
        ...step,
        status:
          action.decision === "APPROVE"
            ? ("Approved" as const)
            : ("Rejected" as const),
        actedBy: action.actor.name,
        actedAt: action.actedAt,
        comment
      };
    }
    if (index === pendingIndex + 1 && action.decision === "APPROVE") {
      return { ...step, status: "Pending" as const };
    }
    return step;
  });

  const isFinalApproval =
    action.decision === "APPROVE" && pendingIndex === request.steps.length - 1;
  const status: ApprovalStatus =
    action.decision === "REJECT"
      ? "Rejected"
      : isFinalApproval
        ? "Approved"
        : "Pending";
  const history: ApprovalHistoryEntry[] = [
    ...request.history,
    {
      id: `${request.id}-event-${request.history.length + 1}`,
      actorId: action.actor.id,
      actorName: action.actor.name,
      actorRole: pendingStep.role,
      decision: action.decision,
      comment,
      actedAt: action.actedAt
    }
  ];

  return {
    ok: true,
    request: { ...request, status, steps, history }
  };
}
