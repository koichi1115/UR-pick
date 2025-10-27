import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { ProductSource } from '../../types/product.js';
import type { Product } from '../../types/product.js';
import type { AffiliateClient, SearchParams, SearchResult } from './types.js';
import { retryWithBackoff, normalizePrice, normalizeRating } from './utils.js';

/**
 * Yahoo Shopping API response types
 */
interface YahooHit {
  name: string;
  code: string;
  price: number;
  url: string;
  image?: {
    medium?: string;
  };
  description?: string;
  rating?: {
    rate?: number;
    count?: number;
  };
  exImage?: {
    url?: string;
  };
}

interface YahooResponse {
  hits?: YahooHit[];
  totalResultsAvailable?: number;
  totalResultsReturned?: number;
  error?: {
    message: string;
  };
}

/**
 * Yahoo Shopping API client
 */
export class YahooShoppingClient implements AffiliateClient {
  private readonly apiUrl = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch';
  private readonly clientId: string;

  constructor(clientId?: string) {
    this.clientId = clientId || config.yahoo.clientId;
  }

  /**
   * Search for products on Yahoo Shopping
   */
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, maxResults = 10, minPrice, maxPrice, sortBy = 'relevance' } = params;

    // Build query parameters
    const queryParams = new URLSearchParams({
      appid: this.clientId,
      query: query,
      results: Math.min(maxResults, 50).toString(), // Yahoo max is 50
      image_size: '300',
    });

    // Add price filters
    if (minPrice) {
      queryParams.set('price_from', minPrice.toString());
    }
    if (maxPrice) {
      queryParams.set('price_to', maxPrice.toString());
    }

    // Add sort order
    const sortMapping = {
      relevance: '-score',
      'price-asc': '+price',
      'price-desc': '-price',
      rating: '-review_count',
    };
    queryParams.set('sort', sortMapping[sortBy] || '-score');

    const url = `${this.apiUrl}?${queryParams.toString()}`;

    logger.debug('Yahoo Shopping API request', { url: this.apiUrl, query });

    try {
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json() as Promise<YahooResponse>;
        },
        'Yahoo Shopping API'
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      const hits = response.hits || [];
      const products: Product[] = hits
        .map((hit) => this.convertToProduct(hit))
        .filter((p): p is Product => p !== null);

      logger.info('Yahoo Shopping API response', {
        count: products.length,
        total: response.totalResultsAvailable || 0,
      });

      return {
        products,
        totalCount: response.totalResultsAvailable || products.length,
        source: 'yahoo',
      };
    } catch (error) {
      logger.error('Yahoo Shopping API error', error);
      throw error;
    }
  }

  /**
   * Convert Yahoo item to common Product type
   */
  private convertToProduct(hit: YahooHit): Product | null {
    try {
      return {
        id: `yahoo_${hit.code}`,
        name: hit.name,
        price: normalizePrice(hit.price),
        imageUrl: hit.exImage?.url || hit.image?.medium || '',
        description: hit.description || hit.name,
        source: ProductSource.YAHOO,
        affiliateUrl: hit.url,
        rating: normalizeRating(hit.rating?.rate),
        reviewCount: hit.rating?.count || 0,
        recommendReason: '', // Will be filled by AI
      };
    } catch (error) {
      logger.error('Failed to convert Yahoo item', { hit, error });
      return null;
    }
  }

  /**
   * Check if Yahoo Shopping API is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.clientId) {
      logger.warn('Yahoo Shopping API key not configured');
      return false;
    }

    try {
      const result = await this.search({ query: 'test', maxResults: 1 });
      return result.products.length >= 0;
    } catch (error) {
      logger.error('Yahoo Shopping API availability check failed', error);
      return false;
    }
  }
}
