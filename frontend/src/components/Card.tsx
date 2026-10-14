import type { Card as CardType } from '../types/game';
import styles from './Card.module.css';

interface Props {
  card: CardType;
  onClick: (id: number) => void;
  disabled: boolean;
}

export function Card({ card, onClick, disabled }: Props) {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onClick(card.id);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const isRevealed = card.isFlipped || card.isMatched;
  const ariaLabel = isRevealed
    ? `Card ${card.symbol}, ${card.isMatched ? 'matched' : 'flipped'}`
    : 'Hidden card';

  return (
    <div
      className={`${styles.cardWrapper} ${isRevealed ? styles.flipped : ''} ${card.isMatched ? styles.matched : ''}`}
      onClick={handleClick}
      onKeyDown={handleKey}
      role="button"
      tabIndex={card.isMatched || disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-pressed={isRevealed}
      aria-disabled={disabled || card.isMatched}
      data-testid={`card-${card.id}`}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront} aria-hidden="true">
          <span>?</span>
        </div>
        <div className={styles.cardBack} aria-hidden={!isRevealed}>
          <span>{card.symbol}</span>
        </div>
      </div>
    </div>
  );
}
