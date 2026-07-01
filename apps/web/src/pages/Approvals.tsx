import {
  Check,
  CheckCircle2,
  CircleX,
  ClipboardCheck,
  Clock3,
  ShieldCheck,
  X
} from "lucide-react";
import { useState } from "react";
import { ApprovalProgress } from "../components/ApprovalProgress";
import { PageHeader, StatusBadge } from "../components/Ui";
import { formatCurrency } from "../lib/finance";
import { getPendingApprovalStep, type ApprovalDecision } from "../state/approval";
import { useShowcase } from "../state/ShowcaseContext";

type Tab = "Pending" | "Approved" | "Rejected";

export function Approvals() {
  const { user, approvalRequests, actOnApproval } = useShowcase();
  const [tab, setTab] = useState<Tab>("Pending");
  const [comments, setComments] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const visible = approvalRequests.filter((request) => request.status === tab);

  function act(requestId: string, decision: ApprovalDecision) {
    const result = actOnApproval(requestId, decision, comments[requestId] ?? "");
    setMessages((current) => ({
      ...current,
      [requestId]: result.ok
        ? decision === "APPROVE"
          ? "Decision recorded and workflow advanced."
          : "Request rejected and workflow closed."
        : result.error
    }));
    if (result.ok) {
      setComments((current) => ({ ...current, [requestId]: "" }));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Maker-checker controls"
        title="Approval inbox"
        description="Review policy checks, evidence and ordered official decisions."
      />
      <section className="approval-summary" aria-label="Approval summary">
        <div>
          <Clock3 size={18} />
          <span>Pending</span>
          <strong>{approvalRequests.filter((item) => item.status === "Pending").length}</strong>
        </div>
        <div>
          <CheckCircle2 size={18} />
          <span>Approved</span>
          <strong>{approvalRequests.filter((item) => item.status === "Approved").length}</strong>
        </div>
        <div>
          <CircleX size={18} />
          <span>Rejected</span>
          <strong>{approvalRequests.filter((item) => item.status === "Rejected").length}</strong>
        </div>
      </section>
      <div className="approval-tabs" role="tablist" aria-label="Approval status">
        {(["Pending", "Approved", "Rejected"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <section className="approval-list">
        {visible.map((request) => {
          const pendingStep = getPendingApprovalStep(request);
          const actionable =
            request.status === "Pending" && pendingStep?.role === user?.role;
          const message = messages[request.id] ?? "";
          return (
            <article className="panel approval-card" key={request.id}>
              <div className="approval-card-head">
                <span className={`request-kind kind-${request.kind.toLowerCase()}`}>
                  {request.kind === "WELFARE" ? (
                    <ShieldCheck size={18} />
                  ) : (
                    <ClipboardCheck size={18} />
                  )}
                </span>
                <div>
                  <p className="eyebrow">{request.kind} · {request.referenceId}</p>
                  <h2>{request.requesterName}</h2>
                  <span>{request.requesterId} · {formatCurrency(request.amount)}</span>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <div className="approval-card-body">
                <div className="approval-checks">
                  <div>
                    <strong>Evidence</strong>
                    <span>{request.evidenceStatus}</span>
                  </div>
                  <div>
                    <strong>Policy checks</strong>
                    <ul>
                      {request.policyChecks.map((check) => (
                        <li key={check}><Check size={13} /> {check}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="approval-timeline">
                  <strong>Approval route</strong>
                  <ApprovalProgress request={request} />
                  {request.history.length > 0 && (
                    <div className="decision-history">
                      {request.history.map((entry) => (
                        <p key={entry.id}>
                          <strong>{entry.actorName}</strong> {entry.decision.toLowerCase()}d
                          {entry.comment ? ` — ${entry.comment}` : ""}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {actionable && (
                <div className="approval-actions">
                  <label className="field">
                    Decision comment
                    <textarea
                      rows={2}
                      value={comments[request.id] ?? ""}
                      onChange={(event) =>
                        setComments((current) => ({
                          ...current,
                          [request.id]: event.target.value
                        }))
                      }
                      placeholder="Optional for approval; required for rejection"
                    />
                  </label>
                  <div>
                    <button className="button reject" type="button" onClick={() => act(request.id, "REJECT")}>
                      <X size={16} /> Reject
                    </button>
                    <button className="button primary" type="button" onClick={() => act(request.id, "APPROVE")}>
                      <Check size={16} /> Approve
                    </button>
                  </div>
                </div>
              )}
              {!actionable && request.status === "Pending" && (
                <p className="approval-readonly">
                  Awaiting {pendingStep?.role.charAt(0)}
                  {pendingStep?.role.slice(1).toLowerCase()} action. Your access is read-only at this step.
                </p>
              )}
              {message && (
                <p
                  className={
                    message.startsWith("Decision") ||
                    message.startsWith("Request rejected")
                      ? "success-notice approval-message"
                      : "form-error approval-message"
                  }
                  role="status"
                >
                  {message}
                </p>
              )}
            </article>
          );
        })}
        {visible.length === 0 && (
          <div className="panel empty-state">
            <ClipboardCheck size={34} />
            <strong>No {tab.toLowerCase()} requests</strong>
            <span>Requests will appear here as their workflow changes.</span>
          </div>
        )}
      </section>
    </>
  );
}
