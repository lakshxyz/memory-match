import { getDb } from './db';
import { appendRecord } from './records';
import type { GameSession, CreateSessionBody } from './types';

export function createSession(data: CreateSessionBody): GameSession {
  const db = getDb();

  const existing = db
    .prepare('SELECT id FROM game_sessions WHERE id = ?')
    .get(data.id);

  if (existing) {
    throw new Error(`Session ${data.id} already exists`);
  }

  db.prepare(`
    INSERT INTO game_sessions (id, difficulty, moves, matched_pairs, time_seconds, completed)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.id,
    data.difficulty,
    data.moves,
    data.matched_pairs,
    data.time_seconds,
    data.completed ? 1 : 0
  );

  const saved = getSession(data.id) as GameSession;
  appendRecord(saved);
  return saved;
}

export function getSession(id: string): GameSession | undefined {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM game_sessions WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return rowToSession(row);
}

export function listSessions(limit = 20): GameSession[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM game_sessions ORDER BY created_at DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[];
  return rows.map(rowToSession);
}

function rowToSession(row: Record<string, unknown>): GameSession {
  return {
    id: row['id'] as string,
    difficulty: row['difficulty'] as 'easy' | 'hard',
    moves: row['moves'] as number,
    matched_pairs: row['matched_pairs'] as number,
    time_seconds: row['time_seconds'] as number,
    completed: (row['completed'] as number) === 1,
    created_at: row['created_at'] as string,
  };
}
