import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

/** Escape a single CSV cell value */
function escapeCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  // Wrap in quotes if the value contains comma, newline, or double-quote
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Convert an array of objects to a CSV string */
export function toCsv<T extends Record<string, any>>(rows: T[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerRow = headers.map(escapeCell).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => escapeCell(row[h])).join(","),
  );
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Write a CSV string to the cache directory and share it via the OS share sheet.
 * Returns true on success, false if sharing is unavailable.
 */
export async function shareCsv(csv: string, filename: string): Promise<void> {
  const path = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(path, {
    mimeType: "text/csv",
    dialogTitle: "Save or share CSV",
    UTI: "public.comma-separated-values-text",
  });
}
