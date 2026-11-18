import { describe, expect, it } from 'vitest';

import { resolveChatActivityLabel } from './activityLabel';

describe('resolveChatActivityLabel', () => {
  const toolActivityLabels = {
    log_bet: 'Saving your bet…',
    'log_bet:input-available': 'Preparing bet for review…',
    'log_bet:approval-responded': 'Saving approved bet…',
  };

  it('falls back to the application activity label while no tool is running', () => {
    expect(resolveChatActivityLabel({ activityLabel: 'Working on your response…' }))
      .toBe('Working on your response…');
  });

  it('prefers a state-specific application label for the running tool state', () => {
    expect(resolveChatActivityLabel({
      toolName: 'log_bet', toolState: 'input-available', toolActivityLabels, activityLabel: 'Working…',
    })).toBe('Preparing bet for review…');
  });

  it('falls back to the generic tool label when the application supplies no labels', () => {
    expect(resolveChatActivityLabel({ toolName: 'log_bet', toolState: 'input-available', activityLabel: 'Working…' }))
      .toBe('Using a tool…');
  });

  it('uses the plain tool label when the running tool has no state', () => {
    expect(resolveChatActivityLabel({ toolName: 'log_bet', toolActivityLabels, activityLabel: 'Working…' }))
      .toBe('Saving your bet…');
  });

  it('always shows the waiting label for approval requests, even with a state-specific label', () => {
    expect(resolveChatActivityLabel({
      toolName: 'log_bet',
      toolState: 'approval-requested',
      toolActivityLabels: { ...toolActivityLabels, 'log_bet:approval-requested': 'Review your bet…' },
      activityLabel: 'Working…',
    })).toBe('Waiting for approval…');
  });

  it('shows the approved state label when the application supplies one', () => {
    expect(resolveChatActivityLabel({
      toolName: 'log_bet', toolState: 'approval-responded', approved: true, toolActivityLabels, activityLabel: 'Working…',
    })).toBe('Saving approved bet…');
  });

  it('falls back down the label chain after an approved response without a state label', () => {
    expect(resolveChatActivityLabel({
      toolName: 'log_bet', toolState: 'approval-responded', approved: true,
      toolActivityLabels: { log_bet: 'Saving your bet…' }, activityLabel: 'Working…',
    })).toBe('Saving your bet…');
    expect(resolveChatActivityLabel({
      toolName: 'log_bet', toolState: 'approval-responded', approved: true, activityLabel: 'Working…',
    })).toBe('Using a tool…');
  });

  it('never shows an application label for a denied approval response', () => {
    expect(resolveChatActivityLabel({
      toolName: 'log_bet', toolState: 'approval-responded', approved: false, toolActivityLabels, activityLabel: 'Working…',
    })).toBe('Processing approval response…');
  });

  it('treats a missing approved flag as a denied response', () => {
    expect(resolveChatActivityLabel({
      toolName: 'log_bet', toolState: 'approval-responded', toolActivityLabels, activityLabel: 'Working…',
    })).toBe('Processing approval response…');
  });
});
