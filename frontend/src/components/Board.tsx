import { Card } from './Card';
import type { Card as CardType } from '../types/game';
import styles from './Board.module.css';

interface Props {
  cards: CardType[];
  onCardClick: (id: number) => void;
  isChecking: boolean;
}

export function Board({ cards, onCardClick, isChecking }: Props) {
  return (
    <section
      className={styles.board}
      aria-label="Memory match game board — 4 by 4 grid"
    >
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          onClick={onCardClick}
          disabled={isChecking}
        />
      ))}
    </section>
  );
}
