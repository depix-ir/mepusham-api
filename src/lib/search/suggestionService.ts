import { Product } from "@/types/product";
import { categories, brands } from "@/data/common";
import { products } from "@/data/products";
import { normalizePersianText, tokenizePersianText } from "./normalization";

export interface SearchSuggestion {
  id: string;
  text: string;
  type?: "category" | "phrase" | "tag" | "brand";
  score?: number;
}

export interface SuggestionOptions {
  limit?: number;
}

interface Candidate {
  text: string;
  type: "category" | "phrase" | "tag" | "brand";
  weight: number;
}

/**
 * Extracts candidate search phrases from catalog data.
 * Candidates are derived from categories, product titles, key phrase extractions, tags, options, and brands.
 */
function extractCatalogCandidates(catalogProducts: Product[]): Candidate[] {
  const candidates: Candidate[] = [];
  const seenNorms = new Set<string>();

  const addCandidate = (text: string, type: "category" | "phrase" | "tag" | "brand", weight: number) => {
    if (!text || text.trim().length === 0) return;
    const norm = normalizePersianText(text);
    if (!norm || seenNorms.has(norm)) return;
    seenNorms.add(norm);
    candidates.push({ text: text.trim(), type, weight });
  };

  // 1. Categories (Weight: 10)
  categories.forEach((cat) => {
    addCandidate(cat.name, "category", 10);
  });

  // 2. Brands (Weight: 6)
  brands.forEach((brand) => {
    addCandidate(brand.name, "brand", 6);
  });

  // 3. Products: Titles, Tags, Options, and Natural Phrase Extractions
  catalogProducts.forEach((product) => {
    // Product Title as full phrase (Weight: 9)
    addCandidate(product.title, "phrase", 9);

    // Extract natural sub-phrases from title (e.g. "کفش مجلسی", "پیراهن زنانه", "شومیز زنانه")
    const titleTokens = product.title.split(/\s+/);
    if (titleTokens.length >= 2) {
      // 2-word combinations
      for (let i = 0; i < titleTokens.length - 1; i++) {
        const twoWord = `${titleTokens[i]} ${titleTokens[i + 1]}`.trim();
        // Remove common single trailing punctuation/words if needed
        if (twoWord.length > 3) {
          addCandidate(twoWord, "phrase", 8);
        }
      }
      // 3-word combinations
      for (let i = 0; i < titleTokens.length - 2; i++) {
        const threeWord = `${titleTokens[i]} ${titleTokens[i + 1]} ${titleTokens[i + 2]}`.trim();
        if (threeWord.length > 5) {
          addCandidate(threeWord, "phrase", 7);
        }
      }
    }

    // Tags (Weight: 7)
    if (product.tags) {
      product.tags.forEach((tag) => {
        addCandidate(tag, "tag", 7);
      });
    }

    // Option values / Attributes (Weight: 5)
    if (product.options) {
      product.options.forEach((opt) => {
        opt.values.forEach((val) => {
          if (val.label) {
            addCandidate(val.label, "tag", 5);
          }
        });
      });
    }
  });

  return candidates;
}

/**
 * Calculates relevance score for a candidate phrase against a normalized search query.
 */
function scoreCandidate(candidate: Candidate, normQuery: string, queryTokens: string[]): number {
  const normText = normalizePersianText(candidate.text);
  if (!normText) return 0;

  // Exact Match
  if (normText === normQuery) {
    return 1000 + candidate.weight * 10;
  }

  // Prefix Match (e.g. query "کفش" matches candidate "کفش مجلسی")
  if (normText.startsWith(normQuery)) {
    // Shortness bonus: prefer concise completions
    const lengthDiff = Math.max(0, normText.length - normQuery.length);
    const lengthBonus = Math.max(0, 50 - lengthDiff);
    return 500 + candidate.weight * 10 + lengthBonus;
  }

  // Word Start Match (e.g. query "مجلسی" matches candidate "کفش مجلسی")
  const candTokens = tokenizePersianText(normText);
  const wordStartMatch = candTokens.some((tok) => tok.startsWith(normQuery));
  if (wordStartMatch) {
    return 300 + candidate.weight * 10;
  }

  // Token Overlap (all query tokens are present in candidate tokens or text)
  if (queryTokens.length > 0) {
    const allQueryTokensFound = queryTokens.every((qTok) =>
      candTokens.some((cTok) => cTok.includes(qTok)) || normText.includes(qTok)
    );
    if (allQueryTokensFound) {
      return 150 + candidate.weight * 5;
    }

    const matchedTokensCount = queryTokens.filter((qTok) =>
      candTokens.some((cTok) => cTok.includes(qTok))
    ).length;

    if (matchedTokensCount > 0) {
      return matchedTokensCount * 50 + candidate.weight;
    }
  }

  return 0;
}

/**
 * Main service function to derive search suggestions from catalog data.
 * Pure function, easily replaced or wrapped by an API call in the future.
 */
export function getSearchSuggestions(
  query: string = "",
  catalogProducts: Product[] = products,
  options: SuggestionOptions = {}
): SearchSuggestion[] {
  const limit = options.limit ?? 4;
  const normalizedQuery = normalizePersianText(query);
  const candidates = extractCatalogCandidates(catalogProducts);

  // Default empty query state: Return top 4 popular candidates derived from catalog
  if (!normalizedQuery) {
    // Priority order for empty query defaults:
    // Categories and top tag/phrase candidates
    const defaultCandidates = candidates
      .filter((c) => c.type === "category" || c.type === "phrase" || c.type === "tag")
      .slice(0, limit);

    return defaultCandidates.map((c, idx) => ({
      id: `default-${idx}-${normalizePersianText(c.text)}`,
      text: c.text,
      type: c.type,
    }));
  }

  const queryTokens = tokenizePersianText(normalizedQuery);

  // Score candidates
  const scoredCandidates = candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, normalizedQuery, queryTokens),
    }))
    .filter((item) => item.score > 0);

  // Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  // Deduplicate using normalized string key
  const results: SearchSuggestion[] = [];
  const seenNorms = new Set<string>();

  for (const item of scoredCandidates) {
    const norm = normalizePersianText(item.candidate.text);
    if (!seenNorms.has(norm)) {
      seenNorms.add(norm);
      results.push({
        id: `sug-${norm}`,
        text: item.candidate.text,
        type: item.candidate.type,
        score: item.score,
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}
