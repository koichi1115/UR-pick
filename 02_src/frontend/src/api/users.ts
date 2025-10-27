import { post, get, put } from './client';

/**
 * Create a new user
 * POST /api/users
 */
export async function createUser(): Promise<{ userId: string }> {
  const response = await post<{
    success: boolean;
    data: { userId: string };
  }>('/api/users');

  return response.data;
}

/**
 * Get user profile
 * GET /api/users/:userId
 */
export async function getUserProfile(userId: string): Promise<{
  userId: string;
  preferences: {
    priceRange: { min: number | null; max: number | null } | null;
    categories: string[] | null;
    brands: string[] | null;
  };
  swipeCount: number;
  createdAt: Date;
  lastActiveAt: Date;
}> {
  const response = await get<{
    success: boolean;
    data: any;
  }>(`/api/users/${userId}`);

  return response.data;
}

/**
 * Update user preferences
 * PUT /api/users/:userId/preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: {
    priceRange?: { min?: number; max?: number };
    categories?: string[];
    brands?: string[];
  }
): Promise<void> {
  await put(`/api/users/${userId}/preferences`, preferences);
}

/**
 * Record a swipe action (now using the user-specific endpoint)
 * POST /api/users/:userId/swipes
 */
export async function recordUserSwipe(
  userId: string,
  data: {
    productId: string;
    action: 'like' | 'dislike';
    query: string;
    product?: {
      name: string;
      price: number;
      source: string;
      category?: string;
      brand?: string;
    };
  }
): Promise<void> {
  await post(`/api/users/${userId}/swipes`, data);
}

/**
 * Get user's swipe history
 * GET /api/users/:userId/swipes
 */
export async function getUserSwipes(
  userId: string,
  options?: {
    action?: 'like' | 'dislike';
    limit?: number;
  }
): Promise<{
  swipes: Array<{
    id: string;
    productId: string;
    action: string;
    query: string;
    productName: string;
    productPrice: number;
    productSource: string;
    createdAt: Date;
  }>;
  count: number;
}> {
  const params = new URLSearchParams();
  if (options?.action) params.append('action', options.action);
  if (options?.limit) params.append('limit', options.limit.toString());

  const queryString = params.toString();
  const url = `/api/users/${userId}/swipes${queryString ? `?${queryString}` : ''}`;

  const response = await get<{
    success: boolean;
    data: any;
  }>(url);

  return response.data;
}
