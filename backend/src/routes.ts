import { Router, Request, Response } from 'express';
import { createSession, listSessions, getSession } from './sessions';
import type { CreateSessionBody } from './types';

const router = Router();

router.post('/sessions', (req: Request, res: Response) => {
  const body = req.body as Partial<CreateSessionBody>;
  const errors: string[] = [];

  if (!body.id || typeof body.id !== 'string' || body.id.trim() === '') {
    errors.push('id is required and must be a non-empty string');
  }

  if (!body.difficulty || !['easy', 'hard'].includes(body.difficulty)) {
    errors.push("difficulty must be 'easy' or 'hard'");
  }

  if (
    body.moves === undefined ||
    typeof body.moves !== 'number' ||
    !Number.isInteger(body.moves) ||
    body.moves < 0
  ) {
    errors.push('moves must be a non-negative integer');
  }

  if (
    body.matched_pairs === undefined ||
    typeof body.matched_pairs !== 'number' ||
    !Number.isInteger(body.matched_pairs) ||
    body.matched_pairs < 0 ||
    body.matched_pairs > 8
  ) {
    errors.push('matched_pairs must be an integer between 0 and 8');
  }

  if (
    body.time_seconds === undefined ||
    typeof body.time_seconds !== 'number' ||
    !Number.isInteger(body.time_seconds) ||
    body.time_seconds < 0
  ) {
    errors.push('time_seconds must be a non-negative integer');
  }

  if (body.completed === undefined || typeof body.completed !== 'boolean') {
    errors.push('completed must be a boolean');
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  try {
    const session = createSession(body as CreateSessionBody);
    res.status(201).json({ session });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('already exists')) {
      res.status(409).json({ error: message });
    } else {
      console.error('[POST /sessions]', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/sessions', (_req: Request, res: Response) => {
  try {
    const rawLimit = _req.query.limit;
    const limit =
      rawLimit !== undefined
        ? Math.min(Math.max(parseInt(String(rawLimit), 10) || 20, 1), 100)
        : 20;
    const sessions = listSessions(limit);
    res.json({ sessions });
  } catch (err) {
    console.error('[GET /sessions]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/sessions/:id', (req: Request, res: Response) => {
  try {
    const session = getSession(req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json({ session });
  } catch (err) {
    console.error('[GET /sessions/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
