import './Spinner.css';

/**
 * Spinnerコンポーネントのプロパティ
 */
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

/**
 * Spinnerコンポーネント（ローディング表示）
 */
export function Spinner({ size = 'medium', color = '#4299e1' }: SpinnerProps) {
  const sizeClass = `spinner--${size}`;

  return (
    <div className={`spinner ${sizeClass}`}>
      <div className="spinner__circle" style={{ borderTopColor: color }} />
    </div>
  );
}
