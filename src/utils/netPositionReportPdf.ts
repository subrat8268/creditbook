import { NetPositionCustomer, NetPositionReport, NetPositionSupplier } from "@/src/api/dashboard";
import { formatINR } from "@/src/utils/format";

export function buildNetPositionReportHtml(
  report: Pick<
    NetPositionReport,
    "totalReceivables" | "totalPayables" | "netBalance" | "topCustomers" | "topSuppliers"
  >,
  businessName: string,
) {
  const rows = (items: { name: string; amount: number }[]) =>
    items
      .map(
        (i) =>
          `<tr><td>${i.name}</td><td style="text-align:right;font-weight:700">${formatINR(i.amount)}</td></tr>`,
      )
      .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <style>body{font-family:sans-serif;padding:24px;color:#1C1C1E}h1{font-size:22px}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  td,th{padding:10px;border-bottom:1px solid #E2E8F0;font-size:14px}
  th{background:#F6F7F9;font-weight:700;text-align:left}</style></head>
  <body>
  <h1>${businessName} — Net Position Report</h1>
  <p style="color:#6B7280;font-size:13px">Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
  <table><tr><th>Metric</th><th style="text-align:right">Amount</th></tr>
  <tr><td>Total Receivables</td><td style="text-align:right;color:#2563EB">${formatINR(report.totalReceivables, { showPlusForPositive: true })}</td></tr>
  <tr><td>Total Payables</td><td style="text-align:right;color:#DC2626">${formatINR(-Math.abs(report.totalPayables))}</td></tr>
  <tr><td style="font-weight:700">Net Balance</td><td style="text-align:right;font-weight:800">${formatINR(report.netBalance)}</td></tr>
  </table>
  ${
    report.topCustomers.length > 0
      ? `<h2>Top People Owed</h2><table><tr><th>Person</th><th style="text-align:right">Balance Due</th></tr>${rows(
          report.topCustomers.map((c: NetPositionCustomer) => ({
            name: c.name,
            amount: c.balance,
          })),
        )}</table>`
      : ""
  }
  ${
    report.topSuppliers.length > 0
      ? `<h2>Top Suppliers Owed</h2><table><tr><th>Supplier</th><th style="text-align:right">Amount Owed</th></tr>${rows(
          report.topSuppliers.map((s: NetPositionSupplier) => ({
            name: s.name,
            amount: s.amountOwed,
          })),
        )}</table>`
      : ""
  }
  </body></html>`;
}
