// Re-export dashboardPalette from the single source of truth.
// All dashboard components should import from here — the palette
// definition lives in theme.ts alongside all other app tokens.
export { dashboardPalette } from "./theme";

export { formatINR } from "./format";

export function formatDashboardDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) +
    `, ${time}`
  );
}
