import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Accounting } from "./pages/Accounting";
import { Approvals } from "./pages/Approvals";
import { Contributions } from "./pages/Contributions";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Members } from "./pages/Members";
import { Documents, Investments, Refunds, Welfare } from "./pages/Operations";
import { Governance, Reports } from "./pages/PreviewPages";
import { Statements } from "./pages/Statements";
import {
  ShowcaseProvider,
  useShowcase,
  type Capability
} from "./state/ShowcaseContext";
import "./styles.css";

function RequireCapability({
  capability,
  children
}: {
  capability: Capability;
  children: React.ReactNode;
}) {
  const { can } = useShowcase();
  return can(capability) ? children : <Navigate to="/" replace />;
}

function Portal() {
  const { user } = useShowcase();
  if (!user) return <Login />;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<RequireCapability capability="members:view"><Members /></RequireCapability>} />
        <Route path="/contributions" element={<Contributions />} />
        <Route path="/statements" element={<Statements />} />
        <Route path="/accounting" element={<RequireCapability capability="accounting:view"><Accounting /></RequireCapability>} />
        <Route path="/approvals" element={<RequireCapability capability="approvals:view"><Approvals /></RequireCapability>} />
        <Route path="/welfare" element={<RequireCapability capability="welfare:view"><Welfare /></RequireCapability>} />
        <Route path="/refunds" element={<RequireCapability capability="refunds:view"><Refunds /></RequireCapability>} />
        <Route path="/investments" element={<RequireCapability capability="investments:view"><Investments /></RequireCapability>} />
        <Route path="/documents" element={<RequireCapability capability="documents:view"><Documents /></RequireCapability>} />
        <Route path="/governance" element={<Governance />} />
        <Route path="/reports" element={<RequireCapability capability="reports:view"><Reports /></RequireCapability>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ShowcaseProvider>
      <Portal />
    </ShowcaseProvider>
  );
}
