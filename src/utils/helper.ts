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

/** Returns a human-readable relative time string, e.g. "2 days ago", "5 hours ago". */
export function formatRelativeActivity(iso?: string | null): string {
  if (!iso) return "No activity";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

/** Returns the number of whole days elapsed since the given ISO date string. */
export const daysSince = (date: string): number =>
  Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
