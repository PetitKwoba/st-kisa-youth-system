import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HandCoins,
  Landmark,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { activity, monthlyTrend } from "../data/mock";
import { formatCurrency } from "../lib/finance";
import { MetricCard, PageHeader } from "../components/Ui";
import { useShowcase } from "../state/ShowcaseContext";

export function Dashboard() {
  const { user, members, welfareRequests, can } = useShowcase();
  const ownMember = members.find((member) => member.id === user?.memberId);
  const isMember = user?.role === "MEMBER";
  const activeMembers = members.filter((member) => member.status === "Active").length;
  const welfareTotal = members.reduce((sum, member) => sum + member.welfare, 0);
  const tableBankingTotal = members.reduce((sum, member) => sum + member.tableBanking, 0);
  return (
    <>
      <PageHeader
        eyebrow="Tuesday, 30 June 2026"
        title={`Good morning, ${user?.name ?? "Member"}`}
        description={isMember ? "Here is your personal contribution and request position." : "Here is the group’s financial and membership position today."}
        actions={
          <>
            <span className="button secondary">
              <CalendarDays size={18} /> June 2026
            </span>
            {can("contributions:create") && <Link className="button primary" to="/contributions">
              <HandCoins size={18} /> Post contribution
            </Link>}
          </>
        }
      />

      <section className="metrics-grid" aria-label="Group summary">
        <MetricCard
          label={isMember ? "Membership status" : "Active members"}
          value={isMember ? (ownMember?.status ?? "Pending") : String(activeMembers)}
          detail={isMember ? ownMember?.id ?? "Profile" : "+3 this month"}
          icon={<Users size={22} />}
        />
        <MetricCard
          label="Welfare kitty"
          value={formatCurrency(isMember ? ownMember?.welfare ?? 0 : welfareTotal)}
          detail="86% collected"
          accent="gold"
          icon={<Banknote size={22} />}
        />
        <MetricCard
          label="Table banking"
          value={formatCurrency(isMember ? ownMember?.tableBanking ?? 0 : tableBankingTotal)}
          detail="+8.2% this quarter"
          accent="blue"
          icon={<Landmark size={22} />}
        />
        <MetricCard
          label="Pending approvals"
          value={String(isMember ? welfareRequests.filter((item) => item.memberId === user?.memberId && item.status === "Pending verification").length : welfareRequests.filter((item) => item.status === "Pending verification").length)}
          detail={isMember ? "Your open requests" : "Require attention"}
          trend="down"
          accent="red"
          icon={<Clock3 size={22} />}
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Collection performance</p>
              <h2>Monthly contributions</h2>
            </div>
            <span className="soft-chip">
              <CheckCircle2 size={14} /> On track
            </span>
          </div>
          <div className="chart-summary">
            <div>
              <strong>{formatCurrency(18250)}</strong>
              <span>collected in June</span>
            </div>
            <div>
              <strong>{formatCurrency(21250)}</strong>
              <span>monthly target</span>
            </div>
          </div>
          <div
            className="bar-chart"
            role="img"
            aria-label="Collection rate increased from 49 percent in January to 86 percent in June"
          >
            {monthlyTrend.map((item) => (
              <div className="bar-column" key={item.month}>
                <div className="bar-value">{item.value}%</div>
                <div className="bar-rail">
                  <span style={{ height: `${item.value}%` }} />
                </div>
                <small>{item.month}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Audit trail</p>
              <h2>Recent activity</h2>
            </div>
            <Link className="text-button" to="/reports">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="activity-list">
            {activity.map((item) => (
              <div className="activity-item" key={item.title}>
                <span className={`activity-dot ${item.tone}`} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <time>{item.time}</time>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-lower">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">June snapshot</p>
              <h2>Contribution health</h2>
            </div>
            <Link className="text-button" to="/contributions">
              Details <ArrowRight size={15} />
            </Link>
          </div>
          <div className="progress-list">
            {[
              ["Welfare kitty", 86, "KES 18,250 / 21,250"],
              ["Table banking", 74, "KES 62,900 / 85,000"],
              ["Registration fees", 96, "KES 16,400 / 17,000"],
              ["Arrears cleared", 58, "KES 7,250 / 12,500"]
            ].map(([label, percent, amount]) => (
              <div className="progress-row" key={label}>
                <div>
                  <strong>{label}</strong>
                  <span>{amount}</span>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <strong>{percent}%</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel approval-panel">
          <p className="eyebrow">Needs your attention</p>
          <h2>Approval queue</h2>
          <div className="approval-number">
            {isMember ? welfareRequests.filter((item) => item.memberId === user?.memberId).length : welfareRequests.length}
          </div>
          <p>{isMember ? "Your submitted support cases and requests." : "Cases and requests requiring an official decision."}</p>
          <Link className="button dark" to="/welfare">
            {isMember ? "View requests" : "Review queue"} <ArrowRight size={17} />
          </Link>
        </article>
      </section>
    </>
  );
}
