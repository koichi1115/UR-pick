import { logger } from '../../utils/logger.js';
import { ExternalApiError } from '../../utils/errors.js';
import type { RetryConfig } from './types.js';
import { DEFAULT_RETRY_CONFIG } from './types.js';

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  serviceName: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  let delay = config.retryDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        logger.info(`Retrying ${serviceName} (attempt ${attempt}/${config.maxRetries})`);
        await sleep(delay);
        delay *= config.backoffMultiplier;
      }

      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      logger.warn(`${serviceName} request failed (attempt ${attempt + 1}/${config.maxRetries + 1})`, {
        error: lastError.message,
      });

      // Don't retry on client errors (4xx)
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        if (statusCode >= 400 && statusCode < 500) {
          throw error;
        }
      }
    }
  }

  // All retries failed
  throw new ExternalApiError(
    serviceName,
    `Failed after ${config.maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Generate affiliate URL with partner tag
 */
export function generateAffiliateUrl(
  baseUrl: string,
  partnerId: string,
  partnerParam = 'tag'
): string {
  const url = new URL(baseUrl);
  url.searchParams.set(partnerParam, partnerId);
  return url.toString();
}

/**
 * Normalize price string to number
 */
export function normalizePrice(price: string | number): number {
  if (typeof price === 'number') return price;

  // Remove currency symbols and commas
  const normalized = price.replace(/[¥$,]/g, '').trim();
  const parsed = parseFloat(normalized);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Extract rating from various formats
 */
export function normalizeRating(rating: string | number | undefined): number {
  if (rating === undefined) return 0;
  if (typeof rating === 'number') return Math.min(5, Math.max(0, rating));

  const parsed = parseFloat(String(rating));
  return isNaN(parsed) ? 0 : Math.min(5, Math.max(0, parsed));
}
