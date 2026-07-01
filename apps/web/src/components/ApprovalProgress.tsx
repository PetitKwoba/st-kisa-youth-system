import { Check, Clock3, X } from "lucide-react";
import type { ApprovalRequest } from "../state/approval";

export function ApprovalProgress({
  request,
  compact = false
}: {
  request: ApprovalRequest | null;
  compact?: boolean;
}) {
  if (!request) return <span className="cell-subtitle">No workflow</span>;
  return (
    <div
      className={`approval-progress${compact ? " compact" : ""}`}
      aria-label={`${request.referenceId} approval progress`}
    >
      {request.steps.map((step) => (
        <div className={`approval-step step-${step.status.toLowerCase()}`} key={step.id}>
          <span className="step-marker" aria-hidden="true">
            {step.status === "Approved" ? (
              <Check size={12} />
            ) : step.status === "Rejected" ? (
              <X size={12} />
            ) : (
              <Clock3 size={12} />
            )}
          </span>
          <span>
            <strong>
              {step.role.charAt(0) + step.role.slice(1).toLowerCase()}
            </strong>
            {!compact && <small>{step.label}</small>}
          </span>
        </div>
      ))}
    </div>
  );
}
