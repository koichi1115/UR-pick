import { query, queryOne } from '../database/index.js';
import type { User, CreateUserInput } from '../types/database.js';

/**
 * User model for database operations
 */
export class UserModel {
  /**
   * Create a new user
   */
  static async create(input: CreateUserInput = {}): Promise<User> {
    const sql = input.user_id
      ? `INSERT INTO users (user_id) VALUES ($1) RETURNING *`
      : `INSERT INTO users DEFAULT VALUES RETURNING *`;

    const params = input.user_id ? [input.user_id] : [];
    const user = await queryOne<User>(sql, params);

    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(userId: string): Promise<User | null> {
    const sql = `SELECT * FROM users WHERE user_id = $1`;
    return queryOne<User>(sql, [userId]);
  }

  /**
   * Find all users
   */
  static async findAll(limit = 100): Promise<User[]> {
    const sql = `SELECT * FROM users ORDER BY created_at DESC LIMIT $1`;
    return query<User>(sql, [limit]);
  }

  /**
   * Update user's last login time
   */
  static async updateLastLogin(userId: string): Promise<User | null> {
    const sql = `
      UPDATE users
      SET last_login_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `;
    return queryOne<User>(sql, [userId]);
  }

  /**
   * Delete user by ID
   */
  static async delete(userId: string): Promise<boolean> {
    const sql = `DELETE FROM users WHERE user_id = $1`;
    const result = await query(sql, [userId]);
    return result.length > 0;
  }

  /**
   * Get user count
   */
  static async count(): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM users`;
    const result = await queryOne<{ count: string }>(sql);
    return result ? parseInt(result.count, 10) : 0;
  }
}
