import { format } from "date-fns";
import { enUS, hi } from "date-fns/locale";
import { formatINR } from "@/src/utils/format";

type ShareLocale = "en" | "hi";

function formatDDMMMYYYY(locale: ShareLocale, date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  return format(safe, "dd MMM yyyy", { locale: locale === "hi" ? hi : enUS });
}

export function buildEntryShareMessage(params: {
  locale: ShareLocale;
  customerName: string;
  amount: number;
  entryDate: Date | string;
  dueDate?: Date | string | null;
  businessName: string;
}): string {
  const { locale, customerName, amount, entryDate, dueDate, businessName } =
    params;

  const amountText = formatINR(amount);
  const entryDateText = formatDDMMMYYYY(locale, entryDate);
  const dueDateText = dueDate
    ? formatDDMMMYYYY(locale, dueDate)
    : locale === "hi"
      ? "कोई तिथि नहीं"
      : "No due date";

  if (locale === "hi") {
    return (
      `नमस्ते ${customerName}, ${amountText} की एंट्री ${entryDateText} को दर्ज की गई।\n` +
      `देय तिथि: ${dueDateText}। — ${businessName}`
    );
  }

  return (
    `Hi ${customerName}, your entry of ${amountText} dated ${entryDateText} is recorded.\n` +
    `Due: ${dueDateText}. — ${businessName}`
  );
}

export function buildPaymentShareMessage(params: {
  locale: ShareLocale;
  customerName: string;
  amount: number;
  paymentDate: Date | string;
  remainingBalance: number;
  businessName: string;
}): string {
  const {
    locale,
    customerName,
    amount,
    paymentDate,
    remainingBalance,
    businessName,
  } = params;

  const amountText = formatINR(amount);
  const dateText = formatDDMMMYYYY(locale, paymentDate);
  const balanceText = formatINR(remainingBalance);

  if (locale === "hi") {
    return (
      `नमस्ते ${customerName}, ${amountText} का भुगतान ${dateText} को मिला।\n` +
      `शेष बकाया: ${balanceText}। — ${businessName}`
    );
  }

  return (
    `Hi ${customerName}, payment of ${amountText} received on ${dateText}.\n` +
    `Remaining balance: ${balanceText}. — ${businessName}`
  );
}

export function buildLedgerShareMessage(params: {
  locale: ShareLocale;
  customerName: string;
  balance: number;
  businessName: string;
  publicLedgerUrl: string;
}): string {
  const { locale, customerName, balance, businessName, publicLedgerUrl } =
    params;

  const balanceText = formatINR(balance);

  if (locale === "hi") {
    return (
      `नमस्ते ${customerName}, ${businessName} के साथ आपका खाता सारांश।\n` +
      `कुल बकाया: ${balanceText}। खाता देखें: ${publicLedgerUrl}`
    );
  }

  return (
    `Hi ${customerName}, here is your account summary with ${businessName}.\n` +
    `Total due: ${balanceText}. View ledger: ${publicLedgerUrl}`
  );
}
