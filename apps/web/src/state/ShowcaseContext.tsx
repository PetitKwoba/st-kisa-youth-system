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
import {
  applyApprovalDecision,
  createApprovalSteps,
  type ApprovalDecision,
  type ApprovalKind,
  type ApprovalRequest
} from "./approval";

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
  status: "Verification" | "Approved" | "Rejected" | "Scheduled";
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
  status: "Proposed" | "Approved" | "Rejected" | "Active" | "Matured";
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
  approvalRequests: ApprovalRequest[];
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
  login: (email: string, password: string) => boolean;
  logout: () => void;
  resetDemo: () => void;
  addMember: (input: Omit<Member, "id" | "initials" | "balance" | "welfare" | "tableBanking">) => Member;
  addContribution: (input: ContributionInput) => Contribution;
  addWelfareRequest: (input: Pick<WelfareRequest, "memberId" | "category" | "amount" | "description">) => WelfareRequest;
  addRefundRequest: (input: Pick<RefundRequest, "memberId" | "requestedAmount" | "method" | "reason">) => RefundRequest;
  addInvestment: (input: Omit<Investment, "id" | "expectedIncome" | "status">) => Investment;
  addDocument: (input: Omit<StoredDocument, "id" | "uploadedAt">) => StoredDocument;
  actOnApproval: (
    requestId: string,
    decision: ApprovalDecision,
    comment: string
  ) => { ok: true } | { ok: false; error: string };
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
  | "documents:view"
  | "approvals:view";

const STORAGE_KEY = "sky_showcase_data_v4";
const SESSION_KEY = "sky_showcase_session_v4";
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
    id: "demo-secretary",
    name: "Faith Nanjala",
    email: "secretary@stkisa.org",
    password: DEMO_PASSWORD,
    role: "SECRETARY",
    memberId: "SKY-003",
    initials: "FN"
  },
  {
    id: "demo-chairperson",
    name: "Mary Nasimiyu",
    email: "chair@stkisa.org",
    password: DEMO_PASSWORD,
    role: "CHAIRPERSON",
    memberId: "SKY-001",
    initials: "MN"
  },
  {
    id: "demo-member",
    name: "David Wekesa",
    email: "member@stkisa.org",
    password: DEMO_PASSWORD,
    role: "MEMBER",
    memberId: "SKY-004",
    initials: "DW"
  },
  {
    id: "demo-auditor",
    name: "Internal Auditor",
    email: "auditor@stkisa.org",
    password: DEMO_PASSWORD,
    role: "AUDITOR",
    memberId: null,
    initials: "IA"
  }
];

