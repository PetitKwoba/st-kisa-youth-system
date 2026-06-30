import { Check, Download, Filter, Plus, Search, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  formatCurrency,
  validateContributionAmount,
  type ContributionType
} from "../lib/finance";
import { PageHeader, StatusBadge } from "../components/Ui";
import { useShowcase } from "../state/ShowcaseContext";
import { exportTableExcel } from "../lib/exports";

const types: ContributionType[] = [
  "Welfare kitty",
  "Table banking",
  "Registration fee",
  "Fine"
];

export function Contributions() {
  const { user, members, contributions, addContribution, can } = useShowcase();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = String(form.get("type")) as ContributionType;
    const amount = Number(form.get("amount"));
    const validationError = validateContributionAmount(type, amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    addContribution({
      memberId: String(form.get("memberId")),
      type,
      amount,
      method: String(form.get("method")) as "M-Pesa" | "Bank" | "Cash",
      reference: String(form.get("reference"))
    });
    setSubmitted(true);
    setError("");
  }

  const roleContributions =
    user?.role === "MEMBER"
      ? contributions.filter((item) => item.memberId === user.memberId)
      : contributions;
  const visibleContributions = roleContributions.filter((item) =>
    [item.memberId, item.memberName, item.reference, item.type, item.status]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <>
      <PageHeader
        eyebrow="Collections"
        title="Contributions"
        description="Track member payments and match every receipt to the ledger."
        actions={
          <>
            <button className="button secondary" type="button" onClick={() => exportTableExcel("st-kisa-contributions.xlsx", "Contributions", roleContributions.map((item) => ({ Date: new Date(item.date).toLocaleDateString(), Member: item.memberName, "Member No.": item.memberId, Type: item.type, Method: item.method, Reference: item.reference, "Amount (KES)": item.amount, Status: item.status })))}>
              <Download size={18} /> Export
            </button>
            {can("contributions:create") && <button
              className="button primary"
              type="button"
              onClick={() => {
                setModalOpen(true);
                setSubmitted(false);
              }}
            >
              <Plus size={18} /> Post contribution
            </button>}
          </>
        }
      />

      <section className="mini-metrics" aria-label="Contribution summary">
        <div><span>Collected this month</span><strong>KES 82,450</strong></div>
        <div><span>Matched receipts</span><strong>94.8%</strong></div>
        <div><span>Outstanding arrears</span><strong>KES 12,500</strong></div>
        <div><span>Pending review</span><strong>4</strong></div>
      </section>

      <section className="panel table-panel">
        <div className="table-tools">
          <label className="table-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search contributions</span>
            <input placeholder="Search member or reference" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <select aria-label="Contribution period" defaultValue="June 2026">
            <option>June 2026</option>
            <option>May 2026</option>
          </select>
          <button className="button secondary compact" type="button" onClick={() => setQuery("Pending review")}>
            <Filter size={17} /> Filter
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Type</th>
                <th>Method</th>
                <th>Reference</th>
                <th className="numeric">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleContributions.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.date).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>
                    <strong>{item.memberName}</strong>
                    <span className="cell-subtitle">{item.memberId}</span>
                  </td>
                  <td>{item.type}</td>
                  <td>{item.method}</td>
                  <td className="mono">{item.reference}</td>
                  <td className="numeric table-strong">
                    {formatCurrency(item.amount)}
                  </td>
                  <td><StatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contribution-title"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">New receipt</p>
                <h2 id="contribution-title">Post a contribution</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close contribution form"
                onClick={() => setModalOpen(false)}
              >
                <X />
              </button>
            </div>
            {submitted ? (
              <div className="success-state" aria-live="polite">
                <span><Check size={28} /></span>
                <h3>Contribution recorded</h3>
                <p>The mock receipt was matched and is ready for ledger posting.</p>
                <button className="button primary" type="button" onClick={() => setModalOpen(false)}>
                  Done
                </button>
              </div>
            ) : (
              <form className="form-grid" onSubmit={handleSubmit}>
                <label className="field full-field">
                  Member
                  <select name="memberId" required>
                    {members.filter((member) => member.status === "Active").map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.id} · {member.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  Contribution type
                  <select name="type" required>
                    {types.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </label>
                <label className="field">
                  Amount (KES)
                  <input name="amount" type="number" min="1" required defaultValue="250" />
                </label>
                <label className="field">
                  Payment method
                  <select name="method" required>
                    <option>M-Pesa</option>
                    <option>Bank</option>
                    <option>Cash</option>
                  </select>
                </label>
                <label className="field">
                  Transaction reference
                  <input name="reference" required placeholder="e.g. TGY8LQ21AZ" />
                </label>
                {error && <p className="form-error full-field" role="alert">{error}</p>}
                <div className="form-actions full-field">
                  <button className="button secondary" type="button" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button className="button primary" type="submit">
                    Record contribution
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
