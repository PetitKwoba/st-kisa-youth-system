import {
  Download,
  FileArchive,
  HeartHandshake,
  Plus,
  RotateCcw,
  TrendingUp,
  Upload
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { formatCurrency } from "../lib/finance";
import { PageHeader, StatusBadge } from "../components/Ui";
import { ApprovalProgress } from "../components/ApprovalProgress";
import { useShowcase } from "../state/ShowcaseContext";

function memberOptions(
  userMemberId: string | null,
  members: ReturnType<typeof useShowcase>["members"]
) {
  return userMemberId
    ? members.filter((member) => member.id === userMemberId)
    : members;
}

export function Welfare() {
  const { user, members, welfareRequests, approvalRequests, addWelfareRequest } = useShowcase();
  const [notice, setNotice] = useState("");
  const visible = user?.role === "MEMBER"
    ? welfareRequests.filter((item) => item.memberId === user.memberId)
    : welfareRequests;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const request = addWelfareRequest({
      memberId: String(form.get("memberId")),
      category: String(form.get("category")),
      amount: Number(form.get("amount")),
      description: String(form.get("description"))
    });
    setNotice(`${request.id} was submitted for verification.`);
    event.currentTarget.reset();
  }

  return (
    <>
      <PageHeader
        eyebrow="Support workflow"
        title="Welfare support"
        description="Submit evidence-backed requests and track approval progress."
      />
      <div className="operation-grid">
        <form className="panel operation-form" onSubmit={submit}>
          <div className="panel-heading">
            <div><p className="eyebrow">New case</p><h2>Request support</h2></div>
            <HeartHandshake size={23} />
          </div>
          <label className="field">
            Member
            <select name="memberId" defaultValue={user?.memberId ?? members[0]?.id}>
              {memberOptions(user?.role === "MEMBER" ? user.memberId : null, members).map((member) => (
                <option key={member.id} value={member.id}>{member.id} · {member.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Support category
            <select name="category">
              <option>Medical emergency</option>
              <option>Bereavement</option>
              <option>Deceased member</option>
              <option>Special circumstance</option>
            </select>
          </label>
          <label className="field">
            Amount requested (KES)
            <input name="amount" type="number" min="1" required defaultValue="12500" />
          </label>
          <label className="field">
            Case description
            <textarea name="description" rows={4} required placeholder="Provide clear case details..." />
          </label>
          {notice && <p className="success-notice" role="status">{notice}</p>}
          <button className="button primary full-button" type="submit">
            <Plus size={17} /> Submit request
          </button>
        </form>
        <section className="panel table-panel">
          <div className="panel-heading operation-heading">
            <div><p className="eyebrow">Cases</p><h2>Request history</h2></div>
            <span className="result-count">{visible.length} records</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Case</th><th>Member</th><th>Category</th><th className="numeric">Amount</th><th>Status</th><th>Approval route</th></tr></thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td className="mono">{item.id}</td>
                    <td><strong>{item.memberName}</strong><span className="cell-subtitle">{item.memberId}</span></td>
                    <td>{item.category}</td>
                    <td className="numeric table-strong">{formatCurrency(item.amount)}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td><ApprovalProgress compact request={approvalRequests.find((approval) => approval.referenceId === item.id) ?? null} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export function Refunds() {
  const { user, members, refunds, approvalRequests, addRefundRequest } = useShowcase();
  const [notice, setNotice] = useState("");
  const visible = user?.role === "MEMBER"
    ? refunds.filter((item) => item.memberId === user.memberId)
    : refunds;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("requestedAmount"));
    const method = String(form.get("method"));
    if (amount > 2000 && method === "Cash") {
      setNotice("Refunds above KES 2,000 must use M-Pesa or bank transfer.");
      return;
    }
    const request = addRefundRequest({
      memberId: String(form.get("memberId")),
      requestedAmount: amount,
      method,
      reason: String(form.get("reason"))
    });
    setNotice(`${request.id} created. Net payable: ${formatCurrency(request.netPayable)}.`);
    event.currentTarget.reset();
  }

  return (
    <>
      <PageHeader
        eyebrow="Member funds"
        title="Refund requests"
        description="Apply the approved KES 50 fee and deductions transparently."
      />
      <div className="operation-grid">
        <form className="panel operation-form" onSubmit={submit}>
          <div className="panel-heading">
            <div><p className="eyebrow">New request</p><h2>Calculate refund</h2></div>
            <RotateCcw size={23} />
          </div>
          <label className="field">
            Member
            <select name="memberId" defaultValue={user?.memberId ?? members[0]?.id}>
              {memberOptions(user?.role === "MEMBER" ? user.memberId : null, members).map((member) => (
                <option key={member.id} value={member.id}>{member.id} · {member.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Requested amount (KES)
            <input name="requestedAmount" type="number" min="51" required defaultValue="3000" />
          </label>
          <label className="field">
            Payment method
            <select name="method"><option>M-Pesa</option><option>Bank</option><option>Cash</option></select>
          </label>
          <label className="field">
            Reason
            <textarea name="reason" rows={3} required placeholder="Reason for refund..." />
          </label>
          <p className="policy-note">KES 50 processing fee applies. Confirmed arrears and fines are deducted.</p>
          {notice && <p className="success-notice" role="status">{notice}</p>}
          <button className="button primary full-button" type="submit">
            <Plus size={17} /> Submit refund
          </button>
        </form>
        <section className="panel table-panel">
          <div className="panel-heading operation-heading">
            <div><p className="eyebrow">Queue</p><h2>Refund history</h2></div>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Request</th><th>Member</th><th className="numeric">Requested</th><th className="numeric">Net payable</th><th>Status</th><th>Approval route</th></tr></thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td className="mono">{item.id}</td>
                    <td><strong>{item.memberName}</strong><span className="cell-subtitle">{item.method}</span></td>
                    <td className="numeric">{formatCurrency(item.requestedAmount)}</td>
                    <td className="numeric table-strong">{formatCurrency(item.netPayable)}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td><ApprovalProgress compact request={approvalRequests.find((approval) => approval.referenceId === item.id) ?? null} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export function Investments() {
  const { investments, approvalRequests, addInvestment } = useShowcase();
  const [notice, setNotice] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const principal = Number(form.get("principal"));
    if (principal > 161500) {
      setNotice("This exceeds the provisional 25% liquidity limit of KES 161,500.");
      return;
    }
    const investment = addInvestment({
      instrument: String(form.get("instrument")),
      institution: String(form.get("institution")),
      principal,
      rate: Number(form.get("rate")),
      maturityDate: String(form.get("maturityDate"))
    });
    setNotice(`${investment.id} added for committee approval.`);
    event.currentTarget.reset();
  }

  return (
    <>
      <PageHeader
        eyebrow="Advanced finance"
        title="Investment register"
        description="Track approved instruments, maturity and expected income."
      />
      <div className="operation-grid">
        <form className="panel operation-form" onSubmit={submit}>
          <div className="panel-heading">
            <div><p className="eyebrow">New proposal</p><h2>Record investment</h2></div>
            <TrendingUp size={23} />
          </div>
          <label className="field">Instrument<select name="instrument"><option>Treasury bill</option><option>Government bond</option><option>Money market fund</option></select></label>
          <label className="field">Institution<input name="institution" required placeholder="Institution name" /></label>
          <label className="field">Principal (KES)<input name="principal" type="number" min="1" required defaultValue="100000" /></label>
          <label className="field">Annual rate (%)<input name="rate" type="number" min="0" step="0.1" required defaultValue="12.4" /></label>
          <label className="field">Maturity date<input name="maturityDate" type="date" required defaultValue="2026-12-18" /></label>
          <p className="policy-note">Allowed instruments only. Single investment limit: 25% of available liquidity.</p>
          {notice && <p className="success-notice" role="status">{notice}</p>}
          <button className="button primary full-button" type="submit"><Plus size={17} /> Add proposal</button>
        </form>
        <section className="panel table-panel">
          <div className="panel-heading operation-heading"><div><p className="eyebrow">Portfolio</p><h2>Current investments</h2></div></div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Instrument</th><th>Institution</th><th className="numeric">Principal</th><th>Maturity</th><th>Status</th><th>Approval route</th></tr></thead>
              <tbody>
                {investments.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.instrument}</strong><span className="cell-subtitle">{item.rate}% annual</span></td>
                    <td>{item.institution}</td>
                    <td className="numeric table-strong">{formatCurrency(item.principal)}</td>
                    <td>{item.maturityDate}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td><ApprovalProgress compact request={approvalRequests.find((approval) => approval.referenceId === item.id) ?? null} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function Documents() {
  const { user, members, documents, addDocument } = useShowcase();
  const [notice, setNotice] = useState("");
  const visible = user?.role === "MEMBER"
    ? documents.filter((item) => item.memberId === user.memberId)
    : documents;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return;
    if (file.size > 2 * 1024 * 1024) {
      setNotice("For the hosted showcase, uploads are limited to 2 MB.");
      return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setNotice("Upload a PDF, JPEG or PNG document.");
      return;
    }
    const document = addDocument({
      memberId: String(form.get("memberId")),
      category: String(form.get("category")),
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: await fileToDataUrl(file)
    });
    setNotice(`${document.name} was stored in this browser.`);
    event.currentTarget.reset();
  }

  return (
    <>
      <PageHeader eyebrow="Digital archive" title="Documents" description="Upload and retrieve supporting evidence in the showcase." />
      <div className="operation-grid">
        <form className="panel operation-form" onSubmit={submit}>
          <div className="panel-heading"><div><p className="eyebrow">New upload</p><h2>Add document</h2></div><Upload size={23} /></div>
          <label className="field">Member<select name="memberId" defaultValue={user?.memberId ?? members[0]?.id}>{memberOptions(user?.role === "MEMBER" ? user.memberId : null, members).map((member) => <option key={member.id} value={member.id}>{member.id} · {member.name}</option>)}</select></label>
          <label className="field">Category<select name="category"><option>Identity</option><option>Welfare evidence</option><option>Payment confirmation</option><option>Meeting record</option></select></label>
          <label className="file-drop"><FileArchive size={25} /><span><strong>Choose a document</strong><small>PDF, JPEG or PNG · maximum 2 MB</small></span><input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required /></label>
          {notice && <p className="success-notice" role="status">{notice}</p>}
          <button className="button primary full-button" type="submit"><Upload size={17} /> Upload document</button>
        </form>
        <section className="panel table-panel">
          <div className="panel-heading operation-heading"><div><p className="eyebrow">Archive</p><h2>Stored documents</h2></div></div>
          {visible.length ? (
            <div className="document-list">
              {visible.map((item) => (
                <article key={item.id}>
                  <span className="document-icon"><FileArchive size={20} /></span>
                  <div><strong>{item.name}</strong><small>{item.category} · {(item.size / 1024).toFixed(1)} KB</small></div>
                  <a className="row-action" href={item.dataUrl} download={item.name}><Download size={16} /> Download</a>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><FileArchive size={30} /><strong>No documents yet</strong><span>Uploaded files will appear here.</span></div>}
        </section>
      </div>
    </>
  );
}
