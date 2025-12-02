// src/utils/generatePremiumBillPdf.ts
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";

export type BillItem = {
  name: string;
  quantity: number;
  price: number;
  variantName?: string | null;
};

export type StoreInfo = {
  name: string;
  address?: string;
  phone?: string;
  gstin?: string;
  logoUrl?: string | null;
};

export type InvoiceOptions = {
  invoiceNumber?: string;
  date?: string;
  notes?: string;
  upiId?: string;
  discountAmount?: number;
  taxPercent?: number;
  showLogo?: boolean;
};

export async function generateBillPdf(
  items: BillItem[],
  store: StoreInfo,
  totalAmount: number,
  customerName: string,
  options: InvoiceOptions = {}
): Promise<string> {
  try {
    const {
      invoiceNumber = `INV-${Date.now()}`,
      date = new Date().toLocaleDateString(),
      notes = "",
      upiId = options.upiId || "",
      discountAmount = options.discountAmount || 0,
      taxPercent = options.taxPercent || 0,
      showLogo = options.showLogo ?? true,
    } = options;

    // build rows
    const itemRows = items
      .map((it, idx) => {
        const lineTotal = it.price * it.quantity;
        return `
          <tr>
            <td style="padding:6px 8px">${idx + 1}. ${escapeHtml(it.name)}${it.variantName ? ` (${escapeHtml(it.variantName)})` : ""}</td>
            <td style="padding:6px 8px; text-align:center">${it.quantity}</td>
            <td style="padding:6px 8px; text-align:right">₹${formatNumber(it.price)}</td>
            <td style="padding:6px 8px; text-align:right">₹${formatNumber(lineTotal)}</td>
          </tr>
        `;
      })
      .join("");

    // compute discount and tax
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = Number(discountAmount || 0);
    const taxedBase = Math.max(0, subtotal - discount);
    const taxAmount = taxPercent ? (taxedBase * taxPercent) / 100 : 0;
    const grandTotal = Math.round((taxedBase + taxAmount) * 100) / 100;

    // UPI QR image URL via Google Chart API (public)
    const upiQrUrl = upiId
      ? `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(upiPayload(upiId, String(grandTotal)))}`
      : null;

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #222; padding: 18px; }
            .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
            .brand { display:flex; align-items:center; gap:12px }
            .logo { width:80px; height:80px; object-fit:contain; border-radius:8px; }
            h1 { margin:0; font-size:20px; }
            .meta { text-align:right; font-size:12px; color:#444 }
            .section { margin-top:14px; }
            table { width:100%; border-collapse:collapse; font-size:13px; }
            th { text-align:left; padding:8px; border-bottom:2px solid #eee; background:#fafafa; }
            td { border-bottom:1px solid #f1f1f1; }
            .right { text-align:right; }
            .small { font-size:11px; color:#666 }
            .totals { margin-top:10px; width:100%; }
            .totals td { padding:6px 8px; }
            .footer { margin-top:18px; font-size:12px; color:#444; display:flex; justify-content:space-between; align-items:center; }
            .qr { width:120px; height:120px; }
            .invoice-meta { font-size:12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              ${showLogo && store.logoUrl ? `<img src="${store.logoUrl}" class="logo" />` : ""}
              <div>
                <h1>${escapeHtml(store.name)}</h1>
                <div class="small">${escapeHtml(store.address || "")}</div>
                <div class="small">Phone: ${escapeHtml(store.phone || "")}</div>
                ${store.gstin ? `<div class="small">GSTIN: ${escapeHtml(store.gstin)}</div>` : ""}
              </div>
            </div>

            <div class="meta">
              <div class="invoice-meta"><strong>Invoice:</strong> ${escapeHtml(invoiceNumber)}</div>
              <div class="invoice-meta"><strong>Date:</strong> ${escapeHtml(date)}</div>
            </div>
          </div>

          <div class="section">
            <div class="small"><strong>Bill To:</strong> ${escapeHtml(customerName)}</div>
          </div>

          <div class="section">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align:center">Qty</th>
                  <th style="text-align:right">Rate</th>
                  <th style="text-align:right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
          </div>

          <table class="totals">
            <tr>
              <td style="text-align:left">Subtotal</td>
              <td style="text-align:right">₹${formatNumber(subtotal)}</td>
            </tr>
            <tr>
              <td style="text-align:left">Discount</td>
              <td style="text-align:right">₹${formatNumber(discount)}</td>
            </tr>
            <tr>
              <td style="text-align:left">Tax (${formatNumber(taxPercent)}%)</td>
              <td style="text-align:right">₹${formatNumber(taxAmount)}</td>
            </tr>
            <tr>
              <td style="text-align:left"><strong>Grand Total</strong></td>
              <td style="text-align:right"><strong>₹${formatNumber(grandTotal)}</strong></td>
            </tr>
          </table>

          <div class="footer">
            <div>
              <div class="small">Notes: ${escapeHtml(notes)}</div>
              <div class="small">Thank you for your business!</div>
            </div>

            <div style="text-align:center">
              ${upiQrUrl ? `<img src="${upiQrUrl}" class="qr" />` : ""}
              <div class="small">Scan to pay ${upiId ? `(${escapeHtml(upiId)})` : ""}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    // convert to PDF in temp URI
    const { uri } = await Print.printToFileAsync({ html });
    const dest = `${FileSystem.documentDirectory}bill_${Date.now()}.pdf`;

    // copy to persistent location
    await FileSystem.copyAsync({ from: uri, to: dest });

    return dest;
  } catch (err: any) {
    console.error("generatePremiumBillPdf error", err);
    throw new Error(err?.message || "Failed to generate PDF");
  }
}

function escapeHtml(s: string) {
  return String(s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string
  );
}
function formatNumber(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function upiPayload(upiId: string, amount: string) {
  return `upi://pay?pa=${upiId}&pn=&am=${amount}&cu=INR`;
}
