/**
 * Converts English digits to Persian digits
 */
export function toPersianDigits(numStr: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(numStr).replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
}

/**
 * Formats a raw number price into Persian Toman string (e.g., 1890000 -> ۱,۸۹۰,۰۰۰ تومان)
 */
export function formatPrice(
  amount: number,
  includeCurrency: boolean = true
): string {
  if (isNaN(amount)) return "";
  const formatted = amount.toLocaleString("fa-IR");
  return includeCurrency ? `${formatted} تومان` : formatted;
}

/**
 * Formats a percentage into Persian representation (e.g. 14 -> %۱۴ or ۱۴٪)
 */
export function formatPercent(percent: number): string {
  return `${toPersianDigits(percent)}٪`;
}
