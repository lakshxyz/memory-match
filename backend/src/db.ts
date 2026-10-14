import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DB_DIR: string = process.env.DB_DIR ?? path.join(__dirname, '..', 'data');
const DB_PATH: string = path.join(DB_DIR, 'game.db');

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    _db = new DatabaseSync(DB_PATH);
    initSchema(_db);
  }
  return _db;
}

export function resetDb(): void {
  if (_db) {
    try { _db.close(); } catch { _db = null; }
    _db = null;
  }
}

function initSchema(db: DatabaseSync): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS game_sessions (
      id            TEXT    PRIMARY KEY,
      difficulty    TEXT    NOT NULL,
      moves         INTEGER NOT NULL,
      matched_pairs INTEGER NOT NULL,
      time_seconds  INTEGER NOT NULL,
      completed     INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_created
      ON game_sessions(created_at DESC);
  `);
}

process.on('exit', () => {
  if (_db) { try { _db.close(); } catch { /* ignore */ } }
});
