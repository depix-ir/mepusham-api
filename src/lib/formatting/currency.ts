/**
 * Converts English digits to Persian digits
 */
export function toPersianDigits(numStr: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(numStr).replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
}

/**
 * Formats a number with Persian digit formatting.
 */
export function formatPersianNumber(num: number | string): string {
  if (typeof num === "number") {
    return num.toLocaleString("fa-IR");
  }
  return toPersianDigits(num);
}

/**
 * Formats a raw number price into Persian formatted string without currency suffix (e.g., 1890000 -> ۱,۸۹۰,۰۰۰)
 */
export function formatPrice(
  amount: number,
  includeCurrency: boolean = false
): string {
  if (isNaN(amount)) return "";
  const formatted = amount.toLocaleString("fa-IR");
  return includeCurrency ? `${formatted} تومان` : formatted;
}

/**
 * Formats a raw number price into Persian formatted string with Toman label
 */
export function formatToman(amount: number): string {
  if (isNaN(amount)) return "۰ تومان";
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

/**
 * Formats a percentage into Persian representation (e.g. 14 -> %۱۴ or ۱۴٪)
 */
export function formatPercent(percent: number): string {
  return `${toPersianDigits(percent)}٪`;
}
