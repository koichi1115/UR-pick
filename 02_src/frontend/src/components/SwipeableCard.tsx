import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import './SwipeableCard.css';

/**
 * SwipeableCardコンポーネントのプロパティ
 */
interface SwipeableCardProps {
  product: Product;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isActive?: boolean;
  onCardClick?: (product: Product) => void;
}

// スワイプの閾値（この距離以上ドラッグしたらスワイプとみなす）
const SWIPE_THRESHOLD = 150;

// ドラッグ中の回転角度の係数
const ROTATION_FACTOR = 0.1;

/**
 * SwipeableCardコンポーネント
 * ドラッグ&スワイプ可能な商品カード
 */
export function SwipeableCard({
  product,
  onSwipeLeft,
  onSwipeRight,
  isActive = true,
  onCardClick,
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  // スプリングアニメーションの設定
  const [{ x, y, rotate, scale, opacity }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    config: { tension: 300, friction: 30 },
  }));

  // ドラッグジェスチャーハンドラー
  const bind = useDrag(
    ({ down, movement: [mx, my], velocity: [vx], direction: [dx] }) => {
      // アクティブでない場合はドラッグを無効化
      if (!isActive) return;

      setIsDragging(down);

      // スワイプトリガー条件
      const trigger = Math.abs(mx) > SWIPE_THRESHOLD || (Math.abs(vx) > 0.5 && Math.abs(mx) > 50);

      if (!down && trigger) {
        // スワイプ完了時のアニメーション
        const swipeDirection = dx > 0 ? 1 : -1;
        api.start({
          x: swipeDirection * window.innerWidth,
          rotate: swipeDirection * 45,
          opacity: 0,
          config: { tension: 200, friction: 20 },
          onRest: () => {
            // スワイプ方向に応じたコールバック
            if (swipeDirection > 0) {
              onSwipeRight();
            } else {
              onSwipeLeft();
            }

            // 位置をリセット
            api.start({
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
              opacity: 1,
              immediate: true,
            });
          },
        });
      } else {
        // ドラッグ中またはリリース時の位置更新
        api.start({
          x: down ? mx : 0,
          y: down ? my : 0,
          rotate: down ? mx * ROTATION_FACTOR : 0,
          scale: down ? 1.05 : 1,
          opacity: 1,
          immediate: (key) => down && (key === 'x' || key === 'y'),
        });
      }
    },
    {
      filterTaps: true,
      axis: undefined, // 両方向にドラッグ可能
    }
  );

  // スワイプ方向のインジケーター（左右にドラッグ中に表示）
  const showLikeIndicator = x.get() > 50;
  const showDislikeIndicator = x.get() < -50;

  return (
    <div className="swipeable-card">
      <animated.div
        {...bind()}
        style={{
          x,
          y,
          rotate,
          scale,
          opacity,
          touchAction: 'none',
        }}
        className="swipeable-card__animated"
      >
        <ProductCard product={product} isDragging={isDragging} onCardClick={onCardClick} />

        {/* スワイプインジケーター */}
        {showLikeIndicator && (
          <div className="swipeable-card__indicator swipeable-card__indicator--like">
            <span className="swipeable-card__indicator-icon">👍</span>
            <span className="swipeable-card__indicator-text">気に入った</span>
          </div>
        )}

        {showDislikeIndicator && (
          <div className="swipeable-card__indicator swipeable-card__indicator--dislike">
            <span className="swipeable-card__indicator-icon">👎</span>
            <span className="swipeable-card__indicator-text">興味なし</span>
          </div>
        )}
      </animated.div>
    </div>
  );
}
