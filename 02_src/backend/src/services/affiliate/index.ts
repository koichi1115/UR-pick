/**
 * Central export for affiliate services
 */
export { AmazonClient } from './amazon.js';
export { RakutenClient } from './rakuten.js';
export { YahooShoppingClient } from './yahoo.js';
export { AffiliateAggregator } from './aggregator.js';
export type {
  AffiliateClient,
  SearchParams,
  SearchResult,
  RetryConfig,
} from './types.js';
export type { AggregatedSearchResult } from './aggregator.js';
