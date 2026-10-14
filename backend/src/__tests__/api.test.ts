import path from 'path';
import fs from 'fs';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

const TEST_DB_DIR = path.join(__dirname, '../../data-test');
process.env['DB_DIR'] = TEST_DB_DIR;

import app from '../index';

function cleanDb() {
  const dbFile = path.join(TEST_DB_DIR, 'game.db');
  for (const f of [dbFile, dbFile + '-shm', dbFile + '-wal']) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
}

beforeAll(() => { cleanDb(); });
afterAll(() => { cleanDb(); });

let counter = 0;
function makeSession(overrides: Record<string, unknown> = {}) {
  counter++;
  return {
    id: `test-session-${counter}-${Date.now()}`,
    difficulty: 'easy',
    moves: 12,
    matched_pairs: 8,
    time_seconds: 60,
    completed: true,
    ...overrides,
  };
}

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/sessions', () => {
  it('creates a session and returns 201', async () => {
    const body = makeSession();
    const res = await request(app).post('/api/sessions').send(body);
    expect(res.status).toBe(201);
    expect(res.body.session.id).toBe(body.id);
    expect(res.body.session.difficulty).toBe('easy');
    expect(res.body.session.completed).toBe(true);
  });

  it('returns 409 for duplicate session id', async () => {
    const body = makeSession({ id: 'dup-id-409' });
    await request(app).post('/api/sessions').send(body);
    const res2 = await request(app).post('/api/sessions').send(body);
    expect(res2.status).toBe(409);
    expect(res2.body.error).toMatch(/already exists/i);
  });

  it('returns 400 when id is missing', async () => {
    const { id: _id, ...body } = makeSession();
    const res = await request(app).post('/api/sessions').send(body);
    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('id'))).toBe(true);
  });

  it('returns 400 for invalid difficulty', async () => {
    const body = makeSession({ difficulty: 'medium' });
    const res = await request(app).post('/api/sessions').send(body);
    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('difficulty'))).toBe(true);
  });

  it('returns 400 for negative moves', async () => {
    const body = makeSession({ moves: -1 });
    const res = await request(app).post('/api/sessions').send(body);
    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('moves'))).toBe(true);
  });

  it('returns 400 for matched_pairs > 8', async () => {
    const body = makeSession({ matched_pairs: 9 });
    const res = await request(app).post('/api/sessions').send(body);
    expect(res.status).toBe(400);
  });

  it('returns 400 when completed is not boolean', async () => {
    const body = makeSession({ completed: 'yes' });
    const res = await request(app).post('/api/sessions').send(body);
    expect(res.status).toBe(400);
  });

  it('accepts hard difficulty', async () => {
    const body = makeSession({ difficulty: 'hard' });
    const res = await request(app).post('/api/sessions').send(body);
    expect(res.status).toBe(201);
    expect(res.body.session.difficulty).toBe('hard');
  });
});

describe('GET /api/sessions', () => {
  it('returns sessions array', async () => {
    const res = await request(app).get('/api/sessions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.sessions)).toBe(true);
  });

  it('includes previously saved sessions', async () => {
    const body = makeSession({ id: 'get-list-unique' });
    await request(app).post('/api/sessions').send(body);
    const res = await request(app).get('/api/sessions');
    expect(res.body.sessions.some((s: { id: string }) => s.id === 'get-list-unique')).toBe(true);
  });

  it('respects limit query param', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/sessions').send(makeSession());
    }
    const res = await request(app).get('/api/sessions?limit=2');
    expect(res.body.sessions.length).toBeLessThanOrEqual(2);
  });
});

describe('GET /api/sessions/:id', () => {
  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/sessions/totally-unknown-xyz');
    expect(res.status).toBe(404);
  });

  it('returns the session by id', async () => {
    const body = makeSession({ id: 'fetch-by-id-test' });
    await request(app).post('/api/sessions').send(body);
    const res = await request(app).get('/api/sessions/fetch-by-id-test');
    expect(res.status).toBe(200);
    expect(res.body.session.id).toBe('fetch-by-id-test');
  });
});
