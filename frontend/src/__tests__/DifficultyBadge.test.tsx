import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DifficultyBadge } from '../components/DifficultyBadge';

describe('DifficultyBadge component', () => {
  it('shows Easy label for easy difficulty', () => {
    render(<DifficultyBadge difficulty="easy" />);
    expect(screen.getByTestId('difficulty-badge')).toHaveTextContent('Easy');
  });

  it('shows Hard label for hard difficulty', () => {
    render(<DifficultyBadge difficulty="hard" />);
    expect(screen.getByTestId('difficulty-badge')).toHaveTextContent('Hard');
  });

  it('shows upgrade indicator when upgraded', () => {
    render(<DifficultyBadge difficulty="hard" upgraded={true} />);
    const badge = screen.getByTestId('difficulty-badge');
    expect(badge).toHaveTextContent('↑');
    expect(badge).toHaveAttribute('aria-label', expect.stringContaining('auto-upgraded'));
  });

  it('does not show upgrade indicator by default', () => {
    render(<DifficultyBadge difficulty="easy" />);
    expect(screen.getByTestId('difficulty-badge')).not.toHaveTextContent('↑');
  });
});
