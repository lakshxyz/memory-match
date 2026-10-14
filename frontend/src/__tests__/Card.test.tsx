import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '../components/Card';
import type { Card as CardType } from '../types/game';

function makeCard(overrides: Partial<CardType> = {}): CardType {
  return {
    id: 0,
    symbol: '🍎',
    pairId: 0,
    isFlipped: false,
    isMatched: false,
    ...overrides,
  };
}

describe('Card component', () => {
  it('renders as a button with "Hidden card" label when face-down', () => {
    render(<Card card={makeCard()} onClick={vi.fn()} disabled={false} />);
    expect(screen.getByRole('button', { name: /hidden card/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked and not flipped', () => {
    const handler = vi.fn();
    render(<Card card={makeCard()} onClick={handler} disabled={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledWith(0);
  });

  it('does NOT call onClick when already flipped', () => {
    const handler = vi.fn();
    render(<Card card={makeCard({ isFlipped: true })} onClick={handler} disabled={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT call onClick when matched', () => {
    const handler = vi.fn();
    render(<Card card={makeCard({ isMatched: true, isFlipped: true })} onClick={handler} disabled={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT call onClick when disabled', () => {
    const handler = vi.fn();
    render(<Card card={makeCard()} onClick={handler} disabled={true} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('responds to Enter key', () => {
    const handler = vi.fn();
    render(<Card card={makeCard()} onClick={handler} disabled={false} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handler).toHaveBeenCalledWith(0);
  });

  it('responds to Space key', () => {
    const handler = vi.fn();
    render(<Card card={makeCard()} onClick={handler} disabled={false} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(handler).toHaveBeenCalledWith(0);
  });

  it('shows the symbol in aria-label when flipped', () => {
    render(<Card card={makeCard({ isFlipped: true })} onClick={vi.fn()} disabled={false} />);
    expect(screen.getByRole('button', { name: /🍎.*flipped/i })).toBeInTheDocument();
  });

  it('shows "matched" in aria-label when matched', () => {
    render(<Card card={makeCard({ isFlipped: true, isMatched: true })} onClick={vi.fn()} disabled={false} />);
    expect(screen.getByRole('button', { name: /matched/i })).toBeInTheDocument();
  });
});
