import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import type { Product } from '../types';
import './ProductCard.css';

/**
 * ProductCardコンポーネントのプロパティ
 */
interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  product: Product;
  isDragging?: boolean;
  onCardClick?: (product: Product) => void;
}

/**
 * ProductCardコンポーネント
 * 商品情報を表示するカード
 */
export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, isDragging = false, onCardClick, className = '', ...props }, ref) => {
    const classes = ['product-card', isDragging && 'product-card--dragging', className]
      .filter(Boolean)
      .join(' ');

    const handleClick = () => {
      // ドラッグ中はクリックイベントを無視
      if (isDragging) return;

      // propsのonClickがある場合は実行しない（スワイプジェスチャーと競合するため）
      if (props.onClick) return;

      if (onCardClick) {
        onCardClick(product);
      }
    };

    return (
      <div ref={ref} className={classes} {...props}>
        {/* 詳細表示ボタン */}
        {onCardClick && (
          <button
            type="button"
            className="product-card__detail-button"
            onClick={handleClick}
            aria-label="商品詳細を見る"
          >
            詳細を見る
          </button>
        )}

        {/* 商品画像 */}
        <div className="product-card__image-container">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-card__image"
            loading="lazy"
          />
          <div className="product-card__source">{product.source}</div>
        </div>

        {/* 商品情報 */}
        <div className="product-card__content">
          <h3 className="product-card__name">{product.name}</h3>

          {product.description && (
            <p className="product-card__description">{product.description}</p>
          )}

          <div className="product-card__details">
            {/* 価格 */}
            <div className="product-card__price">¥{product.price.toLocaleString()}</div>

            {/* レーティング */}
            {product.rating && (
              <div className="product-card__rating">
                <span className="product-card__rating-stars">★</span>
                <span className="product-card__rating-value">{product.rating.toFixed(1)}</span>
                {product.reviewCount && (
                  <span className="product-card__rating-count">
                    ({product.reviewCount.toLocaleString()})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* レコメンデーション理由 */}
          {product.recommendReason && (
            <div className="product-card__reason">
              <div className="product-card__reason-label">おすすめの理由</div>
              <p className="product-card__reason-text">{product.recommendReason}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';
