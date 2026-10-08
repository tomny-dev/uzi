import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FloatingActionButton, FloatingActionStack } from './FloatingActionStack';

afterEach(cleanup);

describe('FloatingActionStack', () => {
  it('keeps ordered independent launchers available without a menu', () => {
    const onSlip = vi.fn();
    const onBetty = vi.fn();
    render(
      <FloatingActionStack label="BetForge actions">
        <FloatingActionButton label="Bet Slip (3)" icon={<span>3</span>} variant="secondary" onClick={onSlip}>Bet Slip (3)</FloatingActionButton>
        <FloatingActionButton label="Betty" icon={<span>B</span>} onClick={onBetty}>Betty</FloatingActionButton>
      </FloatingActionStack>,
    );
    const navigation = screen.getByRole('navigation', { name: 'BetForge actions' });
    expect(navigation.querySelectorAll('button')).toHaveLength(2);
    expect(Array.from(navigation.querySelectorAll('button')).map((node) => node.getAttribute('aria-label'))).toEqual(['Bet Slip (3)', 'Betty']);
    fireEvent.click(screen.getByRole('button', { name: 'Bet Slip (3)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Betty' }));
    expect(onSlip).toHaveBeenCalledOnce();
    expect(onBetty).toHaveBeenCalledOnce();
  });

  it('retains accessible names on icon-only actions', () => {
    render(<FloatingActionButton label="Open Betty" icon={<svg aria-hidden="true"/>} />);
    expect(screen.getByRole('button', { name: 'Open Betty' })).toBeTruthy();
  });
});
