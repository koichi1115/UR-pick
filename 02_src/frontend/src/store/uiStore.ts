import { create } from 'zustand';
import type { Product } from '../types';

/**
 * UI状態の型定義
 */
interface UIState {
  // モーダル状態
  isProductModalOpen: boolean;
  selectedProduct: Product | null;

  // 通知状態
  notification: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;

  // Actions
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  hideNotification: () => void;
}

/**
 * UI状態管理ストア
 */
export const useUIStore = create<UIState>((set) => ({
  isProductModalOpen: false,
  selectedProduct: null,
  notification: null,

  openProductModal: (product) =>
    set({
      isProductModalOpen: true,
      selectedProduct: product,
    }),

  closeProductModal: () =>
    set({
      isProductModalOpen: false,
      selectedProduct: null,
    }),

  showNotification: (message, type) =>
    set({
      notification: { message, type },
    }),

  hideNotification: () =>
    set({
      notification: null,
    }),
}));
