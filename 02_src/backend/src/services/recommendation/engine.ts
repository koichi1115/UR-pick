import type { Product } from '../../types/product.js';
import type { UserPreferencesData } from '../../types/database.js';
import { logger } from '../../utils/logger.js';
import { ClaudeClient } from '../ai/claude.js';
import { AffiliateAggregator } from '../affiliate/aggregator.js';
import type { SearchParams } from '../affiliate/types.js';
import { scoreAndRankProducts } from './scoring.js';
import { SwipeHistoryModel } from '../../models/swipe.js';
import { UserPreferencesModel } from '../../models/preferences.js';

/**
 * Recommendation request
 */
export interface RecommendationRequest {
  query: string;
  userId?: string;
  maxResults?: number;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Recommendation result
 */
export interface RecommendationResult {
  products: Product[];
  strategy: 'rule-based' | 'llm-based' | 'hybrid';
  processingTime: number;
}

/**
 * AI-powered recommendation engine
 * Implements hybrid approach: rule-based for new users, LLM-based for repeat users
 */
export class RecommendationEngine {
  private claudeClient: ClaudeClient;
  private affiliateAggregator: AffiliateAggregator;
  private readonly NEW_USER_THRESHOLD = 5; // Minimum swipes to be considered repeat user

  constructor() {
    this.claudeClient = new ClaudeClient();
    this.affiliateAggregator = new AffiliateAggregator();
  }

  /**
   * Generate product recommendations
   */
  async recommend(request: RecommendationRequest): Promise<RecommendationResult> {
    const startTime = Date.now();
    const maxResults = request.maxResults || 10;

    logger.info('Generating recommendations', {
      query: request.query,
      userId: request.userId,
      maxResults,
    });

    // Determine if user is new or repeat
    const isNewUser = await this.isNewUser(request.userId);
    const strategy = isNewUser ? 'rule-based' : 'llm-based';

    logger.debug('User classification', { userId: request.userId, isNewUser, strategy });

    // Fetch products from affiliate APIs
    const searchParams: SearchParams = {
      query: request.query,
      maxResults: maxResults * 3, // Fetch more to allow filtering
      minPrice: request.minPrice,
      maxPrice: request.maxPrice,
    };

    const affiliateResult = await this.affiliateAggregator.searchAll(searchParams);

    if (affiliateResult.products.length === 0) {
      logger.warn('No products found from affiliate APIs');
      return {
        products: [],
        strategy,
        processingTime: Date.now() - startTime,
      };
    }

    logger.info('Affiliate products fetched', {
      count: affiliateResult.products.length,
      duration: affiliateResult.duration,
    });

    // Apply recommendation strategy
    let recommendedProducts: Product[];

    if (isNewUser) {
      recommendedProducts = await this.ruleBasedRecommend(
        affiliateResult.products,
        request.query,
        maxResults
      );
    } else {
      recommendedProducts = await this.llmBasedRecommend(
        affiliateResult.products,
        request.query,
        request.userId!,
        maxResults
      );
    }

    // Generate recommendation reasons
    await this.generateRecommendationReasons(recommendedProducts, request.query, request.userId);

    const processingTime = Date.now() - startTime;

    logger.info('Recommendations generated', {
      count: recommendedProducts.length,
      strategy,
      processingTime: `${processingTime}ms`,
    });

    return {
      products: recommendedProducts,
      strategy,
      processingTime,
    };
  }

  /**
   * Check if user is new (has less than threshold swipes)
   */
  private async isNewUser(userId?: string): Promise<boolean> {
    if (!userId) return true;

    try {
      const swipeCount = await SwipeHistoryModel.countByUserId(userId);
      return swipeCount < this.NEW_USER_THRESHOLD;
    } catch (error) {
      logger.error('Error checking user status', error);
      return true; // Treat as new user on error
    }
  }

  /**
   * Rule-based recommendation for new users
   */
  private async ruleBasedRecommend(
    products: Product[],
    query: string,
    maxResults: number
  ): Promise<Product[]> {
    logger.debug('Applying rule-based recommendation');

    // Score and rank products
    const rankedProducts = scoreAndRankProducts(products, query);

    // Return top N products
    return rankedProducts.slice(0, maxResults).map((item) => item.product);
  }

