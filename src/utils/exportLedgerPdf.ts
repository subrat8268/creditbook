import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import type { LedgerExport } from "../api/exportCustomer";
import { formatINR } from "@/src/utils/format";

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function signAmount(entry: { type: "bill" | "payment"; amount: number }): string {
  return entry.type === "bill"
    ? `+${formatINR(entry.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `-${formatINR(entry.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusColor(status: string): string {
  if (status === "Paid") return "#16A34A";
  if (status === "Partially Paid") return "#D97706";
  if (status === "Overdue") return "#DC2626";
  return "#6B7280";
}

function entryRow(entry: {
  date: string;
  description: string;
  amount: number;
  type: "bill" | "payment";
  status: string;
  balance_after: number;
  items?: { product_name: string; quantity: number; rate: number; subtotal: number }[];
}): string {
  const rows: string[] = [];

  rows.push(`<tr class="entry-row ${entry.type}">
    <td class="date">${formatDate(entry.date)}</td>
    <td class="desc">${entry.description}</td>
    <td class="amount ${entry.type === "bill" ? "cr" : "dr"}">${signAmount(entry)}</td>
    <td class="status" style="color:${statusColor(entry.status)}">${entry.status}</td>
    <td class="balance">${formatINR(entry.balance_after, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
  </tr>`);

  if (entry.type === "bill" && entry.items && entry.items.length > 0) {
    for (const item of entry.items) {
      rows.push(`<tr class="item-row">
        <td></td>
        <td class="item-desc">${item.quantity} × ${item.product_name} @ ${formatINR(item.rate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td></td>
        <td></td>
        <td class="item-subtotal">${formatINR(item.subtotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>`);
    }
  }

  return rows.join("");
}

export async function generateLedgerPdf(ledger: LedgerExport): Promise<string> {
  const dateRange =
    ledger.date_from && ledger.date_to
      ? `${formatDate(ledger.date_from)} — ${formatDate(ledger.date_to)}`
      : "All Time";

  const entryRows = ledger.entries.map(entryRow).join("");

  const emptyRows =
    ledger.entries.length === 0
      ? `<tr><td colspan="5" class="empty">No entries in this period</td></tr>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ledger — ${ledger.customer_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #1F2937; background: #fff; padding: 24px 20px; }

    .header { border-bottom: 2px solid #1F2937; padding-bottom: 12px; margin-bottom: 16px; }
    .biz-name { font-size: 18px; font-weight: 800; color: #111827; }
    .biz-sub { font-size: 11px; color: #6B7280; margin-top: 2px; }
    .gen-date { font-size: 10px; color: #9CA3AF; text-align: right; margin-top: -20px; }

    .customer-box { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .customer-name { font-size: 14px; font-weight: 700; color: #111827; }
    .customer-phone { font-size: 11px; color: #6B7280; }
    .date-range-label { font-size: 11px; color: #6B7280; text-align: right; }
    .date-range { font-size: 12px; font-weight: 600; color: #374151; }

    .summary { display: flex; gap: 12px; margin-bottom: 16px; }
    .summary-card { flex: 1; background: #F3F4F6; border-radius: 8px; padding: 8px 12px; }
    .summary-label { font-size: 10px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-value { font-size: 15px; font-weight: 700; margin-top: 2px; }
    .summary-value.cr { color: #16A34A; }
    .summary-value.dr { color: #DC2626; }
    .summary-value.neutral { color: #374151; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    thead th { background: #1F2937; color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; padding: 8px 10px; text-align: left; }
    thead th:last-child { text-align: right; }
    thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }

    .entry-row td { padding: 7px 10px; border-bottom: 1px solid #F3F4F6; vertical-align: top; }
    .entry-row.bill { background: #FEFCE8; }
    .entry-row.payment { background: #F0FDF4; }
    .entry-row:hover td { background: #F9FAFB; }

    .date { font-size: 11px; color: #6B7280; white-space: nowrap; }
    .desc { font-size: 12px; font-weight: 500; color: #111827; }
    .amount { font-size: 12px; font-weight: 700; text-align: right; white-space: nowrap; }
    .amount.cr { color: #16A34A; }
    .amount.dr { color: #DC2626; }
    .status { font-size: 10px; font-weight: 600; text-align: right; }
    .balance { font-size: 12px; font-weight: 600; color: #374151; text-align: right; white-space: nowrap; }

    .item-row td { padding: 2px 10px 2px 24px; }
    .item-desc { font-size: 11px; color: #6B7280; }
    .item-subtotal { font-size: 11px; color: #6B7280; text-align: right; }

    .empty td { text-align: center; color: #9CA3AF; padding: 24px; font-style: italic; }

    .footer { border-top: 1px solid #E5E7EB; padding-top: 10px; font-size: 10px; color: #9CA3AF; text-align: center; }
  </style>
</head>
<body>

  <div class="header">
    <div class="biz-name">${ledger.business_name}</div>
    <div class="biz-sub">Customer Ledger Statement</div>
    <div class="gen-date">Generated ${formatDate(ledger.generated_at)}</div>
  </div>

  <div class="customer-box">
    <div>
      <div class="customer-name">${ledger.customer_name}</div>
      ${ledger.customer_phone ? `<div class="customer-phone">${ledger.customer_phone}</div>` : ""}
    </div>
    <div>
      <div class="date-range-label">Period</div>
      <div class="date-range">${dateRange}</div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="summary-label">Total Bills</div>
      <div class="summary-value neutral">${ledger.total_bills}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Total Payments</div>
      <div class="summary-value cr">${ledger.total_payments}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Balance Due</div>
      <div class="summary-value ${ledger.closing_balance > 0 ? "dr" : "cr"}">${formatINR(ledger.closing_balance, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th style="text-align:right">Amount</th>
        <th style="text-align:right">Status</th>
        <th style="text-align:right">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${entryRows || emptyRows}
    </tbody>
  </table>

  <div class="footer">Powered by KredBook</div>

</body>
</html>`;

  return html;
}

export async function shareLedgerPdf(ledger: LedgerExport): Promise<void> {
  const html = await generateLedgerPdf(ledger);
  const { uri } = await Print.printToFileAsync({ html });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: "Share Ledger PDF",
    UTI: "com.adobe.pdf",
  });
}
