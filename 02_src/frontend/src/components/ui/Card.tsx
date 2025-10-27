import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Card.css';

/**
 * Cardコンポーネントのプロパティ
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

/**
 * Cardコンポーネント
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', className = '', ...props }, ref) => {
    const classes = ['card', `card--${variant}`, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
