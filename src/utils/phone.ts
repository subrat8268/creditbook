export function normalizePhone(input: string): string {
  let phone = input.trim().replace(/\s+/g, "");
  if (!phone.startsWith("+91")) {
    // default to India (+91)
    phone = "+91" + phone.replace(/^0+/, ""); // strip leading zeros
  }
  return phone;
}
