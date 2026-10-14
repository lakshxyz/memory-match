import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Board } from '../components/Board';
import { buildDeck } from '../utils/gameLogic';

describe('Board component', () => {
  it('renders 16 cards', () => {
    const cards = buildDeck(1);
    render(<Board cards={cards} onCardClick={vi.fn()} isChecking={false} />);
    expect(screen.getAllByRole('button')).toHaveLength(16);
  });

  it('passes the right card id to onCardClick', () => {
    const handler = vi.fn();
    const cards = buildDeck(1);
    render(<Board cards={cards} onCardClick={handler} isChecking={false} />);
    // Click the first card
    screen.getAllByRole('button')[0].click();
    expect(handler).toHaveBeenCalledWith(cards[0].id);
  });

  it('all cards are disabled when isChecking=true', () => {
    const handler = vi.fn();
    const cards = buildDeck(1);
    render(<Board cards={cards} onCardClick={handler} isChecking={true} />);
    screen.getAllByRole('button').forEach(btn => {
      btn.click();
    });
    expect(handler).not.toHaveBeenCalled();
  });
});