function seededApproval(input: {
  id: string;
  kind: ApprovalKind;
  referenceId: string;
  requesterId: string;
  requesterName: string;
  amount: number;
  createdAt: string;
  status?: "Pending" | "Approved";
  evidenceStatus: string;
  policyChecks: string[];
}): ApprovalRequest {
  const status = input.status ?? "Pending";
  const steps = createApprovalSteps(input.kind).map((step) =>
    status === "Approved"
      ? {
          ...step,
          status: "Approved" as const,
          actedBy:
            step.role === "TREASURER"
              ? "Peter Wafula"
              : step.role === "SECRETARY"
                ? "Faith Nanjala"
                : "Mary Nasimiyu",
          actedAt: input.createdAt,
          comment: "Approved in seeded showcase data"
        }
      : step
  );
  return {
    id: input.id,
    kind: input.kind,
    referenceId: input.referenceId,
    requesterId: input.requesterId,
    requesterName: input.requesterName,
    amount: input.amount,
    evidenceStatus: input.evidenceStatus,
    policyChecks: input.policyChecks,
    status,
    steps,
    history: [],
    createdAt: input.createdAt
  };
}

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
  documents: [],
  approvalRequests: [
    seededApproval({
      id: "APR-WF-013",
      kind: "WELFARE",
      referenceId: "WF-2026-013",
      requesterId: "SKY-004",
      requesterName: "David Wekesa",
      amount: 12500,
      evidenceStatus: "Supporting document declared",
      policyChecks: [
        "Membership record available",
        "Arrears review required",
        "Direct facility payment required"
      ],
      createdAt: "2026-06-28T09:30:00.000Z"
    }),
    seededApproval({
      id: "APR-WF-012",
      kind: "WELFARE",
      referenceId: "WF-2026-012",
      requesterId: "SKY-005",
      requesterName: "Lilian Nekesa",
      amount: 8000,
      evidenceStatus: "Evidence verified",
      policyChecks: ["Active membership verified", "Liquidity verified"],
      status: "Approved",
      createdAt: "2026-06-24T12:00:00.000Z"
    }),
    seededApproval({
      id: "APR-RF-007",
      kind: "REFUND",
      referenceId: "RF-2026-007",
      requesterId: "SKY-002",
      requesterName: "Peter Wafula",
      amount: 8950,
      evidenceStatus: "Payment details verified",
      policyChecks: [
        "KES 50 processing fee applied",
        "Electronic payment required"
      ],
      status: "Approved",
      createdAt: "2026-06-22T11:00:00.000Z"
    }),
    seededApproval({
      id: "APR-INV-001",
      kind: "INVESTMENT",
      referenceId: "INV-001",
      requesterId: "SKY-002",
      requesterName: "Peter Wafula",
      amount: 100000,
      evidenceStatus: "Instrument details recorded",
      policyChecks: [
        "Allowed instrument",
        "Within 25% liquidity limit",
        "Monthly reporting required"
      ],
      status: "Approved",
      createdAt: "2026-06-18T08:00:00.000Z"
    })
  ]
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
  "documents:view": ["ADMIN", "CHAIRPERSON", "TREASURER", "SECRETARY", "MEMBER", "AUDITOR"],
  "approvals:view": ["ADMIN", "CHAIRPERSON", "TREASURER", "SECRETARY", "AUDITOR"]
};

const ShowcaseContext = createContext<ShowcaseContextValue | null>(null);

function withoutPassword(
  account: DemoUser & { password: string }
): DemoUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    memberId: account.memberId,
    initials: account.initials
  };
}

