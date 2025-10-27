import './SwipeButtons.css';

/**
 * SwipeButtonsコンポーネントのプロパティ
 */
interface SwipeButtonsProps {
  onDislike: () => void;
  onLike: () => void;
  disabled?: boolean;
}

/**
 * SwipeButtonsコンポーネント
 * スワイプ操作用のボタン（左: 興味なし、右: 気に入った）
 */
export function SwipeButtons({ onDislike, onLike, disabled = false }: SwipeButtonsProps) {
  return (
    <div className="swipe-buttons">
      <button
        type="button"
        className="swipe-buttons__button swipe-buttons__button--dislike"
        onClick={onDislike}
        disabled={disabled}
        aria-label="興味なし"
      >
        <span className="swipe-buttons__icon">✕</span>
      </button>

      <button
        type="button"
        className="swipe-buttons__button swipe-buttons__button--like"
        onClick={onLike}
        disabled={disabled}
        aria-label="気に入った"
      >
        <span className="swipe-buttons__icon">♥</span>
      </button>
    </div>
  );
}
