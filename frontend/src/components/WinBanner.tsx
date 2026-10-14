import type { Difficulty } from '../types/game';
import { formatTime } from '../utils/gameLogic';
import styles from './WinBanner.module.css';

interface Props {
  moves: number;
  elapsedSeconds: number;
  difficulty: Difficulty;
  onRestart: (difficulty: Difficulty) => void;
  saving: boolean;
  saveError: string | null;
}

export function WinBanner({ moves, elapsedSeconds, difficulty, onRestart, saving, saveError }: Props) {
  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-title"
      data-testid="win-banner"
    >
      <div className={styles.card}>
        <div className={styles.emoji} aria-hidden="true">🎉</div>
        <h2 id="win-title" className={styles.title}>You matched all pairs!</h2>

        <dl className={styles.summary}>
          <div className={styles.row}>
            <dt>Moves</dt>
            <dd data-testid="win-moves">{moves}</dd>
          </div>
          <div className={styles.row}>
            <dt>Time</dt>
            <dd>{formatTime(elapsedSeconds)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Difficulty</dt>
            <dd style={{ textTransform: 'capitalize' }}>{difficulty}</dd>
          </div>
        </dl>

        {saving && (
          <p className={styles.saving} aria-live="polite">Saving result…</p>
        )}
        {saveError && (
          <p className={styles.error} role="alert">{saveError}</p>
        )}

        <div className={styles.buttons}>
          <button
            className={`${styles.btn} ${styles.btnEasy}`}
            onClick={() => onRestart('easy')}
            autoFocus
          >
            Play again (Easy)
          </button>
          <button
            className={`${styles.btn} ${styles.btnHard}`}
            onClick={() => onRestart('hard')}
          >
            Play again (Hard)
          </button>
        </div>
      </div>
    </div>
  );
}
