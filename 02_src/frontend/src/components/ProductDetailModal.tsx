import type { Product } from '../types';
import { Modal } from './ui';
import './ProductDetailModal.css';

/**
 * ProductDetailModalコンポーネントのプロパティ
 */
interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onPurchase?: (product: Product) => void;
}

/**
 * ProductDetailModalコンポーネント
 * 商品の詳細情報を表示するモーダル
 */
export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onPurchase,
}: ProductDetailModalProps) {
  if (!product) return null;

  const handlePurchaseClick = () => {
    // アフィリエイトリンクを新しいタブで開く
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');

    // コールバックがあれば実行
    if (onPurchase) {
      onPurchase(product);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="product-detail">
        {/* 商品画像 */}
        <div className="product-detail__image-section">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-detail__image"
          />
          <div className="product-detail__source-badge">{product.source}</div>
        </div>

        {/* 商品情報 */}
        <div className="product-detail__info-section">
          {/* 商品名 */}
          <h2 className="product-detail__name">{product.name}</h2>

          {/* 価格 */}
          <div className="product-detail__price">
            ¥{product.price.toLocaleString()}
          </div>

          {/* レーティング */}
          {product.rating && (
            <div className="product-detail__rating">
              <div className="product-detail__rating-stars">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.floor(product.rating)
                        ? 'product-detail__star product-detail__star--filled'
                        : 'product-detail__star'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="product-detail__rating-value">
                {product.rating.toFixed(1)}
              </span>
              {product.reviewCount && (
                <span className="product-detail__rating-count">
                  ({product.reviewCount.toLocaleString()}件のレビュー)
                </span>
              )}
            </div>
          )}

          {/* 説明 */}
          {product.description && (
            <div className="product-detail__section">
              <h3 className="product-detail__section-title">商品説明</h3>
              <p className="product-detail__description">{product.description}</p>
            </div>
          )}

          {/* レコメンデーション理由 */}
          {product.recommendReason && (
            <div className="product-detail__section product-detail__recommendation">
              <h3 className="product-detail__section-title">
                おすすめの理由
              </h3>
              <p className="product-detail__recommendation-text">
                {product.recommendReason}
              </p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="product-detail__actions">
            <button
              type="button"
              className="product-detail__purchase-button"
              onClick={handlePurchaseClick}
            >
              <span className="product-detail__purchase-icon">🛒</span>
              <span className="product-detail__purchase-text">
                {product.source === 'amazon' && 'Amazonで購入'}
                {product.source === 'rakuten' && '楽天市場で購入'}
                {product.source === 'yahoo' && 'Yahoo!ショッピングで購入'}
              </span>
            </button>

            <p className="product-detail__affiliate-notice">
              ※外部サイトへ移動します
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
