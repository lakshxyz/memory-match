/** A single card on the board */
export interface Card {
  /** Unique position index 0-15 */
  id: number;
  /** The emoji symbol this card shows when flipped */
  symbol: string;
  /** Cards share a pairId with their matching partner */
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export type Difficulty = 'easy' | 'hard';

export type GameStatus = 'idle' | 'playing' | 'won';

export interface GameState {
  cards: Card[];
  difficulty: Difficulty;
  status: GameStatus;
  moves: number;
  matchedPairs: number;
  /** Elapsed playing time in whole seconds */
  elapsedSeconds: number;
  /** Seed used to shuffle this game's cards */
  seed: number;
  /** IDs of the currently selected (face-up, not yet judged) cards */
  selected: number[];
  /** Whether we are in the "check pending" pause between flip and verdict */
  isChecking: boolean;
}

/** Shape saved to the backend */
export interface SessionPayload {
  id: string;
  difficulty: Difficulty;
  moves: number;
  matched_pairs: number;
  time_seconds: number;
  completed: boolean;
}

/** Shape returned from the backend */
export interface SessionRecord extends SessionPayload {
  created_at: string;
}
