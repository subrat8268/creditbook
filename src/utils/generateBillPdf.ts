import * as Print from 'expo-print';

export interface BillItem {
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BusinessDetails {
  name: string;
  address?: string;
  phone?: string;
  gstin?: string;
}

export interface BankDetails {
  bankName: string;
  accountNo: string;
  ifsc: string;
}

export interface BillMeta {
  invoiceNumber: string;
  date: string;
  subtotal: number;
  taxAmount: number;
  loadingCharge: number;
  bankDetails?: BankDetails;
}

export async function generateBillPdf(
  items: BillItem[],
  businessDetails: BusinessDetails,
  grandTotal: number,
  customerName: string,
  meta: BillMeta
): Promise<string> {
  const tableRows = items
    .map(
      (item, index) => `
    <tr>
      <td class="text-center">${index + 1}</td>
      <td>${item.name}</td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-right">₹${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td class="text-right">₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Invoice - ${meta.invoiceNumber}</title>
      <style>
        @page {
          margin: 20px;
        }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
          padding: 20px;
          background-color: #fff;
        }
        h1, h2, h3, h4, h5, h6 {
          margin: 0;
          padding: 0;
          color: #111;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #222;
        }
        .header h1 {
          font-size: 28px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }
        .header p {
          margin: 2px 0;
          font-size: 13px;
          color: #555;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .billing-to, .invoice-info {
          width: 48%;
        }
        .section-title {
          font-size: 12px;
          text-transform: uppercase;
          color: #777;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        .billing-to strong, .invoice-info strong {
          font-size: 16px;
          display: block;
          margin-bottom: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f9f9f9;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
          color: #444;
          text-align: left;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .totals-section {
          width: 50%;
          float: right;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .total-row.grand-total {
          font-weight: bold;
          font-size: 18px;
          border-bottom: none;
          border-top: 2px solid #222;
          padding-top: 10px;
          margin-top: 5px;
          color: #000;
        }
        .clear {
          clear: both;
        }
        .footer-details {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .bank-details {
          width: 50%;
          font-size: 12px;
          color: #555;
        }
        .bank-details p {
          margin: 3px 0;
        }
        .signature {
          margin-top: 40px;
          text-align: left;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>

      <div class="header">
        <h1>${businessDetails.name}</h1>
        ${businessDetails.address ? `<p>${businessDetails.address}</p>` : ''}
        ${businessDetails.phone ? `<p>Phone: ${businessDetails.phone}</p>` : ''}
        ${businessDetails.gstin ? `<p><strong>GSTIN:</strong> ${businessDetails.gstin}</p>` : ''}
      </div>

      <div class="invoice-details">
        <div class="billing-to">
          <div class="section-title">Billed To</div>
          <strong>${customerName}</strong>
        </div>
        <div class="invoice-info text-right">
          <div class="section-title" style="text-align: right;">Invoice Details</div>
          <p style="margin: 0;"><strong>Invoice No:</strong> ${meta.invoiceNumber}</p>
          <p style="margin: 4px 0 0 0;"><strong>Date:</strong> ${meta.date}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 5%;">#</th>
            <th style="width: 45%;">Item Description</th>
            <th class="text-center" style="width: 10%;">Qty</th>
            <th class="text-right" style="width: 20%;">Rate</th>
            <th class="text-right" style="width: 20%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>₹${meta.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        ${
          meta.taxAmount > 0
            ? `
        <div class="total-row">
          <span>Tax Amount:</span>
          <span>₹${meta.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>`
            : ''
        }
        ${
          meta.loadingCharge > 0
            ? `
        <div class="total-row">
          <span>Loading/Handling:</span>
          <span>₹${meta.loadingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>`
            : ''
        }
        <div class="total-row grand-total">
          <span>Grand Total:</span>
          <span>₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div class="clear"></div>

      <div class="footer-details">
        ${
          meta.bankDetails
            ? `
        <div class="bank-details">
          <div class="section-title">Bank Details</div>
          <p><strong>Bank:</strong> ${meta.bankDetails.bankName}</p>
          <p><strong>A/C No:</strong> ${meta.bankDetails.accountNo}</p>
          <p><strong>IFSC:</strong> ${meta.bankDetails.ifsc}</p>
        </div>`
            : '<div class="bank-details"><p>Thank you for your business!</p></div>'
        }
      </div>

      <div class="signature">
        <p>Authorized Signatory</p>
        <p>___________________</p>
      </div>

    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}
