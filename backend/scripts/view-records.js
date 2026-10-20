const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/game.db');

if (!fs.existsSync(DB_PATH)) {
  console.log('No database found. Play and complete a game first, then run this again.');
  process.exit(0);
}

const db = new DatabaseSync(DB_PATH);
const rows = db.prepare('SELECT * FROM game_sessions ORDER BY created_at DESC').all();

if (rows.length === 0) {
  console.log('No game records yet. Complete a game first!');
  process.exit(0);
}

console.log(`\n=== Game Records (${rows.length} total) ===\n`);

rows.forEach((row, i) => {
  const mins = Math.floor(row.time_seconds / 60).toString().padStart(2, '0');
  const secs = (row.time_seconds % 60).toString().padStart(2, '0');
  console.log(`#${i + 1}`);
  console.log(`  Date:       ${row.created_at}`);
  console.log(`  Difficulty: ${row.difficulty}`);
  console.log(`  Moves:      ${row.moves}`);
  console.log(`  Pairs:      ${row.matched_pairs} / 8`);
  console.log(`  Time:       ${mins}:${secs}`);
  console.log(`  Result:     ${row.completed ? 'Won ✓' : 'Incomplete'}`);
  console.log('');
});

db.close();
