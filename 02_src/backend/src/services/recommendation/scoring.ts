import type { Product } from '../../types/product.js';
import { logger } from '../../utils/logger.js';

/**
 * Product score components
 */
export interface ProductScore {
  productId: string;
  baseScore: number; // Price, rating, review count
  queryMatchScore: number; // Keyword matching
  personalizeScore: number; // User profile matching
  totalScore: number;
}

/**
 * Scoring weights
 */
const WEIGHTS = {
  base: 0.3,
  queryMatch: 0.4,
  personalize: 0.3,
};

/**
 * Calculate base score from product attributes
 */
export function calculateBaseScore(product: Product): number {
  // Rating score (0-5 normalized to 0-1)
  const ratingScore = product.rating / 5;

  // Review count score (log scale, capped at 1000)
  const reviewScore = Math.log(product.reviewCount + 1) / Math.log(1001);

  // Price score (inverse, prefer lower prices)
  // Normalize to typical price range (1000-100000 yen)
  const priceScore = 1 - Math.min(product.price / 100000, 1);

  // Weighted combination
  return ratingScore * 0.5 + reviewScore * 0.3 + priceScore * 0.2;
}

/**
 * Calculate query match score
 */
export function calculateQueryMatchScore(product: Product, query: string): number {
  const queryLower = query.toLowerCase();
  const productTextLower = `${product.name} ${product.description}`.toLowerCase();

  // Split query into keywords
  const keywords = queryLower.split(/\s+/);

  // Count matching keywords
  let matchCount = 0;
  for (const keyword of keywords) {
    if (productTextLower.includes(keyword)) {
      matchCount++;
    }
  }

  // Normalize by number of keywords
  return keywords.length > 0 ? matchCount / keywords.length : 0;
}

/**
 * Calculate personalized score based on user preferences
 */
export function calculatePersonalizeScore(
  product: Product,
  userPreferences?: {
    preferredPriceRange?: { min: number; max: number };
    preferredCategories?: string[];
    preferredBrands?: string[];
  }
): number {
  if (!userPreferences) return 0.5; // Neutral score for new users

  let score = 0;
  let factors = 0;

  // Price range matching
  if (userPreferences.preferredPriceRange) {
    const { min, max } = userPreferences.preferredPriceRange;
    if (product.price >= min && product.price <= max) {
      score += 1;
    } else {
      // Partial score for nearby prices
      const distance = Math.min(
        Math.abs(product.price - min),
        Math.abs(product.price - max)
      );
      score += Math.max(0, 1 - distance / max);
    }
    factors++;
  }

  // Category matching
  if (userPreferences.preferredCategories && userPreferences.preferredCategories.length > 0) {
    const productText = `${product.name} ${product.description}`.toLowerCase();
    const categoryMatches = userPreferences.preferredCategories.filter((category) =>
      productText.includes(category.toLowerCase())
    );
    score += categoryMatches.length / userPreferences.preferredCategories.length;
    factors++;
  }

  // Brand matching
  if (userPreferences.preferredBrands && userPreferences.preferredBrands.length > 0) {
    const productText = `${product.name} ${product.description}`.toLowerCase();
    const brandMatches = userPreferences.preferredBrands.filter((brand) =>
      productText.includes(brand.toLowerCase())
    );
    score += brandMatches.length / userPreferences.preferredBrands.length;
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
}

/**
 * Calculate total score for a product
 */
export function calculateProductScore(
  product: Product,
  query: string,
  userPreferences?: {
    preferredPriceRange?: { min: number; max: number };
    preferredCategories?: string[];
    preferredBrands?: string[];
  }
): ProductScore {
  const baseScore = calculateBaseScore(product);
  const queryMatchScore = calculateQueryMatchScore(product, query);
  const personalizeScore = calculatePersonalizeScore(product, userPreferences);

  const totalScore =
    baseScore * WEIGHTS.base +
    queryMatchScore * WEIGHTS.queryMatch +
    personalizeScore * WEIGHTS.personalize;

  return {
    productId: product.id,
    baseScore,
    queryMatchScore,
    personalizeScore,
    totalScore,
  };
}

/**
 * Score and rank products
 */
export function scoreAndRankProducts(
  products: Product[],
  query: string,
  userPreferences?: {
    preferredPriceRange?: { min: number; max: number };
    preferredCategories?: string[];
    preferredBrands?: string[];
  }
): Array<{ product: Product; score: ProductScore }> {
  logger.debug('Scoring products', {
    count: products.length,
    query,
    hasPreferences: !!userPreferences,
  });

  const scoredProducts = products.map((product) => ({
    product,
    score: calculateProductScore(product, query, userPreferences),
  }));

  // Sort by total score descending
  scoredProducts.sort((a, b) => b.score.totalScore - a.score.totalScore);

  logger.debug('Products scored and ranked', {
    topScore: scoredProducts[0]?.score.totalScore,
    bottomScore: scoredProducts[scoredProducts.length - 1]?.score.totalScore,
  });

  return scoredProducts;
}
