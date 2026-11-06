import { describe, expect, it } from 'vitest';
import { createHarnessAgent } from './agent.js';

const model = { provider: 'test', modelId: 'fake' } as Parameters<typeof createHarnessAgent>[0]['model'];

describe('createHarnessAgent', () => {
  it('creates an SDK agent with trusted instructions and bounded defaults', () => {
    const agent = createHarnessAgent({ model, instructions: 'Answer from provided tools.' });
    expect(agent).toBeDefined();
    expect(agent.generate).toBeTypeOf('function');
    expect(agent.stream).toBeTypeOf('function');
  });
  it.each([0, -1, 21, 1.5, Number.NaN])('rejects invalid agent limits: %s', (maxSteps) => {
    expect(() => createHarnessAgent({ model, instructions: 'Safe instructions', maxSteps })).toThrow(RangeError);
  });
  it('accepts native SDK orchestration settings without adding a new loop', () => {
    const prepareStep = () => ({ toolChoice: 'none' as const });
    const agent = createHarnessAgent({
      model,
      instructions: 'Use trusted evidence.',
      maxSteps: 7,
      maxRetries: 0,
      maxOutputTokens: 1200,
      prepareStep,
    });
    expect(agent).toBeDefined();
    expect(agent.stream).toBeTypeOf('function');
  });

  it('keeps per-call options optional for consumers with server-owned tools', () => {
    const agent = createHarnessAgent({ model, instructions: 'Use trusted sources.' });
    // Typecheck the call without executing the fake provider.
    const stream = () => agent.stream({ messages: [] });
    expect(stream).toBeTypeOf('function');
  });

  it('rejects missing server-owned instructions', () => {
    expect(() => createHarnessAgent({ model, instructions: '  ' })).toThrow();
  });
});
