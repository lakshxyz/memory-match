import fs from 'fs';
import path from 'path';
import type { GameSession } from './types';

const RECORDS_PATH = path.join(
  process.env.DB_DIR ?? path.join(__dirname, '..', 'data'),
  'records.json'
);

interface RecordEntry {
  number: number;
  date: string;
  difficulty: string;
  moves: number;
  pairs: string;
  time: string;
  result: string;
}

interface RecordsFile {
  total_games: number;
  last_updated: string;
  games: RecordEntry[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function appendRecord(session: GameSession): void {
  let existing: RecordsFile = { total_games: 0, last_updated: '', games: [] };

  if (fs.existsSync(RECORDS_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(RECORDS_PATH, 'utf-8')) as RecordsFile;
    } catch {
      existing = { total_games: 0, last_updated: '', games: [] };
    }
  }

  const newEntry: RecordEntry = {
    number: existing.games.length + 1,
    date: session.created_at,
    difficulty: session.difficulty,
    moves: session.moves,
    pairs: `${session.matched_pairs} / 8`,
    time: formatTime(session.time_seconds),
    result: session.completed ? 'Won ✓' : 'Incomplete',
  };

  existing.games.unshift(newEntry);

  existing.games = existing.games.map((g, i) => ({ ...g, number: existing.games.length - i }));

  existing.total_games = existing.games.length;
  existing.last_updated = new Date().toISOString();

  fs.writeFileSync(RECORDS_PATH, JSON.stringify(existing, null, 2), 'utf-8');
}
