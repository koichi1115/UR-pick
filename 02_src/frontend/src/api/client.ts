/**
 * API Client configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// デバッグ用: 使用中のAPI URLをコンソールに出力
console.log('[UR-pick] API Base URL:', API_BASE_URL);

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Generic API request function
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // デバッグ用: リクエストURLをコンソールに出力
  console.log('[UR-pick] API Request:', options.method || 'GET', url);

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[UR-pick] API Error:', response.status, response.statusText, errorData);
      throw new ApiError(
        response.status,
        errorData.message || response.statusText,
        errorData
      );
    }

    console.log('[UR-pick] API Success:', response.status);
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('[UR-pick] Network Error:', error);
    throw new ApiError(0, 'Network error', error);
  }
}

/**
 * GET request helper
 */
export async function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request helper
 */
export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}
