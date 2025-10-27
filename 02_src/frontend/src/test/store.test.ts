import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '../store/userStore';
import { useRecommendationStore } from '../store/recommendationStore';

describe('User Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.setState({
      userId: null,
      preferences: {},
      isInitialized: false,
      swipeHistory: [],
      swipeCount: 0,
    });
  });

  it('should initialize with null userId', () => {
    const { userId } = useUserStore.getState();
    expect(userId).toBeNull();
  });

  it('should set userId', () => {
    const testUserId = 'test-user-123';
    useUserStore.getState().setUserId(testUserId);

    const { userId } = useUserStore.getState();
    expect(userId).toBe(testUserId);
  });

  it('should track swipes', () => {
    useUserStore.getState().addSwipe('product-123', 'like');

    const { swipeHistory, swipeCount } = useUserStore.getState();
    expect(swipeHistory).toHaveLength(1);
    expect(swipeHistory[0]?.productId).toBe('product-123');
    expect(swipeHistory[0]?.action).toBe('like');
    expect(swipeCount).toBe(1);
  });

  it('should reset state', () => {
    // Add some data first
    useUserStore.getState().setUserId('test-123');
    useUserStore.getState().addSwipe('product-123', 'like');

    // Reset
    useUserStore.getState().reset();

    const state = useUserStore.getState();
    expect(state.userId).toBeNull();
    expect(state.swipeHistory).toHaveLength(0);
    expect(state.swipeCount).toBe(0);
  });
});

describe('Recommendation Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useRecommendationStore.setState({
      products: [],
      currentIndex: 0,
      isLoading: false,
      error: null,
    });
  });

  it('should initialize with empty products', () => {
    const { products } = useRecommendationStore.getState();
    expect(products).toEqual([]);
  });

  it('should set loading state', () => {
    useRecommendationStore.getState().setLoading(true);

    const { isLoading } = useRecommendationStore.getState();
    expect(isLoading).toBe(true);
  });

  it('should set error', () => {
    const errorMessage = 'Test error';
    useRecommendationStore.getState().setError(errorMessage);

    const { error } = useRecommendationStore.getState();
    expect(error).toBe(errorMessage);
  });

  it('should increment index', () => {
    const testProducts = [
      {
        id: '1',
        name: 'Product 1',
        price: 1000,
        imageUrl: '',
        source: 'amazon' as const,
        description: 'Test product 1',
        affiliateUrl: 'https://example.com/1',
        rating: 4.5,
        reviewCount: 100,
        recommendReason: 'Great product',
      },
      {
        id: '2',
        name: 'Product 2',
        price: 2000,
        imageUrl: '',
        source: 'rakuten' as const,
        description: 'Test product 2',
        affiliateUrl: 'https://example.com/2',
        rating: 4.0,
        reviewCount: 50,
        recommendReason: 'Good value',
      },
    ];

    useRecommendationStore.setState({ products: testProducts });
    useRecommendationStore.getState().nextProduct();

    const { currentIndex } = useRecommendationStore.getState();
    expect(currentIndex).toBe(1);
  });
});
