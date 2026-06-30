import { ArrowDownLeft, ArrowUpRight, Download, LockKeyhole } from "lucide-react";
import { accounts } from "../data/mock";
import { formatCurrency } from "../lib/finance";
import { exportSummaryPdf } from "../lib/exports";
import { PageHeader, StatusBadge } from "../components/Ui";

export function Accounting() {
  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Accounting"
        description="A clear view of cash, member liabilities and the month-end close."
        actions={<button className="button primary" type="button" onClick={() => exportSummaryPdf("Trial balance", ["1105 Cash at bank: KES 486,250", "1110 Mobile money: KES 127,400", "2100 Member deposits payable: KES 640,000", "3100 Registration reserve: KES 17,000"])}><Download size={18} /> Export trial balance</button>}
      />
      <section className="finance-hero">
        <div>
          <span>Total assets</span>
          <strong>{formatCurrency(646150)}</strong>
          <small><ArrowUpRight size={14} /> 6.4% from May</small>
        </div>
        <div>
          <span>Member deposits payable</span>
          <strong>{formatCurrency(640000)}</strong>
          <small><ArrowUpRight size={14} /> 8.2% from May</small>
        </div>
        <div>
          <span>Net operating position</span>
          <strong>{formatCurrency(6150)}</strong>
          <small className="negative"><ArrowDownLeft size={14} /> After June expenses</small>
        </div>
      </section>
      <div className="accounting-grid">
        <section className="panel table-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">General ledger</p><h2>Chart of accounts</h2></div>
            <StatusBadge status="Draft period" />
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Code</th><th>Account</th><th>Type</th><th className="numeric">Balance</th></tr></thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.code}>
                    <td className="mono">{account.code}</td>
                    <td className="table-strong">{account.name}</td>
                    <td>{account.type}</td>
                    <td className="numeric table-strong">{formatCurrency(account.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="panel close-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">June 2026</p><h2>Month-end close</h2></div>
            <LockKeyhole size={22} />
          </div>
          {[
            ["Post all receipts", true],
            ["Reconcile M-Pesa", true],
            ["Reconcile bank", false],
            ["Review trial balance", false],
            ["Approve and lock period", false]
          ].map(([task, done], index) => (
            <div className={`check-row${done ? " done" : ""}`} key={String(task)}>
              <span>{done ? "✓" : index + 1}</span>
              <div><strong>{task}</strong><small>{done ? "Completed" : "Pending"}</small></div>
            </div>
          ))}
          <button className="button dark full-button" type="button">Continue close</button>
        </aside>
      </div>
    </>
  );
}
