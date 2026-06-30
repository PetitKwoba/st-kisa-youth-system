import { Download, FileText, Mail, Printer } from "lucide-react";
import { exportMemberStatementPdf } from "../lib/exports";
import { formatCurrency } from "../lib/finance";
import { PageHeader, StatusBadge } from "../components/Ui";
import { useShowcase } from "../state/ShowcaseContext";

export function Statements() {
  const { user, members, contributions } = useShowcase();
  const member =
    members.find((item) => item.id === user?.memberId) ?? members[0]!;
  const memberContributions = contributions.filter(
    (item) => item.memberId === member.id
  );
  return (
    <>
      <PageHeader
        eyebrow="Member ledger"
        title="Statement centre"
        description="Review balances and issue transparent member statements."
        actions={
          <>
            <a className="button secondary" href={`mailto:${member.email}?subject=St. Kisa Youth statement`}><Mail size={18} /> Email</a>
            <button className="button primary" type="button" onClick={() => exportMemberStatementPdf(member, memberContributions)}><Download size={18} /> Download PDF</button>
          </>
        }
      />
      <div className="statement-layout">
        <aside className="panel statement-member">
          <span className="avatar large">{member.initials}</span>
          <h2>{member.name}</h2>
          <p>{member.id}</p>
          <StatusBadge status={member.status} />
          <dl>
            <div><dt>Position</dt><dd>{member.position}</dd></div>
            <div><dt>Joined</dt><dd>{member.joined}</dd></div>
            <div><dt>Phone</dt><dd>{member.phone}</dd></div>
          </dl>
          <button className="button secondary full-button" type="button" onClick={() => window.print()}>
            <Printer size={17} /> Print statement
          </button>
        </aside>
        <section className="panel statement-paper">
          <div className="statement-title">
            <div>
              <p className="eyebrow">Statement period</p>
              <h2>January – June 2026</h2>
            </div>
            <FileText size={28} />
          </div>
          <div className="balance-strip">
            <div><span>Opening balance</span><strong>{formatCurrency(10500)}</strong></div>
            <div><span>Contributions</span><strong>{formatCurrency(2250)}</strong></div>
            <div><span>Deductions</span><strong>{formatCurrency(250)}</strong></div>
            <div className="closing"><span>Closing balance</span><strong>{formatCurrency(12500)}</strong></div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Date</th><th>Description</th><th>Reference</th><th className="numeric">Credit</th><th className="numeric">Balance</th></tr>
              </thead>
              <tbody>
                {memberContributions.slice(0, 6).map((item, index) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.type}</td>
                    <td className="mono">{item.reference}</td>
                    <td className="numeric">{formatCurrency(item.amount)}</td>
                    <td className="numeric table-strong">{formatCurrency(12500 - index * 250)}</td>
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
