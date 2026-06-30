import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  contributions as seedContributions,
  members as seedMembers,
  type Contribution,
  type Member
} from "../data/mock";
import type { ContributionType } from "../lib/finance";

export type Role =
  | "ADMIN"
  | "CHAIRPERSON"
  | "TREASURER"
  | "SECRETARY"
  | "MEMBER"
  | "AUDITOR";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  memberId: string | null;
  initials: string;
}

export interface WelfareRequest {
  id: string;
  memberId: string;
  memberName: string;
  category: string;
  amount: number;
  description: string;
  status: "Pending verification" | "Approved" | "Rejected";
  createdAt: string;
}

export interface RefundRequest {
  id: string;
  memberId: string;
  memberName: string;
  requestedAmount: number;
  processingFee: number;
  deductions: number;
  netPayable: number;
  method: string;
  reason: string;
  status: "Verification" | "Approved" | "Scheduled";
  createdAt: string;
}

export interface Investment {
  id: string;
  instrument: string;
  institution: string;
  principal: number;
  rate: number;
  maturityDate: string;
  expectedIncome: number;
  status: "Proposed" | "Active" | "Matured";
}

export interface StoredDocument {
  id: string;
  memberId: string;
  category: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  dataUrl: string;
}

interface ShowcaseData {
  members: Member[];
  contributions: Contribution[];
  welfareRequests: WelfareRequest[];
  refunds: RefundRequest[];
  investments: Investment[];
  documents: StoredDocument[];
}

interface ContributionInput {
  memberId: string;
  type: ContributionType;
  method: "M-Pesa" | "Bank" | "Cash";
  reference: string;
  amount: number;
}

interface ShowcaseContextValue extends ShowcaseData {
  user: DemoUser | null;
  accounts: Array<DemoUser & { password: string }>;
  login: (email: string, password: string) => boolean;
  quickLogin: (role: Role) => void;
  logout: () => void;
  resetDemo: () => void;
  addMember: (input: Omit<Member, "id" | "initials" | "balance" | "welfare" | "tableBanking">) => Member;
  addContribution: (input: ContributionInput) => Contribution;
  addWelfareRequest: (input: Pick<WelfareRequest, "memberId" | "category" | "amount" | "description">) => WelfareRequest;
  addRefundRequest: (input: Pick<RefundRequest, "memberId" | "requestedAmount" | "method" | "reason">) => RefundRequest;
  addInvestment: (input: Omit<Investment, "id" | "expectedIncome" | "status">) => Investment;
  addDocument: (input: Omit<StoredDocument, "id" | "uploadedAt">) => StoredDocument;
  can: (capability: Capability) => boolean;
}

export type Capability =
  | "members:view"
  | "members:create"
  | "contributions:create"
  | "accounting:view"
  | "welfare:view"
  | "refunds:view"
  | "investments:view"
  | "reports:view"
  | "documents:view";

const STORAGE_KEY = "sky_showcase_data_v3";
const SESSION_KEY = "sky_showcase_session_v3";
const DEMO_PASSWORD = "Demo@2026";

export const demoAccounts: Array<DemoUser & { password: string }> = [
  {
    id: "demo-admin",
    name: "Admin Demo",
    email: "admin@stkisa.org",
    password: DEMO_PASSWORD,
    role: "ADMIN",
    memberId: "SKY-001",
    initials: "AD"
  },
  {
    id: "demo-treasurer",
    name: "Peter Wafula",
    email: "treasurer@stkisa.org",
    password: DEMO_PASSWORD,
    role: "TREASURER",
    memberId: "SKY-002",
    initials: "PW"
  },
  {
    id: "demo-member",
    name: "David Wekesa",
    email: "member@stkisa.org",
    password: DEMO_PASSWORD,
    role: "MEMBER",
    memberId: "SKY-004",
    initials: "DW"
  }
];

