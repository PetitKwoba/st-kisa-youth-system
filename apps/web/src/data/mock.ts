import type { ContributionType } from "../lib/finance";

export type MemberStatus =
  | "Active"
  | "Pending"
  | "Inactive"
  | "Suspended"
  | "Arrears";

export interface Member {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  status: MemberStatus;
  position: string;
  joined: string;
  balance: number;
  welfare: number;
  tableBanking: number;
}

export interface Contribution {
  id: string;
  date: string;
  memberId: string;
  memberName: string;
  type: ContributionType;
  method: "M-Pesa" | "Bank" | "Cash";
  reference: string;
  amount: number;
  status: "Matched" | "Pending review";
}

export const members: Member[] = [
  {
    id: "SKY-001",
    name: "Mary Nasimiyu",
    initials: "MN",
    phone: "+254 712 345 601",
    email: "mary@example.org",
    status: "Active",
    position: "Chairperson",
    joined: "12 Jan 2024",
    balance: 12500,
    welfare: 2750,
    tableBanking: 9750
  },
  {
    id: "SKY-002",
    name: "Peter Wafula",
    initials: "PW",
    phone: "+254 722 145 602",
    email: "peter@example.org",
    status: "Active",
    position: "Treasurer",
    joined: "12 Jan 2024",
    balance: 11250,
    welfare: 2750,
    tableBanking: 8500
  },
  {
    id: "SKY-003",
    name: "Faith Nanjala",
    initials: "FN",
    phone: "+254 733 245 603",
    email: "faith@example.org",
    status: "Pending",
    position: "Secretary",
    joined: "12 Jan 2024",
    balance: 10000,
    welfare: 2500,
    tableBanking: 7500
  },
  {
    id: "SKY-004",
    name: "David Wekesa",
    initials: "DW",
    phone: "+254 742 345 604",
    email: "david@example.org",
    status: "Arrears",
    position: "Member",
    joined: "03 Feb 2024",
    balance: 7750,
    welfare: 1750,
    tableBanking: 6000
  },
  {
    id: "SKY-005",
    name: "Lilian Nekesa",
    initials: "LN",
    phone: "+254 752 345 605",
    email: "lilian@example.org",
    status: "Active",
    position: "Member",
    joined: "03 Feb 2024",
    balance: 9250,
    welfare: 2500,
    tableBanking: 6750
  },
  {
    id: "SKY-006",
    name: "Kevin Barasa",
    initials: "KB",
    phone: "+254 762 345 606",
    email: "kevin@example.org",
    status: "Inactive",
    position: "Member",
    joined: "18 Mar 2024",
    balance: 4500,
    welfare: 1500,
    tableBanking: 3000
  }
];

export const contributions: Contribution[] = [
  {
    id: "RCPT-0098",
    date: "29 Jun 2026",
    memberId: "SKY-001",
    memberName: "Mary Nasimiyu",
    type: "Welfare kitty",
    method: "M-Pesa",
    reference: "TGY8LQ21AZ",
    amount: 250,
    status: "Matched"
  },
  {
    id: "RCPT-0097",
    date: "29 Jun 2026",
    memberId: "SKY-002",
    memberName: "Peter Wafula",
    type: "Table banking",
    method: "M-Pesa",
    reference: "TGY3ZR09KU",
    amount: 1000,
    status: "Matched"
  },
  {
    id: "RCPT-0096",
    date: "28 Jun 2026",
    memberId: "SKY-005",
    memberName: "Lilian Nekesa",
    type: "Welfare kitty",
    method: "Bank",
    reference: "EQT-884103",
    amount: 250,
    status: "Matched"
  },
  {
    id: "RCPT-0095",
    date: "28 Jun 2026",
    memberId: "SKY-004",
    memberName: "David Wekesa",
    type: "Fine",
    method: "Cash",
    reference: "CASH-0048",
    amount: 200,
    status: "Pending review"
  }
];

export const activity = [
  {
    title: "Contribution batch matched",
    detail: "71 June welfare payments posted",
    time: "18 min ago",
    tone: "green"
  },
  {
    title: "Member application reviewed",
    detail: "SKY-086 moved to final approval",
    time: "2 hrs ago",
    tone: "gold"
  },
  {
    title: "Refund approved",
    detail: "RF-2026-007 · Net KES 8,950",
    time: "Yesterday",
    tone: "red"
  },
  {
    title: "Meeting minutes published",
    detail: "Executive Committee · June 2026",
    time: "Yesterday",
    tone: "blue"
  }
];

export const monthlyTrend = [
  { month: "Jan", value: 49 },
  { month: "Feb", value: 56 },
  { month: "Mar", value: 63 },
  { month: "Apr", value: 70 },
  { month: "May", value: 76 },
  { month: "Jun", value: 86 }
];

export const accounts = [
  { code: "1100", name: "Main cashbox", type: "Asset", balance: 32500 },
  { code: "1105", name: "Cash at bank", type: "Asset", balance: 486250 },
  { code: "1110", name: "Mobile money (M-Pesa)", type: "Asset", balance: 127400 },
  {
    code: "2100",
    name: "Members' savings/deposits payable",
    type: "Liability",
    balance: 640000
  },
  {
    code: "3100",
    name: "Registration fees reserve",
    type: "Equity",
    balance: 17000
  }
];
