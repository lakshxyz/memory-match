import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stats } from '../components/Stats';

describe('Stats component', () => {
  it('renders moves correctly', () => {
    render(<Stats moves={7} matchedPairs={3} elapsedSeconds={45} />);
    expect(screen.getByTestId('stat-moves')).toHaveTextContent('7');
  });

  it('renders matched pairs as fraction', () => {
    render(<Stats moves={7} matchedPairs={3} elapsedSeconds={45} />);
    expect(screen.getByTestId('stat-pairs')).toHaveTextContent('3 / 8');
  });

  it('formats time as mm:ss', () => {
    render(<Stats moves={0} matchedPairs={0} elapsedSeconds={75} />);
    expect(screen.getByTestId('stat-time')).toHaveTextContent('01:15');
  });

  it('renders 00:00 when elapsed is 0', () => {
    render(<Stats moves={0} matchedPairs={0} elapsedSeconds={0} />);
    expect(screen.getByTestId('stat-time')).toHaveTextContent('00:00');
  });
});
