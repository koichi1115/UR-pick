/**
 * Affiliate API client types and interfaces
 */

import type { Product } from '../../types/product.js';

/**
 * Search parameters for affiliate APIs
 */
export interface SearchParams {
  query: string;
  maxResults?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'rating';
}

/**
 * Search result from affiliate API
 */
export interface SearchResult {
  products: Product[];
  totalCount: number;
  source: 'amazon' | 'rakuten' | 'yahoo';
}

/**
 * Affiliate API client interface
 */
export interface AffiliateClient {
  /**
   * Search for products
   */
  search(params: SearchParams): Promise<SearchResult>;

  /**
   * Get product details by ID
   */
  getProductById?(productId: string): Promise<Product | null>;

  /**
   * Check if API is available
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
} as const;
