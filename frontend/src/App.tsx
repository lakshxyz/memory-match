import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from './hooks/useGame';
import { Board } from './components/Board';
import { Stats } from './components/Stats';
import { DifficultyBadge } from './components/DifficultyBadge';
import { WinBanner } from './components/WinBanner';
import { History } from './components/History';
import { saveSession, fetchSessions } from './api/sessions';
import type { Difficulty, SessionRecord } from './types/game';
import styles from './App.module.css';

export default function App() {
  const { state, flipCard, restart, sessionId } = useGame('easy');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedSessionRef = useRef<string | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [wasUpgraded, setWasUpgraded] = useState(false);
  const prevDifficulty = useRef<Difficulty>('easy');

  useEffect(() => {
    if (state.difficulty === 'hard' && prevDifficulty.current === 'easy') {
      setWasUpgraded(true);
    }
    prevDifficulty.current = state.difficulty;
  }, [state.difficulty]);

  useEffect(() => {
    if (state.status !== 'won') return;
    if (savedSessionRef.current === sessionId) return;

    savedSessionRef.current = sessionId;
    setSaving(true);
    setSaveError(null);

    saveSession({
      id: sessionId,
      difficulty: state.difficulty,
      moves: state.moves,
      matched_pairs: state.matchedPairs,
      time_seconds: state.elapsedSeconds,
      completed: true,
    })
      .then(() => {
        setSaving(false);
        if (showHistory) loadHistory();
      })
      .catch((err: Error) => {
        setSaving(false);
        setSaveError(`Couldn't save: ${err.message}`);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await fetchSessions(20);
      setSessions(data);
    } catch (err: unknown) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleToggleHistory = () => {
    if (!showHistory) loadHistory();
    setShowHistory(h => !h);
  };

  const handleRestart = useCallback((difficulty: Difficulty) => {
    restart(difficulty);
    setWasUpgraded(false);
    setSaveError(null);
    setSaving(false);
    savedSessionRef.current = null;
    if (showHistory) loadHistory();
  }, [restart, showHistory, loadHistory]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🧠 </span>Memory Match
          </h1>
          <div className={styles.headerRight}>
            <DifficultyBadge difficulty={state.difficulty} upgraded={wasUpgraded} />
            <button
              className={styles.historyBtn}
              onClick={handleToggleHistory}
              aria-expanded={showHistory}
              aria-controls="history-panel"
            >
              {showHistory ? 'Hide History' : '📋 History'}
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Stats
          moves={state.moves}
          matchedPairs={state.matchedPairs}
          elapsedSeconds={state.elapsedSeconds}
        />

        <Board
          cards={state.cards}
          onCardClick={flipCard}
          isChecking={state.isChecking}
        />

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnEasy}`}
            onClick={() => handleRestart('easy')}
            aria-label="Restart game on easy difficulty"
          >
            🔄 Easy
          </button>
          <button
            className={`${styles.btn} ${styles.btnHard}`}
            onClick={() => handleRestart('hard')}
            aria-label="Restart game on hard difficulty"
          >
            🔥 Hard
          </button>
        </div>

        {showHistory && (
          <section id="history-panel" className={styles.historySection} aria-label="Game history">
            <h2 className={styles.historyTitle}>Recent Games</h2>
            <History
              sessions={sessions}
              loading={historyLoading}
              error={historyError}
            />
          </section>
        )}
      </main>

      {state.status === 'won' && (
        <WinBanner
          moves={state.moves}
          elapsedSeconds={state.elapsedSeconds}
          difficulty={state.difficulty}
          onRestart={handleRestart}
          saving={saving}
          saveError={saveError}
        />
      )}
    </div>
  );
}