const seedData: ShowcaseData = {
  members: seedMembers,
  contributions: seedContributions,
  welfareRequests: [
    {
      id: "WF-2026-013",
      memberId: "SKY-004",
      memberName: "David Wekesa",
      category: "Medical emergency",
      amount: 12500,
      description: "Verified outpatient treatment support.",
      status: "Pending verification",
      createdAt: "2026-06-28T09:30:00.000Z"
    },
    {
      id: "WF-2026-012",
      memberId: "SKY-005",
      memberName: "Lilian Nekesa",
      category: "Bereavement",
      amount: 8000,
      description: "Family bereavement support.",
      status: "Approved",
      createdAt: "2026-06-24T12:00:00.000Z"
    }
  ],
  refunds: [
    {
      id: "RF-2026-007",
      memberId: "SKY-002",
      memberName: "Peter Wafula",
      requestedAmount: 9500,
      processingFee: 50,
      deductions: 500,
      netPayable: 8950,
      method: "M-Pesa",
      reason: "Partial withdrawal",
      status: "Approved",
      createdAt: "2026-06-22T11:00:00.000Z"
    }
  ],
  investments: [
    {
      id: "INV-001",
      instrument: "Treasury bill",
      institution: "Central Bank of Kenya",
      principal: 100000,
      rate: 12.4,
      maturityDate: "2026-12-18",
      expectedIncome: 6200,
      status: "Active"
    }
  ],
  documents: []
};

const permissions: Record<Capability, Role[]> = {
  "members:view": ["ADMIN", "CHAIRPERSON", "SECRETARY", "TREASURER", "AUDITOR"],
  "members:create": ["ADMIN", "CHAIRPERSON", "SECRETARY"],
  "contributions:create": ["ADMIN", "CHAIRPERSON", "TREASURER"],
  "accounting:view": ["ADMIN", "CHAIRPERSON", "TREASURER", "AUDITOR"],
  "welfare:view": ["ADMIN", "CHAIRPERSON", "TREASURER", "SECRETARY", "MEMBER", "AUDITOR"],
  "refunds:view": ["ADMIN", "CHAIRPERSON", "TREASURER", "SECRETARY", "MEMBER", "AUDITOR"],
  "investments:view": ["ADMIN", "CHAIRPERSON", "TREASURER", "AUDITOR"],
  "reports:view": ["ADMIN", "CHAIRPERSON", "TREASURER", "SECRETARY", "AUDITOR"],
  "documents:view": ["ADMIN", "CHAIRPERSON", "TREASURER", "SECRETARY", "MEMBER", "AUDITOR"]
};

const ShowcaseContext = createContext<ShowcaseContextValue | null>(null);

function loadData(): ShowcaseData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as ShowcaseData) : structuredClone(seedData);
  } catch {
    return structuredClone(seedData);
  }
}

