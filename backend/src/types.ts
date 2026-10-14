export interface GameSession {
  id: string;
  difficulty: 'easy' | 'hard';
  moves: number;
  matched_pairs: number;
  time_seconds: number;
  completed: boolean;
  created_at: string;
}

export interface CreateSessionBody {
  id: string;
  difficulty: 'easy' | 'hard';
  moves: number;
  matched_pairs: number;
  time_seconds: number;
  completed: boolean;
}
