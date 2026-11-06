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
  it('rejects missing server-owned instructions', () => {
    expect(() => createHarnessAgent({ model, instructions: '  ' })).toThrow();
  });
});
