/**
 * Product source enumeration
 */
export enum ProductSource {
  AMAZON = 'amazon',
  RAKUTEN = 'rakuten',
  YAHOO = 'yahoo',
}

/**
 * Product interface
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  source: ProductSource;
  affiliateUrl: string;
  rating: number;
  reviewCount: number;
  recommendReason: string;
}

/**
 * Recommendation request
 */
export interface RecommendationRequest {
  query: string;
  userId?: string;
}

/**
 * Recommendation response
 */
export interface RecommendationResponse {
  products: Product[];
}
