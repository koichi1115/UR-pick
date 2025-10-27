import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecommendationStore, useUIStore } from '../store';
import { useSwipe } from '../hooks';
import { SwipeableCard } from '../components/SwipeableCard';
import { SwipeButtons } from '../components/SwipeButtons';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { Button, Spinner } from '../components/ui';
import './SwipePage.css';

/**
 * SwipePage - Tinder型スワイプUI画面
 * レコメンドされた商品をスワイプして好みを学習
 */
export default function SwipePage() {
  const navigate = useNavigate();
  const { products, currentIndex, currentQuery, isLoading } = useRecommendationStore();
  const { swipeLeft, swipeRight, currentProduct, hasMoreProducts } = useSwipe();
  const { isProductModalOpen, selectedProduct, openProductModal, closeProductModal } =
    useUIStore();

  // 商品がない場合はホームに戻る
  useEffect(() => {
    if (!isLoading && products.length === 0) {
      navigate('/');
    }
  }, [products, isLoading, navigate]);

  // ローディング中
  if (isLoading) {
    return (
      <div className="swipe-page">
        <div className="swipe-page__loading">
          <Spinner size="large" />
          <p className="swipe-page__loading-text">商品を探しています...</p>
        </div>
      </div>
    );
  }

  // 全商品スワイプ完了
  if (!hasMoreProducts && products.length > 0) {
    return (
      <div className="swipe-page">
        <div className="swipe-page__complete">
          <div className="swipe-page__complete-icon">✓</div>
          <h2 className="swipe-page__complete-title">全ての商品を確認しました</h2>
          <p className="swipe-page__complete-message">
            「{currentQuery}」の検索結果をすべて確認しました。
          </p>
          <div className="swipe-page__complete-stats">
            <div className="swipe-page__stat">
              <div className="swipe-page__stat-value">{products.length}</div>
              <div className="swipe-page__stat-label">確認した商品</div>
            </div>
          </div>
          <Button variant="primary" size="large" onClick={() => navigate('/')}>
            新しい検索を始める
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-page">
      {/* ヘッダー */}
      <div className="swipe-page__header">
        <button className="swipe-page__back-button" onClick={() => navigate('/')}>
          ← 戻る
        </button>
        <div className="swipe-page__query">「{currentQuery}」</div>
        <div className="swipe-page__counter">
          {currentIndex + 1} / {products.length}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="swipe-page__content">
        {/* 説明テキスト */}
        <p className="swipe-page__instruction">
          スワイプまたはボタンで評価してください
        </p>

        {/* スワイプカードコンテナ */}
        <div className="swipe-page__cards">
          {currentProduct && (
            <SwipeableCard
              product={currentProduct}
              onSwipeLeft={swipeLeft}
              onSwipeRight={swipeRight}
              onCardClick={openProductModal}
              isActive={true}
            />
          )}

          {/* 次のカードをプレビュー表示（透明度低め） */}
          {hasMoreProducts && products[currentIndex + 1] && (
            <div className="swipe-page__next-card">
              <SwipeableCard
                product={products[currentIndex + 1]}
                onSwipeLeft={() => {}}
                onSwipeRight={() => {}}
                isActive={false}
              />
            </div>
          )}
        </div>

        {/* スワイプボタン */}
        <SwipeButtons
          onDislike={swipeLeft}
          onLike={swipeRight}
          disabled={!currentProduct}
        />
      </div>

      {/* 商品詳細モーダル */}
      <ProductDetailModal
        isOpen={isProductModalOpen}
        onClose={closeProductModal}
        product={selectedProduct}
      />
    </div>
  );
}
