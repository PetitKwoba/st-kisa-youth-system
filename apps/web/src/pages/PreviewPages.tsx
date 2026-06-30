import { Download, FileBarChart, Vote } from "lucide-react";
import { EmptyModule, PageHeader } from "../components/Ui";
import {
  exportMemberRegisterExcel,
  exportSummaryPdf,
  exportTableExcel
} from "../lib/exports";
import { useShowcase } from "../state/ShowcaseContext";

export function Governance() {
  return (
    <>
      <PageHeader eyebrow="Meetings & elections" title="Governance" description="Transparent records for notices, resolutions and leadership." />
      <EmptyModule
        icon={<Vote size={31} />}
        phase="Phase 3"
        title="Governance module is on the roadmap"
        description="The online voting process and retention rules need board confirmation."
        tasks={["Meeting notices and attendance", "Approved minutes and resolutions", "Candidate nomination", "Voting, run-off and handover"]}
      />
    </>
  );
}

export function Reports() {
  const { members, contributions, welfareRequests, refunds } = useShowcase();
  const reports = [
    {
      title: "Member register",
      category: "Membership",
      status: "Updated today",
      run: () => exportMemberRegisterExcel(members)
    },
    {
      title: "Contribution report",
      category: "Collections",
      status: "Current browser data",
      run: () =>
        exportTableExcel(
          "st-kisa-contributions.xlsx",
          "Contributions",
          contributions.map((item) => ({
            Date: new Date(item.date).toLocaleDateString(),
            Member: item.memberName,
            "Member No.": item.memberId,
            Type: item.type,
            Method: item.method,
            Reference: item.reference,
            "Amount (KES)": item.amount,
            Status: item.status
          }))
        )
    },
    {
      title: "Treasurer report",
      category: "Finance",
      status: "June 2026",
      run: () =>
        exportSummaryPdf("Treasurer report", [
          `Members: ${members.length}`,
          `Contributions posted: ${contributions.length}`,
          `Total member balances: KES ${members.reduce((sum, item) => sum + item.balance, 0).toLocaleString()}`,
          `Pending welfare cases: ${welfareRequests.filter((item) => item.status === "Pending verification").length}`,
          `Refund requests: ${refunds.length}`
        ])
    },
    {
      title: "Trial balance",
      category: "Accounting",
      status: "Showcase",
      run: () =>
        exportSummaryPdf("Trial balance", [
          "1105 Cash at bank: KES 486,250",
          "1110 Mobile money: KES 127,400",
          "2100 Member deposits payable: KES 640,000",
          "3100 Registration reserve: KES 17,000"
        ])
    },
    {
      title: "Financial position",
      category: "Accounting",
      status: "Showcase",
      run: () =>
        exportSummaryPdf("Financial position", [
          "Total assets: KES 646,150",
          "Member deposits payable: KES 640,000",
          "Net position: KES 6,150"
        ])
    },
    {
      title: "Request register",
      category: "Controls",
      status: "Current browser data",
      run: () =>
        exportTableExcel(
          "st-kisa-request-register.xlsx",
          "Requests",
          [
            ...welfareRequests.map((item) => ({
              Type: "Welfare",
              Reference: item.id,
              Member: item.memberName,
              "Amount (KES)": item.amount,
              Status: item.status
            })),
            ...refunds.map((item) => ({
              Type: "Refund",
              Reference: item.id,
              Member: item.memberName,
              "Amount (KES)": item.netPayable,
              Status: item.status
            }))
          ]
        )
    }
  ];
  return (
    <>
      <PageHeader eyebrow="Exports & oversight" title="Reports" description="Finance and membership reporting workspace." />
      <section className="report-grid">
        {reports.map(({ title, category, status, run }) => (
          <article className="report-card" key={title}>
            <span><FileBarChart size={21} /></span>
            <div><small>{category}</small><h2>{title}</h2><p>{status}</p></div>
            <button className="button secondary compact" type="button" onClick={run}><Download size={15} /> Download</button>
          </article>
        ))}
      </section>
    </>
  );
}
