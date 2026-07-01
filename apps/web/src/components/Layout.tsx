import {
  Bell,
  BookOpenCheck,
  ChevronDown,
  ClipboardCheck,
  FileArchive,
  FileBarChart,
  HandCoins,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  Undo2,
  Users,
  Vote,
  X
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  useShowcase,
  type Capability
} from "../state/ShowcaseContext";

const primaryNav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, capability: null },
  { to: "/members", label: "Members", icon: Users, capability: "members:view" },
  { to: "/contributions", label: "Contributions", icon: HandCoins },
  { to: "/statements", label: "Statements", icon: ReceiptText },
  { to: "/accounting", label: "Accounting", icon: Landmark, capability: "accounting:view" }
];

const secondaryNav = [
  { to: "/approvals", label: "Approvals", icon: ClipboardCheck, capability: "approvals:view" },
  { to: "/welfare", label: "Welfare", icon: ShieldCheck, capability: "welfare:view" },
  { to: "/refunds", label: "Refunds", icon: Undo2, capability: "refunds:view" },
  { to: "/investments", label: "Investments", icon: TrendingUp, capability: "investments:view" },
  { to: "/documents", label: "Documents", icon: FileArchive, capability: "documents:view" },
  { to: "/governance", label: "Governance", icon: Vote, capability: null },
  { to: "/reports", label: "Reports", icon: FileBarChart, capability: "reports:view" }
];

function Navigation({
  onNavigate
}: {
  onNavigate?: () => void;
}) {
  const { can } = useShowcase();
  const renderGroup = (
    label: string,
    items: typeof primaryNav
  ) => {
    const visibleItems = items.filter(
      (item) =>
        !("capability" in item) ||
        item.capability === null ||
        can(item.capability as Capability)
    );
    return (
    <div className="nav-group">
      <p className="nav-label">{label}</p>
      {visibleItems.map(({ to, label: itemLabel, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `nav-link${isActive ? " active" : ""}`
          }
          onClick={onNavigate}
        >
          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
          <span>{itemLabel}</span>
        </NavLink>
      ))}
    </div>
  );
  };

  return (
    <nav aria-label="Primary navigation">
      {renderGroup("Workspace", primaryNav)}
      {renderGroup("Operations", secondaryNav)}
    </nav>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout, resetDemo } = useShowcase();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!user) return null;
  const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="sidebar">
        <div className="brand">
          <img src="/st-kisa-logo.jpeg" alt="" />
          <div>
            <strong>St. Kisa Youth</strong>
            <span>Self-Help Group</span>
          </div>
        </div>
        <Navigation />
        <div className="sidebar-bottom">
          <button className="sidebar-action" type="button" onClick={resetDemo}>
            <RotateCcw size={19} aria-hidden="true" />
            Reset showcase data
          </button>
          <button className="profile-card profile-button" type="button" onClick={logout}>
            <div className="avatar avatar-admin">{user.initials}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{roleLabel}</span>
            </div>
            <LogOut size={17} aria-label="Log out" />
          </button>
        </div>
      </aside>

      <div className="mobile-header">
        <button
          className="icon-button"
          type="button"
          aria-label="Open navigation"
          onClick={() => setMenuOpen(true)}
        >
          <Menu />
        </button>
        <div className="brand mobile-brand">
          <img src="/st-kisa-logo.jpeg" alt="" />
          <strong>St. Kisa Youth</strong>
        </div>
        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <div className="drawer-panel">
            <div className="drawer-head">
              <div className="brand">
                <img src="/st-kisa-logo.jpeg" alt="" />
                <strong>St. Kisa Youth</strong>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close navigation"
                onClick={() => setMenuOpen(false)}
              >
                <X />
              </button>
            </div>
            <Navigation onNavigate={() => setMenuOpen(false)} />
          </div>
          <button
            className="drawer-scrim"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}

      <section className="workspace">
        <header className="topbar">
          <label className="global-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search portal</span>
            <input placeholder="Search members, receipts, reports..." />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <button className="icon-button notification" type="button" aria-label="Notifications" onClick={() => navigate("/welfare")}>
              <Bell size={20} />
              <span aria-hidden="true" />
            </button>
            <button className="user-menu" type="button" onClick={logout} aria-label="Log out">
              <span className="avatar avatar-admin">{user.initials}</span>
              <span>
                <strong>{user.name}</strong>
                <small>{roleLabel}</small>
              </span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer>
          <BookOpenCheck size={15} aria-hidden="true" />
          Netlify showcase · Browser-persisted demonstration data
        </footer>
      </section>
    </div>
  );
}
