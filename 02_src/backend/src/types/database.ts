/**
 * Database model types
 * These types correspond to the database schema
 */

/**
 * User model
 */
export interface User {
  user_id: string; // UUID
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}

/**
 * Swipe history record model
 */
export interface SwipeHistoryRecord {
  swipe_id: number;
  user_id: string;
  product_id: string;
  product_name: string;
  product_source: 'amazon' | 'rakuten' | 'yahoo';
  direction: 'left' | 'right';
  swiped_at: Date;
}

/**
 * Purchase history record model
 */
export interface PurchaseHistoryRecord {
  purchase_id: number;
  user_id: string | null;
  product_id: string;
  product_name: string;
  product_source: 'amazon' | 'rakuten' | 'yahoo';
  affiliate_url: string;
  transitioned_at: Date;
}

/**
 * User preferences model
 */
export interface UserPreferencesRecord {
  user_id: string;
  preferences: UserPreferencesData;
  updated_at: Date;
}

/**
 * User preferences data structure (JSONB)
 */
export interface UserPreferencesData {
  preferredCategories?: string[];
  preferredPriceRange?: {
    min: number;
    max: number;
  };
  preferredBrands?: string[];
  lastAnalyzedAt?: string; // ISO 8601 date string
}

/**
 * Input types for creating records
 */

export interface CreateUserInput {
  user_id?: string; // Optional, will be generated if not provided
}

export interface CreateSwipeInput {
  user_id: string;
  product_id: string;
  product_name: string;
  product_source: 'amazon' | 'rakuten' | 'yahoo';
  direction: 'left' | 'right';
}

export interface CreatePurchaseInput {
  user_id?: string | null; // Optional for unauthenticated users
  product_id: string;
  product_name: string;
  product_source: 'amazon' | 'rakuten' | 'yahoo';
  affiliate_url: string;
}

export interface UpdateUserPreferencesInput {
  user_id: string;
  preferences: UserPreferencesData;
}
