import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

function escapeCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerRow = headers.map(escapeCell).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => escapeCell(row[h])).join(","),
  );
  return "\uFEFF" + [headerRow, ...dataRows].join("\n");
}

export async function shareCsv(csv: string, filename: string): Promise<void> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error("File system cache directory is unavailable.");
  }

  const path = cacheDir + filename;

  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error(
      "Sharing is not available on this device. Connect a file manager app.",
    );
  }

  await Sharing.shareAsync(path, {
    mimeType: "text/csv",
    dialogTitle: "Save or share CSV",
    UTI: "public.comma-separated-values-text",
  });
}
