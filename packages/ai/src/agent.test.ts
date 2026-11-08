import { describe, expect, it } from 'vitest';
import { simulateReadableStream } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';
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

  it('forwards lifecycle hooks and timeout settings without a parallel runtime', () => {
    const events: string[] = [];
    const agent = createHarnessAgent({
      model,
      instructions: 'Use approved tools only.',
      timeout: { totalMs: 60_000, stepMs: 20_000 },
      onStart: () => { events.push('start'); },
      onStepStart: () => { events.push('step-start'); },
      onToolExecutionStart: () => { events.push('tool-start'); },
      onToolExecutionEnd: () => { events.push('tool-end'); },
      onStepEnd: () => { events.push('step-end'); },
      onEnd: () => { events.push('end'); },
      onAbort: () => { events.push('abort'); },
      onError: () => { events.push('error'); },
    });
    expect(agent.stream).toBeTypeOf('function');
    expect(events).toEqual([]); // Construction cannot execute tools, providers, or hooks.
  });

  it('streams through AI SDK and forwards start/step/finish callbacks', async () => {
    const events: string[] = [];
    const streamingModel = new MockLanguageModelV3({
      doStream: async () => ({
        stream: simulateReadableStream({
          chunks: [
            { type: 'text-start', id: 'text-1' },
            { type: 'text-delta', id: 'text-1', delta: 'Shared harness' },
            { type: 'text-end', id: 'text-1' },
            {
              type: 'finish',
              finishReason: { unified: 'stop' as const, raw: undefined },
              usage: {
                inputTokens: { total: 2, noCache: 2, cacheRead: undefined, cacheWrite: undefined },
                outputTokens: { total: 2, text: 2, reasoning: undefined },
              },
            },
          ],
        }),
      }),
    });
    const agent = createHarnessAgent({
      model: streamingModel,
      instructions: 'Respond with a short sentence.',
      maxSteps: 2,
      onStart: () => { events.push('start'); },
      onStepStart: () => { events.push('step-start'); },
      onStepEnd: () => { events.push('step-end'); },
      onEnd: () => { events.push('end'); },
      onError: () => { events.push('error'); },
    });
    const result = await agent.stream({ prompt: 'Test streaming' });
    expect(await result.text).toBe('Shared harness');
    expect(events).toContain('start');
    expect(events).toContain('step-start');
    expect(events).toContain('step-end');
    expect(events).toContain('end');
    expect(events).not.toContain('error');
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
