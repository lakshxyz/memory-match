import { formatTime } from '../utils/gameLogic';
import styles from './Stats.module.css';

interface Props {
  moves: number;
  matchedPairs: number;
  elapsedSeconds: number;
}

export function Stats({ moves, matchedPairs, elapsedSeconds }: Props) {
  return (
    <div className={styles.stats} role="status" aria-live="polite" aria-label="Game statistics">
      <div className={styles.stat}>
        <span className={styles.label}>Moves</span>
        <span className={styles.value} data-testid="stat-moves">{moves}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Pairs</span>
        <span className={styles.value} data-testid="stat-pairs">{matchedPairs} / 8</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Time</span>
        <span className={styles.value} data-testid="stat-time">{formatTime(elapsedSeconds)}</span>
      </div>
    </div>
  );
}
