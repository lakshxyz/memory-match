import type { SessionPayload, SessionRecord } from '../types/game';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

export async function saveSession(payload: SessionPayload): Promise<SessionRecord> {
  const res = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.session as SessionRecord;
}

export async function fetchSessions(limit = 20): Promise<SessionRecord[]> {
  const res = await fetch(`${BASE}/sessions?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.sessions as SessionRecord[];
}
