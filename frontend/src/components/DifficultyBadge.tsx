import type { Difficulty } from '../types/game';
import styles from './DifficultyBadge.module.css';

interface Props {
  difficulty: Difficulty;
  upgraded?: boolean;
}

export function DifficultyBadge({ difficulty, upgraded }: Props) {
  return (
    <span
      className={`${styles.badge} ${difficulty === 'hard' ? styles.hard : styles.easy}`}
      aria-label={`Difficulty: ${difficulty}${upgraded ? ' (auto-upgraded)' : ''}`}
      data-testid="difficulty-badge"
    >
      {difficulty === 'easy' ? '🟢 Easy' : '🔴 Hard'}
      {upgraded && <span className={styles.upgraded} aria-hidden="true"> ↑</span>}
    </span>
  );
}
