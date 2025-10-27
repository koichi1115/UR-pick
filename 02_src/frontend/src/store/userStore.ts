import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SwipeAction } from '../types';
import { createUser, updateUserPreferences } from '../api';

/**
 * ユーザー設定の型定義
 */
interface UserPreferences {
  preferredPriceRange?: {
    min: number;
    max: number;
  };
  preferredCategories?: string[];
  preferredBrands?: string[];
}

/**
 * ユーザー状態の型定義
 */
interface UserState {
  // ユーザーID（セッションベース）
  userId: string | null;

  // ユーザー設定
  preferences: UserPreferences;

  // スワイプ履歴（セッション中のみ）
  swipeHistory: Array<{
    productId: string;
    action: SwipeAction;
    timestamp: Date;
  }>;

  // スワイプ数
  swipeCount: number;

  // 初期化済みフラグ
  isInitialized: boolean;

  // Actions
  initializeUser: () => Promise<void>;
  setUserId: (userId: string) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  addSwipe: (productId: string, action: SwipeAction) => void;
  reset: () => void;
}

/**
 * ユーザー状態管理ストア
 * LocalStorageに永続化（userId, preferences, swipeCount）
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      preferences: {},
      swipeHistory: [],
      swipeCount: 0,
      isInitialized: false,

      initializeUser: async () => {
        const state = get();
        if (state.isInitialized) return;

        // Create new user if no userId exists
        if (!state.userId) {
          try {
            const { userId } = await createUser();
            set({ userId, isInitialized: true });
          } catch (error) {
            console.error('Failed to create user:', error);
          }
        } else {
          set({ isInitialized: true });
        }
      },

      setUserId: (userId) => set({ userId }),

      updatePreferences: async (preferences) => {
        const state = get();
        if (!state.userId) return;

        try {
          // Map frontend preference names to backend API format
          const apiPreferences = {
            priceRange: preferences.preferredPriceRange,
            categories: preferences.preferredCategories,
            brands: preferences.preferredBrands,
          };
          await updateUserPreferences(state.userId, apiPreferences);
          set((state) => ({
            preferences: { ...state.preferences, ...preferences },
          }));
        } catch (error) {
          console.error('Failed to update preferences:', error);
        }
      },

      addSwipe: (productId, action) =>
        set((state) => ({
          swipeHistory: [
            ...state.swipeHistory,
            {
              productId,
              action,
              timestamp: new Date(),
            },
          ],
          swipeCount: state.swipeCount + 1,
        })),

      reset: () =>
        set({
          userId: null,
          preferences: {},
          swipeHistory: [],
          swipeCount: 0,
          isInitialized: false,
        }),
    }),
    {
      name: 'ur-pick-user-storage',
      partialize: (state) => ({
        userId: state.userId,
        preferences: state.preferences,
        swipeCount: state.swipeCount,
      }),
    }
  )
);
