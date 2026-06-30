import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  trend = "up",
  accent = "green",
  icon
}: {
  label: string;
  value: string;
  detail: string;
  trend?: "up" | "down" | "neutral";
  accent?: "green" | "gold" | "red" | "blue";
  icon: ReactNode;
}) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <article className={`metric-card accent-${accent}`}>
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        <span className={`trend trend-${trend}`}>
          <TrendIcon size={14} aria-hidden="true" />
          {detail}
        </span>
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge status-${tone}`}>{status}</span>;
}

export function EmptyModule({
  icon,
  title,
  description,
  phase,
  tasks
}: {
  icon: ReactNode;
  title: string;
  description: string;
  phase: string;
  tasks: string[];
}) {
  return (
    <div className="module-preview">
      <div className="preview-icon">{icon}</div>
      <span className="phase-chip">{phase}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="preview-list">
        {tasks.map((task, index) => (
          <div key={task}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {task}
          </div>
        ))}
      </div>
    </div>
  );
}
