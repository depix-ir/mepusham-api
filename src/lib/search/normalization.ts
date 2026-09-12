/**
 * Utility functions for Persian / Arabic text normalization in Search.
 */

/**
 * Normalizes Persian/Arabic text for query matching.
 * Converts Arabic character variants to standard Persian,
 * strips diacritics, normalizes ZWNJs and whitespaces.
 */
export function normalizePersianText(text: string): string {
  if (!text) return "";

  return text
    // Normalize English to lowercase
    .toLowerCase()
    // Replace Arabic 'ي' with Persian 'ی'
    .replace(/\u064A/g, "\u06CC")
    // Replace Arabic 'ك' with Persian 'ک'
    .replace(/\u0643/g, "\u06A9")
    // Replace 'ۀ' with 'ه'
    .replace(/\u06C0/g, "\u0647")
    // Replace 'أ', 'إ', 'آ' with 'ا'
    .replace(/[\u0622\u0623\u0625]/g, "\u0627")
    // Strip Arabic diacritics (harakat/tanwin/shaddah/sukun)
    .replace(/[\u064B-\u0652]/g, "")
    // Convert Zero-Width Non-Joiner (نیم‌فاصله) and non-breaking space to standard space
    .replace(/[\u200C\u00A0]/g, " ")
    // Remove extra punctuation except spaces and alphanumeric characters
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    // Collapse multiple spaces into a single space
    .replace(/\s+/g, " ")
    // Trim surrounding whitespace
    .trim();
}

/**
 * Tokenizes normalized Persian text into individual words.
 */
export function tokenizePersianText(text: string): string[] {
  const normalized = normalizePersianText(text);
  if (!normalized) return [];
  return normalized.split(" ").filter((token) => token.length > 0);
}
