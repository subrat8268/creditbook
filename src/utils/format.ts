type FormatINROptions = {
  currencySymbol?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showPlusForPositive?: boolean;
};

const formatters = new Map<string, Intl.NumberFormat>();

function getInrFormatter(min: number, max: number) {
  const key = `${min}:${max}`;
  const existing = formatters.get(key);
  if (existing) return existing;

  const next = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });
  formatters.set(key, next);
  return next;
}

export function formatINR(amount: number, opts: FormatINROptions = {}): string {
  const {
    currencySymbol = "₹",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showPlusForPositive = false,
  } = opts;

  const sign =
    amount < 0 ? "-" : showPlusForPositive && amount > 0 ? "+" : "";
  const abs = Math.abs(amount);
  const formatter = getInrFormatter(minimumFractionDigits, maximumFractionDigits);
  return `${sign}${currencySymbol}${formatter.format(abs)}`;
}