function loadSession(): DemoUser | null {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? (JSON.parse(saved) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function ShowcaseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ShowcaseData>(loadData);
  const [user, setUser] = useState<DemoUser | null>(loadSession);

  function persist(next: ShowcaseData) {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function establishSession(account: DemoUser) {
    setUser(account);
    localStorage.setItem(SESSION_KEY, JSON.stringify(account));
  }

  function login(email: string, password: string) {
    const account = demoAccounts.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase() &&
        candidate.password === password
    );
    if (!account) return false;
    const { password: _password, ...safeAccount } = account;
    establishSession(safeAccount);
    return true;
  }

  function quickLogin(role: Role) {
    const account =
      demoAccounts.find((candidate) => candidate.role === role) ?? demoAccounts[0]!;
    const { password: _password, ...safeAccount } = account;
    establishSession(safeAccount);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }

  function resetDemo() {
    const next = structuredClone(seedData);
    persist(next);
  }

  function addMember(
    input: Omit<Member, "id" | "initials" | "balance" | "welfare" | "tableBanking">
  ) {
    const id = `SKY-${String(
      Math.max(...data.members.map((member) => Number(member.id.split("-")[1]))) + 1
    ).padStart(3, "0")}`;
    const initials = input.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const member: Member = {
      ...input,
      id,
      initials,
      balance: 0,
      welfare: 0,
      tableBanking: 0
    };
    persist({ ...data, members: [...data.members, member] });
    return member;
  }

  function addContribution(input: ContributionInput) {
    const member = data.members.find((item) => item.id === input.memberId);
    if (!member) throw new Error("Member not found.");
    const contribution: Contribution = {
      id: `RCPT-${String(data.contributions.length + 100).padStart(4, "0")}`,
      date: new Date().toISOString(),
      memberId: member.id,
      memberName: member.name,
      type: input.type,
      method: input.method,
      reference: input.reference,
      amount: input.amount,
      status: input.method === "Cash" ? "Pending review" : "Matched"
    };
    const members = data.members.map((item) =>
      item.id === input.memberId
        ? {
            ...item,
            balance: item.balance + input.amount,
            welfare:
              item.welfare +
              (input.type === "Welfare kitty" ? input.amount : 0),
            tableBanking:
              item.tableBanking +
              (input.type === "Table banking" ? input.amount : 0)
          }
        : item
    );
    persist({
      ...data,
      members,
      contributions: [contribution, ...data.contributions]
    });
    return contribution;
  }

  function addWelfareRequest(
    input: Pick<WelfareRequest, "memberId" | "category" | "amount" | "description">
  ) {
    const member = data.members.find((item) => item.id === input.memberId);
    if (!member) throw new Error("Member not found.");
    const request: WelfareRequest = {
      ...input,
      id: `WF-2026-${String(data.welfareRequests.length + 14).padStart(3, "0")}`,
      memberName: member.name,
      status: "Pending verification",
      createdAt: new Date().toISOString()
    };
    persist({ ...data, welfareRequests: [request, ...data.welfareRequests] });
    return request;
  }

  function addRefundRequest(
    input: Pick<RefundRequest, "memberId" | "requestedAmount" | "method" | "reason">
  ) {
    const member = data.members.find((item) => item.id === input.memberId);
    if (!member) throw new Error("Member not found.");
    const processingFee = 50;
    const deductions = member.status === "Arrears" ? 500 : 0;
    const request: RefundRequest = {
      ...input,
      id: `RF-2026-${String(data.refunds.length + 8).padStart(3, "0")}`,
      memberName: member.name,
      processingFee,
      deductions,
      netPayable: Math.max(0, input.requestedAmount - processingFee - deductions),
      status: "Verification",
      createdAt: new Date().toISOString()
    };
    persist({ ...data, refunds: [request, ...data.refunds] });
    return request;
  }

  function addInvestment(
    input: Omit<Investment, "id" | "expectedIncome" | "status">
  ) {
    const investment: Investment = {
      ...input,
      id: `INV-${String(data.investments.length + 1).padStart(3, "0")}`,
      expectedIncome: Math.round(
        input.principal * (input.rate / 100) * 0.5
      ),
      status: "Proposed"
    };
    persist({ ...data, investments: [investment, ...data.investments] });
    return investment;
  }

  function addDocument(
    input: Omit<StoredDocument, "id" | "uploadedAt">
  ) {
    const document: StoredDocument = {
      ...input,
      id: `DOC-${String(data.documents.length + 1).padStart(4, "0")}`,
      uploadedAt: new Date().toISOString()
    };
    persist({ ...data, documents: [document, ...data.documents] });
    return document;
  }

  const value = useMemo<ShowcaseContextValue>(
    () => ({
      ...data,
      user,
      accounts: demoAccounts,
      login,
      quickLogin,
      logout,
      resetDemo,
      addMember,
      addContribution,
      addWelfareRequest,
      addRefundRequest,
      addInvestment,
      addDocument,
      can: (capability) =>
        user ? permissions[capability].includes(user.role) : false
    }),
    [data, user]
  );

  return (
    <ShowcaseContext.Provider value={value}>
      {children}
    </ShowcaseContext.Provider>
  );
}

export function useShowcase() {
  const value = useContext(ShowcaseContext);
  if (!value) throw new Error("useShowcase must be used within ShowcaseProvider");
  return value;
}