  /**
   * LLM-based recommendation for repeat users
   */
  private async llmBasedRecommend(
    products: Product[],
    query: string,
    userId: string,
    maxResults: number
  ): Promise<Product[]> {
    logger.debug('Applying LLM-based recommendation', { userId });

    try {
      // Get user preferences
      const preferencesRecord = await UserPreferencesModel.findByUserId(userId);
      const userPreferences: UserPreferencesData | undefined = preferencesRecord?.preferences;

      // First, apply rule-based scoring to pre-filter
      const rankedProducts = scoreAndRankProducts(products, query, userPreferences);

      // Take top candidates for LLM evaluation (to reduce API cost)
      const topCandidates = rankedProducts.slice(0, Math.min(30, products.length));

      // Get swipe history for context
      const likedProducts = await SwipeHistoryModel.getLikedProducts(userId, 10);
      const userContext = this.buildUserContext(likedProducts, userPreferences);

      // Use Claude to select best products
      const selectedIds = await this.claudeClient.selectBestProducts(
        query,
        topCandidates.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          description: item.product.description,
        })),
        userContext,
        maxResults
      );

      // Map IDs back to products
      const selectedProducts: Product[] = [];
      for (const id of selectedIds) {
        const found = topCandidates.find((item) => item.product.id === id);
        if (found) {
          selectedProducts.push(found.product);
        }
      }

      // If Claude didn't return enough, fill with top scored products
      if (selectedProducts.length < maxResults) {
        logger.warn('Claude returned fewer products than requested, filling with top scored');
        const selectedIds = new Set(selectedProducts.map((p) => p.id));

        for (const item of topCandidates) {
          if (!selectedIds.has(item.product.id)) {
            selectedProducts.push(item.product);
            if (selectedProducts.length >= maxResults) break;
          }
        }
      }

      return selectedProducts.slice(0, maxResults);
    } catch (error) {
      logger.error('LLM-based recommendation failed, falling back to rule-based', error);
      return this.ruleBasedRecommend(products, query, maxResults);
    }
  }

  /**
   * Build user context string from preferences and history
   */
  private buildUserContext(
    likedProducts: Array<{ product_name: string; product_source: string }>,
    userPreferences?: UserPreferencesData
  ): string {
    const context: string[] = [];

    if (userPreferences?.preferredPriceRange) {
      const { min, max } = userPreferences.preferredPriceRange;
      context.push(`予算: ¥${min.toLocaleString()} - ¥${max.toLocaleString()}`);
    }

    if (userPreferences?.preferredCategories?.length) {
      context.push(`好きなカテゴリ: ${userPreferences.preferredCategories.join(', ')}`);
    }

    if (userPreferences?.preferredBrands?.length) {
      context.push(`好きなブランド: ${userPreferences.preferredBrands.join(', ')}`);
    }

    if (likedProducts.length > 0) {
      const productNames = likedProducts.slice(0, 5).map((p) => p.product_name);
      context.push(`過去に興味を示した商品: ${productNames.join(', ')}`);
    }

    return context.join('\n');
  }

  /**
   * Generate recommendation reasons for products
   */
  private async generateRecommendationReasons(
    products: Product[],
    query: string,
    userId?: string
  ): Promise<void> {
    logger.debug('Generating recommendation reasons', { count: products.length });

    // Get user context if available
    let userContext: string | undefined;
    if (userId) {
      const likedProducts = await SwipeHistoryModel.getLikedProducts(userId, 5);
      if (likedProducts.length > 0) {
        userContext = likedProducts.map((p) => p.product_name).join(', ');
      }
    }

    // Generate reasons in parallel
    const reasonPromises = products.map(async (product) => {
      try {
        const reason = await this.claudeClient.generateRecommendationReasons(
          query,
          product.name,
          product.description,
          userContext
        );
        product.recommendReason = reason.trim();
      } catch (error) {
        logger.error('Failed to generate recommendation reason', {
          productId: product.id,
          error,
        });
        product.recommendReason = 'この商品はあなたの検索にマッチしています。';
      }
    });

    await Promise.all(reasonPromises);
  }
}
