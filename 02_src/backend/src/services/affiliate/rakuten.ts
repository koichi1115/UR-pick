import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { ProductSource } from '../../types/product.js';
import type { Product } from '../../types/product.js';
import type { AffiliateClient, SearchParams, SearchResult } from './types.js';
import { retryWithBackoff, normalizePrice, normalizeRating } from './utils.js';

/**
 * Rakuten API response types
 */
interface RakutenItem {
  itemName: string;
  itemCode: string;
  itemPrice: number;
  itemUrl: string;
  mediumImageUrls?: { imageUrl: string }[];
  itemCaption?: string;
  reviewAverage?: number;
  reviewCount?: number;
  affiliateUrl?: string;
}

interface RakutenResponse {
  Items?: RakutenItem[][];
  count?: number;
  hits?: number;
  error?: string;
}

/**
 * Rakuten Ichiba API client
 */
export class RakutenClient implements AffiliateClient {
  private readonly apiUrl = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';
  private readonly appId: string;

  constructor(appId?: string) {
    this.appId = appId || config.rakuten.appId;
  }

  /**
   * Search for products on Rakuten
   */
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, maxResults = 10, minPrice, maxPrice, sortBy = 'relevance' } = params;

    // Build query parameters
    const queryParams = new URLSearchParams({
      applicationId: this.appId,
      keyword: query,
      hits: Math.min(maxResults, 30).toString(), // Rakuten max is 30
      formatVersion: '2',
    });

    // Add price filters
    if (minPrice) {
      queryParams.set('minPrice', minPrice.toString());
    }
    if (maxPrice) {
      queryParams.set('maxPrice', maxPrice.toString());
    }

    // Add sort order
    const sortMapping = {
      relevance: 'standard',
      'price-asc': '+itemPrice',
      'price-desc': '-itemPrice',
      rating: '-reviewAverage',
    };
    queryParams.set('sort', sortMapping[sortBy] || 'standard');

    const url = `${this.apiUrl}?${queryParams.toString()}`;

    logger.debug('Rakuten API request', { url: this.apiUrl, query });

    try {
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json() as Promise<RakutenResponse>;
        },
        'Rakuten API'
      );

      if (response.error) {
        throw new Error(response.error);
      }

      const items = response.Items || [];
      const products: Product[] = items
        .map((itemArray) => this.convertToProduct(itemArray[0]))
        .filter((p): p is Product => p !== null);

      logger.info('Rakuten API response', {
        count: products.length,
        total: response.count || 0,
      });

      return {
        products,
        totalCount: response.count || products.length,
        source: 'rakuten',
      };
    } catch (error) {
      logger.error('Rakuten API error', error);
      throw error;
    }
  }

  /**
   * Convert Rakuten item to common Product type
   */
  private convertToProduct(item: RakutenItem | undefined): Product | null {
    if (!item) return null;

    try {
      return {
        id: `rakuten_${item.itemCode}`,
        name: item.itemName,
        price: normalizePrice(item.itemPrice),
        imageUrl: item.mediumImageUrls?.[0]?.imageUrl || '',
        description: item.itemCaption || item.itemName,
        source: ProductSource.RAKUTEN,
        affiliateUrl: item.affiliateUrl || item.itemUrl,
        rating: normalizeRating(item.reviewAverage),
        reviewCount: item.reviewCount || 0,
        recommendReason: '', // Will be filled by AI
      };
    } catch (error) {
      logger.error('Failed to convert Rakuten item', { item, error });
      return null;
    }
  }

  /**
   * Check if Rakuten API is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.appId) {
      logger.warn('Rakuten API key not configured');
      return false;
    }

    try {
      const result = await this.search({ query: 'test', maxResults: 1 });
      return result.products.length >= 0;
    } catch (error) {
      logger.error('Rakuten API availability check failed', error);
      return false;
    }
  }
}