function formatPolicyAmount(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

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
    establishSession(withoutPassword(account));
    return true;
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
    const createdAt = new Date().toISOString();
    const id = `WF-2026-${String(data.welfareRequests.length + 14).padStart(3, "0")}`;
    const request: WelfareRequest = {
      ...input,
      id,
      memberName: member.name,
      status: "Pending verification",
      createdAt
    };
    const approval = seededApproval({
      id: `APR-${id}`,
      kind: "WELFARE",
      referenceId: id,
      requesterId: member.id,
      requesterName: member.name,
      amount: input.amount,
      evidenceStatus: "Evidence pending official verification",
      policyChecks: [
        `${member.status} membership status recorded`,
        "Contribution and arrears review required",
        input.category === "Medical emergency"
          ? "Direct facility payment required"
          : "Benefit schedule check required"
      ],
      createdAt
    });
    persist({
      ...data,
      welfareRequests: [request, ...data.welfareRequests],
      approvalRequests: [approval, ...data.approvalRequests]
    });
    return request;
  }

  function addRefundRequest(
    input: Pick<RefundRequest, "memberId" | "requestedAmount" | "method" | "reason">
  ) {
    const member = data.members.find((item) => item.id === input.memberId);
    if (!member) throw new Error("Member not found.");
    const processingFee = 50;
    const deductions = member.status === "Arrears" ? 500 : 0;
    const createdAt = new Date().toISOString();
    const id = `RF-2026-${String(data.refunds.length + 8).padStart(3, "0")}`;
    const netPayable = Math.max(
      0,
      input.requestedAmount - processingFee - deductions
    );
    const request: RefundRequest = {
      ...input,
      id,
      memberName: member.name,
      processingFee,
      deductions,
      netPayable,
      status: "Verification",
      createdAt
    };
    const approval = seededApproval({
      id: `APR-${id}`,
      kind: "REFUND",
      referenceId: id,
      requesterId: member.id,
      requesterName: member.name,
      amount: netPayable,
      evidenceStatus: "Payment method recorded",
      policyChecks: [
        "KES 50 processing fee applied",
        deductions ? `${formatPolicyAmount(deductions)} obligations deducted` : "No obligations deducted",
        netPayable > 2000
          ? "Electronic payment method required"
          : "Payment method within policy"
      ],
      createdAt
    });
    persist({
      ...data,
      refunds: [request, ...data.refunds],
      approvalRequests: [approval, ...data.approvalRequests]
    });
    return request;
  }

  function addInvestment(
    input: Omit<Investment, "id" | "expectedIncome" | "status">
  ) {
    const createdAt = new Date().toISOString();
    const id = `INV-${String(data.investments.length + 1).padStart(3, "0")}`;
    const investment: Investment = {
      ...input,
      id,
      expectedIncome: Math.round(
        input.principal * (input.rate / 100) * 0.5
      ),
      status: "Proposed"
    };
    const approval = seededApproval({
      id: `APR-${id}`,
      kind: "INVESTMENT",
      referenceId: id,
      requesterId: user?.memberId ?? user?.id ?? "system",
      requesterName: user?.name ?? "System user",
      amount: input.principal,
      evidenceStatus: "Instrument and maturity details recorded",
      policyChecks: [
        "Allowed investment instrument",
        "Within provisional 25% liquidity limit",
        "Committee resolution required"
      ],
      createdAt
    });
    persist({
      ...data,
      investments: [investment, ...data.investments],
      approvalRequests: [approval, ...data.approvalRequests]
    });
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

  function actOnApproval(
    requestId: string,
    decision: ApprovalDecision,
    comment: string
  ): { ok: true } | { ok: false; error: string } {
    if (!user) return { ok: false, error: "Sign in to act on requests." };
    const request = data.approvalRequests.find((item) => item.id === requestId);
    if (!request) return { ok: false, error: "Approval request not found." };
    const result = applyApprovalDecision(request, {
      actor: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      decision,
      comment,
      actedAt: new Date().toISOString()
    });
    if (!result.ok) return result;

    const approvalRequests = data.approvalRequests.map((item) =>
      item.id === requestId ? result.request : item
    );
    const welfareRequests = data.welfareRequests.map((item) =>
      item.id === result.request.referenceId
        ? {
            ...item,
            status:
              result.request.status === "Approved"
                ? ("Approved" as const)
                : result.request.status === "Rejected"
                  ? ("Rejected" as const)
                  : ("Pending verification" as const)
          }
        : item
    );
    const refunds = data.refunds.map((item) =>
      item.id === result.request.referenceId
        ? {
            ...item,
            status:
              result.request.status === "Approved"
                ? ("Approved" as const)
                : result.request.status === "Rejected"
                  ? ("Rejected" as const)
                  : ("Verification" as const)
          }
        : item
    );
    const investments = data.investments.map((item) =>
      item.id === result.request.referenceId
        ? {
            ...item,
            status:
              result.request.status === "Approved"
                ? ("Approved" as const)
                : result.request.status === "Rejected"
                  ? ("Rejected" as const)
                  : ("Proposed" as const)
          }
        : item
    );
    persist({
      ...data,
      approvalRequests,
      welfareRequests,
      refunds,
      investments
    });
    return { ok: true };
  }

  const value = useMemo<ShowcaseContextValue>(
    () => ({
      ...data,
      user,
      login,
      logout,
      resetDemo,
      addMember,
      addContribution,
      addWelfareRequest,
      addRefundRequest,
      addInvestment,
      addDocument,
      actOnApproval,
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
