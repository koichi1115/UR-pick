/**
 * Product type definition
 * Represents a product from affiliate APIs
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  source: 'amazon' | 'rakuten' | 'yahoo';
  affiliateUrl: string;
  rating: number;
  reviewCount: number;
  recommendReason: string; // AI-generated recommendation reason
}

/**
 * Product recommendation request
 */
export interface RecommendationRequest {
  query: string;
}

/**
 * Product recommendation response
 */
export interface RecommendationResponse {
  products: Product[];
}
