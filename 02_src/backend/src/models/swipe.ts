import { query, queryOne } from '../database/index.js';
import type { SwipeHistoryRecord, CreateSwipeInput } from '../types/database.js';

/**
 * Swipe history model for database operations
 */
export class SwipeHistoryModel {
  /**
   * Create a new swipe record
   */
  static async create(input: CreateSwipeInput): Promise<SwipeHistoryRecord> {
    const sql = `
      INSERT INTO swipe_history (user_id, product_id, product_name, product_source, direction)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const params = [
      input.user_id,
      input.product_id,
      input.product_name,
      input.product_source,
      input.direction,
    ];

    const swipe = await queryOne<SwipeHistoryRecord>(sql, params);

    if (!swipe) {
      throw new Error('Failed to create swipe record');
    }

    return swipe;
  }

  /**
   * Get swipe history for a user
   */
  static async findByUserId(
    userId: string,
    limit = 100
  ): Promise<SwipeHistoryRecord[]> {
    const sql = `
      SELECT * FROM swipe_history
      WHERE user_id = $1
      ORDER BY swiped_at DESC
      LIMIT $2
    `;
    return query<SwipeHistoryRecord>(sql, [userId, limit]);
  }

  /**
   * Get swipes by direction (liked/disliked)
   */
  static async findByUserIdAndDirection(
    userId: string,
    direction: 'left' | 'right',
    limit = 100
  ): Promise<SwipeHistoryRecord[]> {
    const sql = `
      SELECT * FROM swipe_history
      WHERE user_id = $1 AND direction = $2
      ORDER BY swiped_at DESC
      LIMIT $3
    `;
    return query<SwipeHistoryRecord>(sql, [userId, direction, limit]);
  }

  /**
   * Get liked products for a user
   */
  static async getLikedProducts(
    userId: string,
    limit = 50
  ): Promise<SwipeHistoryRecord[]> {
    return this.findByUserIdAndDirection(userId, 'right', limit);
  }

  /**
   * Count swipes by user
   */
  static async countByUserId(userId: string): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM swipe_history WHERE user_id = $1`;
    const result = await queryOne<{ count: string }>(sql, [userId]);
    return result ? parseInt(result.count, 10) : 0;
  }

  /**
   * Delete all swipes for a user
   */
  static async deleteByUserId(userId: string): Promise<number> {
    const sql = `DELETE FROM swipe_history WHERE user_id = $1`;
    const result = await query(sql, [userId]);
    return result.length;
  }
}
