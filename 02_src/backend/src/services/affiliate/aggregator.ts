import { logger } from '../../utils/logger.js';
import type { Product } from '../../types/product.js';
import type { AffiliateClient, SearchParams, SearchResult } from './types.js';
import { AmazonClient } from './amazon.js';
import { RakutenClient } from './rakuten.js';
import { YahooShoppingClient } from './yahoo.js';
import { MockAffiliateClient } from './mock.js';

/**
 * Aggregated search result
 */
export interface AggregatedSearchResult {
  products: Product[];
  totalCount: number;
  sources: {
    amazon: number;
    rakuten: number;
    yahoo: number;
  };
  duration: number; // milliseconds
}

/**
 * Affiliate API aggregator
 * Calls multiple affiliate APIs in parallel and aggregates results
 */
export class AffiliateAggregator {
  private clients: Map<string, AffiliateClient>;
  private timeout: number = 8000; // 8 seconds (allow 2s buffer for processing)

  constructor() {
    this.clients = new Map();

    // Use mock client if USE_MOCK_DATA environment variable is set
    const useMockData = process.env.USE_MOCK_DATA === 'true';

    if (useMockData) {
      logger.info('Using mock affiliate data (USE_MOCK_DATA=true)');
      this.clients.set('mock', new MockAffiliateClient());
    } else {
      this.clients.set('amazon', new AmazonClient());
      this.clients.set('rakuten', new RakutenClient());
      this.clients.set('yahoo', new YahooShoppingClient());
    }
  }

  /**
   * Search products from all available affiliate APIs in parallel
   */
  async searchAll(params: SearchParams): Promise<AggregatedSearchResult> {
    const startTime = Date.now();

    logger.info('Starting parallel affiliate API search', {
      query: params.query,
      maxResults: params.maxResults,
    });

    // Create search promises for all clients
    const searchPromises = Array.from(this.clients.entries()).map(async ([name, client]) => {
      try {
        // Check if client is available
        const isAvailable = await Promise.race([
          client.isAvailable(),
          this.createTimeoutPromise<boolean>(1000, false),
        ]);

        if (!isAvailable) {
          logger.warn(`${name} API not available, skipping`);
          return null;
        }

        // Execute search with timeout
        const result = await Promise.race([
          client.search(params),
          this.createTimeoutPromise<SearchResult | null>(this.timeout, null),
        ]);

        if (!result) {
          logger.warn(`${name} API timed out`);
          return null;
        }

        logger.info(`${name} API search completed`, {
          count: result.products.length,
        });

        return result;
      } catch (error) {
        logger.error(`${name} API search failed`, error);
        return null;
      }
    });

    // Wait for all searches to complete
    const results = await Promise.all(searchPromises);

    // Filter out null results
    const validResults = results.filter((r): r is SearchResult => r !== null);

    // Aggregate products
    const allProducts: Product[] = [];
    const sourceCounts = {
      amazon: 0,
      rakuten: 0,
      yahoo: 0,
    };

    for (const result of validResults) {
      allProducts.push(...result.products);
      sourceCounts[result.source] = result.products.length;
    }

    // Remove duplicates (based on similar names)
    const uniqueProducts = this.deduplicateProducts(allProducts);

    // Sort by relevance (can be improved with scoring algorithm)
    const sortedProducts = this.sortProducts(uniqueProducts, params);

    // Limit to maxResults
    const limitedProducts = sortedProducts.slice(0, params.maxResults || 10);

    const duration = Date.now() - startTime;

    logger.info('Parallel affiliate API search completed', {
      duration: `${duration}ms`,
      totalProducts: allProducts.length,
      uniqueProducts: uniqueProducts.length,
      returnedProducts: limitedProducts.length,
      sources: sourceCounts,
    });

    return {
      products: limitedProducts,
      totalCount: uniqueProducts.length,
      sources: sourceCounts,
      duration,
    };
  }

  /**
   * Deduplicate products based on name similarity
   */
  private deduplicateProducts(products: Product[]): Product[] {
    const seen = new Map<string, Product>();

    for (const product of products) {
      // Normalize name for comparison
      const normalizedName = product.name.toLowerCase().replace(/\s+/g, '');

      // If we haven't seen this product, add it
      if (!seen.has(normalizedName)) {
        seen.set(normalizedName, product);
      } else {
        // If we've seen it, keep the one with higher rating
        const existing = seen.get(normalizedName)!;
        if (product.rating > existing.rating) {
          seen.set(normalizedName, product);
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Sort products based on search parameters
   */
  private sortProducts(products: Product[], params: SearchParams): Product[] {
    const { sortBy = 'relevance' } = params;

    return products.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
        case 'relevance':
        default:
          // Simple relevance: prefer products with reviews and good ratings
          const scoreA = a.rating * Math.log(a.reviewCount + 1);
          const scoreB = b.rating * Math.log(b.reviewCount + 1);
          return scoreB - scoreA;
      }
    });
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise<T>(ms: number, value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
  }

  /**
   * Get a specific client
   */
  getClient(source: 'amazon' | 'rakuten' | 'yahoo'): AffiliateClient | undefined {
    return this.clients.get(source);
  }
}
