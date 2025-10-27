/**
 * Swipe direction type
 */
export type SwipeDirection = 'left' | 'right';

/**
 * Swipe action type (semantic meaning)
 */
export type SwipeAction = 'like' | 'dislike';

/**
 * Swipe record
 */
export interface SwipeRecord {
  productId: string;
  direction: SwipeDirection;
  timestamp: Date;
}

/**
 * Swipe request payload
 */
export interface SwipeRequest {
  productId: string;
  direction: SwipeDirection;
}

/**
 * Swipe response
 */
export interface SwipeResponse {
  success: boolean;
  message?: string;
}
