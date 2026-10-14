import { useCallback, useEffect, useReducer, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { buildDeck, FLIP_BACK_DELAY, shouldUpgradeDifficulty, TOTAL_PAIRS } from '../utils/gameLogic';
import type { Card, Difficulty, GameState } from '../types/game';

type Action =
  | { type: 'FLIP_CARD'; cardId: number }
  | { type: 'CHECK_MATCH' }
  | { type: 'TICK' }
  | { type: 'RESTART'; seed: number; difficulty: Difficulty }
  | { type: 'UPGRADE_DIFFICULTY' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {

    case 'FLIP_CARD': {
      if (state.isChecking) return state;
      if (state.selected.length >= 2) return state;

      const card = state.cards.find(c => c.id === action.cardId);
      if (!card) return state;
      if (card.isFlipped || card.isMatched) return state;
      if (state.selected.includes(action.cardId)) return state;

      const newCards = state.cards.map(c =>
        c.id === action.cardId ? { ...c, isFlipped: true } : c
      );
      const newSelected = [...state.selected, action.cardId];
      const newStatus = state.status === 'idle' ? 'playing' : state.status;

      return {
        ...state,
        cards: newCards,
        selected: newSelected,
        status: newStatus,
        moves: newSelected.length === 2 ? state.moves + 1 : state.moves,
        isChecking: newSelected.length === 2,
      } as GameState;
    }

    case 'CHECK_MATCH': {
      if (state.selected.length !== 2) return state;
      const [idA, idB] = state.selected;
      const cardA = state.cards.find(c => c.id === idA)!;
      const cardB = state.cards.find(c => c.id === idB)!;

      const isMatch = cardA.pairId === cardB.pairId;

      let newCards: Card[];
      if (isMatch) {
        newCards = state.cards.map(c =>
          c.id === idA || c.id === idB ? { ...c, isMatched: true, isFlipped: true } : c
        );
      } else {
        newCards = state.cards.map(c =>
          c.id === idA || c.id === idB ? { ...c, isFlipped: false } : c
        );
      }

      const newMatchedPairs = isMatch ? state.matchedPairs + 1 : state.matchedPairs;
      const isWon = newMatchedPairs === TOTAL_PAIRS;

      return {
        ...state,
        cards: newCards,
        selected: [],
        isChecking: false,
        matchedPairs: newMatchedPairs,
        status: isWon ? 'won' : 'playing',
      } as GameState;
    }

    case 'TICK':
      if (state.status !== 'playing') return state;
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

    case 'UPGRADE_DIFFICULTY':
      return { ...state, difficulty: 'hard' };

    case 'RESTART':
      return initialState(action.seed, action.difficulty);

    default:
      return state;
  }
}

function initialState(seed: number, difficulty: Difficulty): GameState {
  return {
    cards: buildDeck(seed),
    difficulty,
    status: 'idle',
    moves: 0,
    matchedPairs: 0,
    elapsedSeconds: 0,
    seed,
    selected: [],
    isChecking: false,
  };
}

export function useGame(initialDifficulty: Difficulty = 'easy') {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => initialState(Date.now(), initialDifficulty)
  );

  const mismatchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string>(uuidv4());

  useEffect(() => {
    if (state.status !== 'playing') return;
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(interval);
  }, [state.status]);

  useEffect(() => {
    if (!state.isChecking) return;
    const delay = FLIP_BACK_DELAY[state.difficulty];
    const timer = setTimeout(() => {
      dispatch({ type: 'CHECK_MATCH' });
    }, delay);
    mismatchTimerRef.current = timer;
    return () => clearTimeout(timer);
  }, [state.isChecking, state.difficulty]);

  useEffect(() => {
    if (
      shouldUpgradeDifficulty(
        state.matchedPairs,
        state.moves,
        state.elapsedSeconds,
        state.difficulty
      )
    ) {
      dispatch({ type: 'UPGRADE_DIFFICULTY' });
    }
  }, [state.matchedPairs, state.moves, state.elapsedSeconds, state.difficulty]);

  const flipCard = useCallback((cardId: number) => {
    dispatch({ type: 'FLIP_CARD', cardId });
  }, []);

  const restart = useCallback((difficulty: Difficulty = 'easy') => {
    if (mismatchTimerRef.current !== null) {
      clearTimeout(mismatchTimerRef.current);
      mismatchTimerRef.current = null;
    }
    sessionIdRef.current = uuidv4();
    dispatch({ type: 'RESTART', seed: Date.now(), difficulty });
  }, []);

  return { state, flipCard, restart, sessionId: sessionIdRef.current };
}
