import type { Request, Response, NextFunction } from 'express';
import { query, getClient } from '../utils/db.js';
import { UserError, NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * User controller
 */
export class UserController {
  /**
   * Create a new user
   * POST /api/users
   */
  async createUser(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await query<{ id: string }>(
        `INSERT INTO users DEFAULT VALUES RETURNING id`
      );

      const userId = result.rows[0]?.id;

      if (!userId) {
        throw new Error('Failed to create user');
      }

      logger.info('User created', { userId });

      res.status(201).json({
        success: true,
        data: {
          userId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile
   * GET /api/users/:userId
   */
  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const result = await query<{
        id: string;
        preferred_price_min: number | null;
        preferred_price_max: number | null;
        preferred_categories: string[] | null;
        preferred_brands: string[] | null;
        swipe_count: number;
        created_at: Date;
        last_active_at: Date;
      }>('SELECT * FROM users WHERE id = $1', [userId]);

      if (result.rowCount === 0) {
        throw new NotFoundError('User');
      }

      const user = result.rows[0]!;

      res.json({
        success: true,
        data: {
          userId: user.id,
          preferences: {
            priceRange: user.preferred_price_min || user.preferred_price_max
              ? {
                  min: user.preferred_price_min,
                  max: user.preferred_price_max,
                }
              : null,
            categories: user.preferred_categories,
            brands: user.preferred_brands,
          },
          swipeCount: user.swipe_count,
          createdAt: user.created_at,
          lastActiveAt: user.last_active_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user preferences
   * PUT /api/users/:userId/preferences
   */
  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { priceRange, categories, brands } = req.body;

      // Validate price range
      if (priceRange) {
        if (priceRange.min !== undefined && priceRange.min < 0) {
          throw new UserError('Minimum price must be non-negative');
        }
        if (
          priceRange.max !== undefined &&
          priceRange.min !== undefined &&
          priceRange.max < priceRange.min
        ) {
          throw new UserError('Maximum price must be greater than minimum price');
        }
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (priceRange?.min !== undefined) {
        updates.push(`preferred_price_min = $${paramIndex++}`);
        values.push(priceRange.min);
      }

      if (priceRange?.max !== undefined) {
        updates.push(`preferred_price_max = $${paramIndex++}`);
        values.push(priceRange.max);
      }

      if (categories !== undefined) {
        updates.push(`preferred_categories = $${paramIndex++}`);
        values.push(categories);
      }

      if (brands !== undefined) {
        updates.push(`preferred_brands = $${paramIndex++}`);
        values.push(brands);
      }

      if (updates.length === 0) {
        throw new UserError('No preferences to update');
      }

      values.push(userId);

      await query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
        values
      );

      logger.info('User preferences updated', { userId });

      res.json({
        success: true,
        message: 'Preferences updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record a swipe action
   * POST /api/users/:userId/swipes
   */
  async recordSwipe(req: Request, res: Response, next: NextFunction): Promise<void> {
    const client = await getClient();

    try {
      const { userId } = req.params;
      const { productId, action, query: searchQuery, product } = req.body;

      // Validate action
      if (!['like', 'dislike'].includes(action)) {
        throw new UserError('Invalid action. Must be "like" or "dislike"');
      }

      await client.query('BEGIN');

      // Insert swipe record
      await client.query(
        `INSERT INTO swipes (user_id, product_id, query, action, product_name, product_price, product_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, product_id) DO UPDATE
         SET action = EXCLUDED.action, created_at = CURRENT_TIMESTAMP`,
        [
          userId,
          productId,
          searchQuery,
          action,
          product?.name,
          product?.price,
          product?.source,
        ]
      );

      // Increment swipe count
      await client.query(
        `UPDATE users SET swipe_count = swipe_count + 1, last_active_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [userId]
      );

      // Update preferences based on liked products
      if (action === 'like' && product) {
        // Add category if not already in preferences
        if (product.category) {
          await client.query(
            `UPDATE users
             SET preferred_categories = array_append(
               COALESCE(preferred_categories, ARRAY[]::text[]),
               $1
             )
             WHERE id = $2 AND NOT ($1 = ANY(COALESCE(preferred_categories, ARRAY[]::text[])))`,
            [product.category, userId]
          );
        }

        // Add brand if not already in preferences
        if (product.brand) {
          await client.query(
            `UPDATE users
             SET preferred_brands = array_append(
               COALESCE(preferred_brands, ARRAY[]::text[]),
               $1
             )
             WHERE id = $2 AND NOT ($1 = ANY(COALESCE(preferred_brands, ARRAY[]::text[])))`,
            [product.brand, userId]
          );
        }
      }

      await client.query('COMMIT');

      logger.info('Swipe recorded', { userId, productId, action });

      res.json({
        success: true,
        message: 'Swipe recorded successfully',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }

  /**
   * Get user's swipe history
   * GET /api/users/:userId/swipes
   */
  async getSwipes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { action, limit = '50' } = req.query;

      let queryText = 'SELECT * FROM swipes WHERE user_id = $1';
      const params: any[] = [userId];

      if (action && (action === 'like' || action === 'dislike')) {
        queryText += ' AND action = $2';
        params.push(action);
      }

      queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
      params.push(parseInt(limit as string, 10));

      const result = await query(queryText, params);

      res.json({
        success: true,
        data: {
          swipes: result.rows,
          count: result.rowCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
