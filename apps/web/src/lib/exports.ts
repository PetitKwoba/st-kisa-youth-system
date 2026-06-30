import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import type { Contribution, Member } from "../data/mock";

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportMemberStatementPdf(
  member: Member,
  contributions: Contribution[]
) {
  const pdf = new jsPDF();
  pdf.setTextColor(11, 59, 36);
  pdf.setFontSize(18);
  pdf.text("St. Kisa Youth Self-Help Group", 18, 22);
  pdf.setTextColor(90, 105, 95);
  pdf.setFontSize(10);
  pdf.text("Member contribution statement", 18, 29);
  pdf.setTextColor(23, 34, 27);
  pdf.setFontSize(11);
  pdf.text(`Member: ${member.name}`, 18, 43);
  pdf.text(`Registration number: ${member.id}`, 18, 50);
  pdf.text(`Status: ${member.status}`, 18, 57);
  pdf.setFontSize(15);
  pdf.text(`Closing balance: KES ${member.balance.toLocaleString()}`, 18, 70);
  pdf.setFontSize(10);
  pdf.text("Recent transactions", 18, 84);
  let y = 94;
  contributions.slice(0, 12).forEach((item) => {
    pdf.text(
      `${new Date(item.date).toLocaleDateString()}  ${item.type}  KES ${item.amount.toLocaleString()}  ${item.reference}`,
      18,
      y
    );
    y += 8;
  });
  pdf.save(`${member.id}-statement.pdf`);
}

export function exportMemberRegisterExcel(members: Member[]) {
  const worksheet = XLSX.utils.json_to_sheet(
    members.map((member) => ({
      "Registration No.": member.id,
      Name: member.name,
      Phone: member.phone,
      Email: member.email,
      Status: member.status,
      Position: member.position,
      Joined: member.joined,
      "Balance (KES)": member.balance,
      "Welfare (KES)": member.welfare,
      "Table Banking (KES)": member.tableBanking
    }))
  );
  worksheet["!cols"] = [
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 26 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 }
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Member Register");
  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveBlob(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    "st-kisa-member-register.xlsx"
  );
}

export function exportTableExcel(
  filename: string,
  sheetName: string,
  rows: Array<Record<string, string | number>>
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveBlob(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    filename
  );
}

export function exportSummaryPdf(title: string, lines: string[]) {
  const pdf = new jsPDF();
  pdf.setTextColor(11, 59, 36);
  pdf.setFontSize(18);
  pdf.text("St. Kisa Youth Self-Help Group", 18, 22);
  pdf.setFontSize(14);
  pdf.text(title, 18, 34);
  pdf.setTextColor(23, 34, 27);
  pdf.setFontSize(10);
  lines.forEach((line, index) => pdf.text(line, 18, 50 + index * 8));
  pdf.save(`${title.toLowerCase().replaceAll(" ", "-")}.pdf`);
}
