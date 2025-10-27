import { query, queryOne } from '../database/index.js';
import type { PurchaseHistoryRecord, CreatePurchaseInput } from '../types/database.js';

/**
 * Purchase history model for database operations
 */
export class PurchaseHistoryModel {
  /**
   * Create a new purchase record
   */
  static async create(input: CreatePurchaseInput): Promise<PurchaseHistoryRecord> {
    const sql = `
      INSERT INTO purchase_history (user_id, product_id, product_name, product_source, affiliate_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const params = [
      input.user_id || null,
      input.product_id,
      input.product_name,
      input.product_source,
      input.affiliate_url,
    ];

    const purchase = await queryOne<PurchaseHistoryRecord>(sql, params);

    if (!purchase) {
      throw new Error('Failed to create purchase record');
    }

    return purchase;
  }

  /**
   * Get purchase history for a user
   */
  static async findByUserId(
    userId: string,
    limit = 100
  ): Promise<PurchaseHistoryRecord[]> {
    const sql = `
      SELECT * FROM purchase_history
      WHERE user_id = $1
      ORDER BY transitioned_at DESC
      LIMIT $2
    `;
    return query<PurchaseHistoryRecord>(sql, [userId, limit]);
  }

  /**
   * Get all purchases for a product (for analytics)
   */
  static async findByProductId(
    productId: string,
    limit = 100
  ): Promise<PurchaseHistoryRecord[]> {
    const sql = `
      SELECT * FROM purchase_history
      WHERE product_id = $1
      ORDER BY transitioned_at DESC
      LIMIT $2
    `;
    return query<PurchaseHistoryRecord>(sql, [productId, limit]);
  }

  /**
   * Count purchases by user
   */
  static async countByUserId(userId: string): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM purchase_history WHERE user_id = $1`;
    const result = await queryOne<{ count: string }>(sql, [userId]);
    return result ? parseInt(result.count, 10) : 0;
  }

  /**
   * Count purchases by product (for popularity analytics)
   */
  static async countByProductId(productId: string): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM purchase_history WHERE product_id = $1`;
    const result = await queryOne<{ count: string }>(sql, [productId]);
    return result ? parseInt(result.count, 10) : 0;
  }

  /**
   * Get recent purchases (for analytics)
   */
  static async getRecent(limit = 100): Promise<PurchaseHistoryRecord[]> {
    const sql = `
      SELECT * FROM purchase_history
      ORDER BY transitioned_at DESC
      LIMIT $1
    `;
    return query<PurchaseHistoryRecord>(sql, [limit]);
  }
}
