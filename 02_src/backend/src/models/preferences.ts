import { query, queryOne } from '../database/index.js';
import type {
  UserPreferencesRecord,
  UserPreferencesData,
  UpdateUserPreferencesInput,
} from '../types/database.js';

/**
 * User preferences model for database operations
 */
export class UserPreferencesModel {
  /**
   * Create or update user preferences (UPSERT)
   */
  static async upsert(input: UpdateUserPreferencesInput): Promise<UserPreferencesRecord> {
    const sql = `
      INSERT INTO user_preferences (user_id, preferences)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET
        preferences = $2,
        updated_at = NOW()
      RETURNING *
    `;

    const params = [input.user_id, JSON.stringify(input.preferences)];

    const prefs = await queryOne<UserPreferencesRecord>(sql, params);

    if (!prefs) {
      throw new Error('Failed to upsert user preferences');
    }

    return prefs;
  }

  /**
   * Get user preferences by user ID
   */
  static async findByUserId(userId: string): Promise<UserPreferencesRecord | null> {
    const sql = `SELECT * FROM user_preferences WHERE user_id = $1`;
    return queryOne<UserPreferencesRecord>(sql, [userId]);
  }

  /**
   * Merge new preferences with existing ones
   */
  static async merge(
    userId: string,
    newPreferences: Partial<UserPreferencesData>
  ): Promise<UserPreferencesRecord> {
    // Get existing preferences
    const existing = await this.findByUserId(userId);
    const currentPrefs = existing?.preferences || {};

    // Merge preferences
    const mergedPrefs: UserPreferencesData = {
      ...currentPrefs,
      ...newPreferences,
    };

    // Upsert merged preferences
    return this.upsert({ user_id: userId, preferences: mergedPrefs });
  }

  /**
   * Add preferred category
   */
  static async addPreferredCategory(
    userId: string,
    category: string
  ): Promise<UserPreferencesRecord> {
    const existing = await this.findByUserId(userId);
    const categories = existing?.preferences.preferredCategories || [];

    if (!categories.includes(category)) {
      categories.push(category);
    }

    return this.merge(userId, { preferredCategories: categories });
  }

  /**
   * Add preferred brand
   */
  static async addPreferredBrand(
    userId: string,
    brand: string
  ): Promise<UserPreferencesRecord> {
    const existing = await this.findByUserId(userId);
    const brands = existing?.preferences.preferredBrands || [];

    if (!brands.includes(brand)) {
      brands.push(brand);
    }

    return this.merge(userId, { preferredBrands: brands });
  }

  /**
   * Update preferred price range
   */
  static async updatePriceRange(
    userId: string,
    priceRange: { min: number; max: number }
  ): Promise<UserPreferencesRecord> {
    return this.merge(userId, { preferredPriceRange: priceRange });
  }

  /**
   * Delete user preferences
   */
  static async delete(userId: string): Promise<boolean> {
    const sql = `DELETE FROM user_preferences WHERE user_id = $1`;
    const result = await query(sql, [userId]);
    return result.length > 0;
  }
}
