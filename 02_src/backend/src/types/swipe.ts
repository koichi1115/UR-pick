/**
 * Swipe direction
 */
export enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * Swipe record
 */
export interface SwipeRecord {
  swipeId: number;
  userId: string;
  productId: string;
  direction: SwipeDirection;
  swipedAt: Date;
}

/**
 * Swipe request
 */
export interface SwipeRequest {
  userId: string;
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
