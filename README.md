# 🧠 Memory Match — Cerevyn PS09 Assessment

An **Adaptive Memory Matching Game** built as a complete full-stack application. The 4×4 card board adapts its difficulty mid-game based on player performance, saves anonymous session results to a SQLite database, and displays session history.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Installation](#installation)
5. [Running Locally](#running-locally)
6. [Running Tests](#running-tests)
7. [Building for Production](#building-for-production)
8. [API Reference](#api-reference)
9. [Sample Inputs & Outputs](#sample-inputs--outputs)
10. [Docker](#docker)
11. [CI/CD](#cicd)
12. [Azure Deployment](#azure-deployment)
13. [Design Decisions](#design-decisions)
14. [Demo Instructions](#demo-instructions)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | CSS Modules |
| Backend | Node.js 24, Express 4 |
| Database | SQLite via `node:sqlite` (built-in, no native compile) |
| Testing | Vitest 3, React Testing Library |
| Container | Docker + docker-compose |
| CI | GitHub Actions |
| Deployment | Microsoft Azure (plan in `docs/azure-plan.md`) |

---

## Features

### Game
- **4×4 board** with 8 matching pairs of emoji cards
- **Seeded card shuffle** — deterministic per seed (mulberry32 PRNG + Fisher-Yates)
- **Two difficulty levels** — Easy (1200 ms flip-back delay) and Hard (700 ms)
- **Adaptive difficulty** — auto-upgrades Easy → Hard mid-game when performance exceeds thresholds
- **Live statistics** — move counter, matched pairs, and an active play timer

### Edge-case handling
| Scenario | Behaviour |
|----------|-----------|
| Rapid double-click | Second click on the same card is ignored |
| Click during check pause | All clicks blocked until verdict fires |
| Click a matched card | Ignored |
| Restart during pending mismatch timer | Timer cancelled immediately, no stale state |
| Already-matched card clicked | No state change |

### Backend / Data
- **`POST /api/sessions`** — saves a completed game; validates all fields; returns 409 on duplicate session ID
- **`GET /api/sessions`** — returns up to 20 recent sessions (configurable via `?limit=N`)
- **`GET /api/sessions/:id`** — fetches a single session
- **Session history panel** — rendered inline in the game UI

---

## Project Structure

```
memory-match/
├── backend/
│   ├── src/
│   │   ├── db.ts           # node:sqlite singleton + schema init
│   │   ├── sessions.ts     # CRUD operations
│   │   ├── routes.ts       # Express router with validation
│   │   ├── index.ts        # App entry point
│   │   ├── types.ts        # Shared TypeScript interfaces
│   │   └── __tests__/
│   │       └── api.test.ts # 14 integration tests (supertest)
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── types/game.ts       # Shared types
│   │   ├── utils/
│   │   │   ├── shuffle.ts      # seededRng + shuffleArray
│   │   │   └── gameLogic.ts    # buildDeck, difficulty helpers, formatTime
│   │   ├── hooks/
│   │   │   └── useGame.ts      # Core game reducer + all side effects
│   │   ├── api/sessions.ts     # fetch wrapper for backend
│   │   ├── components/
│   │   │   ├── Board.tsx / .module.css
│   │   │   ├── Card.tsx / .module.css
│   │   │   ├── Stats.tsx / .module.css
│   │   │   ├── DifficultyBadge.tsx / .module.css
│   │   │   ├── WinBanner.tsx / .module.css
│   │   │   └── History.tsx / .module.css
│   │   ├── App.tsx / App.module.css
│   │   ├── main.tsx
│   │   └── __tests__/          # 43 unit tests
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   └── azure-plan.md       # Step-by-step Azure deployment
│
├── .github/
│   └── workflows/ci.yml    # GitHub Actions CI
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Installation

### Prerequisites

- **Node.js ≥ 22** (the project uses the built-in `node:sqlite` module, available from Node 22+)
- **npm ≥ 10**

### Install all dependencies

```bash
# From the project root
npm run install:all
```

Or install individually:

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Running Locally

### 1. Start the backend API

```bash
cd backend
npm run dev
```

The API starts on **http://localhost:4000**. You should see:
```
Memory Match API running on http://localhost:4000
```

### 2. Start the frontend dev server

In a new terminal:

```bash
cd frontend
npm run dev
```

The game opens at **http://localhost:5173**. The Vite dev server proxies `/api/*` requests to `localhost:4000` automatically.

---

## Running Tests

### All tests (from root)

```bash
npm test
```

### Backend tests only

```bash
cd backend
npm test
```

Expected output:
```
✓ GET /health (1)
  ✓ returns 200 with status ok
✓ POST /api/sessions (8)
  ✓ creates a session and returns 201
  ✓ returns 409 for duplicate session id
  ...
Tests  14 passed (14)
```

### Frontend tests only

```bash
cd frontend
npm test
```

Expected output:
```
✓ src/__tests__/shuffle.test.ts (7 tests)
✓ src/__tests__/gameLogic.test.ts (16 tests)
✓ src/__tests__/Card.test.tsx (9 tests)
✓ src/__tests__/Stats.test.tsx (4 tests)
✓ src/__tests__/DifficultyBadge.test.tsx (4 tests)
✓ src/__tests__/Board.test.tsx (3 tests)
Tests  43 passed (43)
```

**Total: 57 tests, all passing.**

---

## Building for Production

### Backend

```bash
cd backend
npm run build
# Output: backend/dist/
```

### Frontend

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

---

## API Reference

Base URL (local): `http://localhost:4000`

### `GET /health`

Returns API health status.

**Response 200:**
```json
{ "status": "ok", "timestamp": "2026-10-13T09:00:00.000Z" }
```

---

### `POST /api/sessions`

Save a completed game session.

**Request body:**
```json
{
  "id":            "550e8400-e29b-41d4-a716-446655440000",
  "difficulty":    "easy",
  "moves":         18,
  "matched_pairs": 8,
  "time_seconds":  72,
  "completed":     true
}
```

**Response 201:**
```json
{
  "session": {
    "id":            "550e8400-e29b-41d4-a716-446655440000",
    "difficulty":    "easy",
    "moves":         18,
    "matched_pairs": 8,
    "time_seconds":  72,
    "completed":     true,
    "created_at":    "2026-10-13 09:00:00"
  }
}
```

**Response 400** (validation error):
```json
{
  "error": "Validation failed",
  "details": ["difficulty must be 'easy' or 'hard'"]
}
```

**Response 409** (duplicate session):
```json
{ "error": "Session 550e8400-... already exists" }
```

---

### `GET /api/sessions?limit=20`

Retrieve recent sessions, newest first.

**Response 200:**
```json
{
  "sessions": [
    {
      "id": "...",
      "difficulty": "hard",
      "moves": 12,
      "matched_pairs": 8,
      "time_seconds": 45,
      "completed": true,
      "created_at": "2026-10-13 09:05:00"
    }
  ]
}
```

---

### `GET /api/sessions/:id`

Fetch a single session by ID.

**Response 200:** same shape as one session object above.
**Response 404:** `{ "error": "Session not found" }`

---

## Sample Inputs & Outputs

### Save a game session via curl

```bash
curl -s -X POST http://localhost:4000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "demo-session-001",
    "difficulty": "easy",
    "moves": 20,
    "matched_pairs": 8,
    "time_seconds": 95,
    "completed": true
  }' | jq .
```

**Output:**
```json
{
  "session": {
    "id": "demo-session-001",
    "difficulty": "easy",
    "moves": 20,
    "matched_pairs": 8,
    "time_seconds": 95,
    "completed": true,
    "created_at": "2026-10-13 09:00:00"
  }
}
```

### Fetch session history

```bash
curl -s http://localhost:4000/api/sessions | jq '.sessions | length'
# 1
```

### Validation error example

```bash
curl -s -X POST http://localhost:4000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"id":"x","difficulty":"medium","moves":5,"matched_pairs":2,"time_seconds":30,"completed":true}' | jq .
```

**Output:**
```json
{
  "error": "Validation failed",
  "details": ["difficulty must be 'easy' or 'hard'"]
}
```

---

## Docker

### Build and run with docker-compose

```bash
docker-compose up --build
```

- Frontend: http://localhost:80
- Backend: http://localhost:4000

### Build images individually

```bash
# Backend
docker build -t memory-match-backend ./backend

# Frontend
docker build -t memory-match-frontend ./frontend
```

### Run backend standalone

```bash
docker run -p 4000:4000 \
  -v $(pwd)/data:/app/data \
  -e CORS_ORIGIN=http://localhost:5173 \
  memory-match-backend
```

---

## CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`

Triggers on push to `main`/`develop` and pull requests to `main`.

**Jobs:**

| Job | What it does |
|-----|-------------|
| `backend` | `npm ci` → `tsc --noEmit` → `npm test` → `npm run build` |
| `frontend` | `npm ci` → `tsc --noEmit` → `npm test` → `npm run build` |
| `docker` | Docker build smoke test for both images (after tests pass) |

Both jobs run against **Node 22 and Node 24** in a matrix.

---

## Azure Deployment

See [`docs/azure-plan.md`](docs/azure-plan.md) for the full step-by-step guide covering:

- Azure Static Web Apps (frontend, free tier)
- Azure App Service B1 Linux (backend, ~$13/month)
- SQLite persistence on App Service `/home` volume
- CORS configuration
- CI/CD integration with GitHub Actions

---

## Design Decisions

### Why `node:sqlite` instead of `better-sqlite3`?

`better-sqlite3` requires native compilation (node-gyp + C++ toolchain). On Node 24, prebuilt binaries aren't available yet, making fresh installs fail in CI or constrained environments. `node:sqlite` is built into Node 22+ — no compilation, no extra dependency, always available.

### Why a pure reducer for game state?

`useReducer` keeps all game transitions in a single pure function, making the logic easy to reason about and test without mounting React components. Side effects (timers, API calls) live in `useEffect` hooks outside the reducer.

### Why seeded shuffle?

A seeded PRNG (mulberry32) makes card layouts reproducible for a given seed, which is useful for testing (predictable layouts) and could support features like sharing a specific layout via URL in the future.

### Adaptive difficulty thresholds

After 4 pairs matched, the game checks:
- `movesPerPair ≤ 2.5` (playing very efficiently) **OR**
- `elapsedSeconds < 30` (playing very fast)

If either is true on Easy difficulty, it upgrades to Hard (shorter flip-back delay). The thresholds are intentionally lenient so players can observe the upgrade in a short demo.

---

## Demo Instructions

1. **Install and start:**
   ```bash
   npm run install:all
   # Terminal 1:
   cd backend && npm run dev
   # Terminal 2:
   cd frontend && npm run dev
   ```

2. Open **http://localhost:5173**

3. **Demonstrate adaptive difficulty:**
   - Start playing on Easy
   - Flip cards efficiently — after 4+ matches with a good moves-per-pair ratio, the badge changes from 🟢 Easy to 🔴 Hard (the ↑ indicator appears)

4. **Demonstrate edge cases:**
   - Click the same card twice rapidly — only one flip registers
   - Click a third card while two are face-up — blocked until the check fires
   - Restart mid-game using the 🔄 Easy or 🔥 Hard buttons

5. **Demonstrate session history:**
   - Win a game — the WinBanner shows, and the result is POSTed to the backend
   - Click **📋 History** to see the saved session

6. **Run the tests:**
   ```bash
   npm test
   # Expect: 57 tests passed
   ```
