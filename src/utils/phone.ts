export function normalizePhone(input: string): string {
  const phone = input.trim().replace(/[\s\-.()]/g, "");
  if (phone.startsWith("+")) return phone; // already has a country code — keep as-is
  // No country code: treat as Indian number (+91), strip leading zeros
  return "+91" + phone.replace(/^0+/, "");
}
