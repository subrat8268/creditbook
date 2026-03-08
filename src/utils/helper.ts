// utils/numberFormat.ts
export function formatRupeeInput(value: string): string {
  // Remove everything except digits
  const numericValue = value.replace(/\D/g, "");

  if (!numericValue) return "";

  // Convert to number and format with Indian commas
  const number = parseInt(numericValue, 10);
  return number.toLocaleString("en-IN");
}

// src/utils/dateFormat.ts
export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;

  return new Intl.DateTimeFormat("en-US", {
    month: "short", // Oct
    day: "2-digit", // 03
    year: "numeric", // 2025
  }).format(date);
}

/** Returns the number of whole days elapsed since the given ISO date string. */
export const daysSince = (date: string): number =>
  Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
