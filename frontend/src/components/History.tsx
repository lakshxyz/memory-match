import type { SessionRecord } from '../types/game';
import { formatTime } from '../utils/gameLogic';
import styles from './History.module.css';

interface Props {
  sessions: SessionRecord[];
  loading: boolean;
  error: string | null;
}

export function History({ sessions, loading, error }: Props) {
  if (loading) {
    return <p className={styles.info}>Loading history…</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (sessions.length === 0) {
    return (
      <p className={styles.info}>
        No games recorded yet — finish a game to see your history!
      </p>
    );
  }

  return (
    <section aria-label="Game session history">
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Difficulty</th>
              <th scope="col">Moves</th>
              <th scope="col">Pairs</th>
              <th scope="col">Time</th>
              <th scope="col">Result</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={s.id} className={s.completed ? styles.completed : ''}>
                <td>{i + 1}</td>
                <td>
                  <span className={`${styles.badge} ${s.difficulty === 'hard' ? styles.hard : styles.easy}`}>
                    {s.difficulty}
                  </span>
                </td>
                <td>{s.moves}</td>
                <td>{s.matched_pairs} / 8</td>
                <td>{formatTime(s.time_seconds)}</td>
                <td>
                  {s.completed
                    ? <span className={styles.won}>✓ Won</span>
                    : <span className={styles.incomplete}>—</span>}
                </td>
                <td className={styles.date}>
                  {new Date(s.created_at + 'Z').toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
