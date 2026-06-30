export interface Contribution {
  id: string;
  date: string;
  memberId: string;
  memberName: string;
  type: string;
  method: string;
  reference: string;
  amount: number;
  status: "Matched" | "Pending review";
}

export const members = [
  { id: "SKY-001", name: "Mary Nasimiyu", status: "Active" },
  { id: "SKY-002", name: "Peter Wafula", status: "Active" },
  { id: "SKY-003", name: "Faith Nanjala", status: "Pending" },
  { id: "SKY-004", name: "David Wekesa", status: "Arrears" }
];

export const contributions: Contribution[] = [];
