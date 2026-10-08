import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

const stubs = vi.hoisted(() => ({
  messages: [] as Array<{ id: string; role: 'user' | 'assistant'; parts: Array<Record<string, unknown>> }>,
  status: 'ready',
  error: undefined as Error | undefined,
  sendMessage: vi.fn(),
  clearError: vi.fn(),
  regenerate: vi.fn(),
  stop: vi.fn(),
  transportOptions: [] as unknown[],
}));

vi.mock('./ai-chat.module.css', () => ({
  default: new Proxy({} as Record<string, string>, {
    get(_, key) { return `uzi-${String(key)}`; },
  }),
}));

vi.mock('@assistant-ui/ai-sdk', () => ({
  AssistantChatTransport: class {
    constructor(options: unknown) {
      stubs.transportOptions.push(options);
    }
  },
  AISDKChat: () => ({}),
  useAISDKChat: () => stubs,
}));

vi.mock('@assistant-ui/react', () => ({
  AuiConfig: (options: unknown) => options,
  AuiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ThreadPrimitive: {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Viewport: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ViewportFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

import { AIChat } from './AIChat';

beforeEach(() => {
  stubs.messages = [];
  stubs.status = 'ready';
  stubs.error = undefined;
  stubs.transportOptions = [];
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('AIChat', () => {
  it('sends a trimmed prompt and clears the composer', () => {
    render(<AIChat api="/api/chat" />);
    const input = screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '  Hello  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(stubs.sendMessage).toHaveBeenCalledWith({ text: 'Hello' });
    expect(input.value).toBe('');
  });

  it('allows a consumer-specific accessible input label', () => {
    render(<AIChat api="/api/chat" inputAriaLabel="Ask Tultr a question" />);
    expect(screen.getByRole('textbox', { name: 'Ask Tultr a question' })).toBeTruthy();
  });

  it('sends on Enter but not Shift+Enter', () => {
    render(<AIChat api="/api/chat" />);
    const input = screen.getByRole('textbox', { name: 'Message' });
    fireEvent.change(input, { target: { value: 'Question' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(stubs.sendMessage).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(stubs.sendMessage).toHaveBeenCalledWith({ text: 'Question' });
  });

  it('counts user turns rather than assistant replies toward the limit', () => {
    stubs.messages = [
      { id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'Q1' }] },
      { id: 'assistant-1', role: 'assistant', parts: [{ type: 'text', text: 'A1' }] },
      { id: 'user-2', role: 'user', parts: [{ type: 'text', text: 'Q2' }] },
    ];
    render(<AIChat api="/api/chat" messageLimit={2} />);
    expect(screen.getByText(/2-question limit/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Start new chat' }));
    expect(stubs.stop).toHaveBeenCalledTimes(1);
  });

  it('regenerates a failed answer without duplicating the user prompt', () => {
    stubs.error = new Error('Network failed');
    stubs.status = 'error';
    render(<AIChat api="/api/chat" />);
    expect(screen.getByRole('alert').textContent).toContain('Network failed');
    fireEvent.click(screen.getByRole('button', { name: 'Retry response' }));
    expect(stubs.clearError).toHaveBeenCalled();
    expect(stubs.regenerate).toHaveBeenCalled();
    expect(stubs.sendMessage).not.toHaveBeenCalled();
  });

  it('passes the scope through transport body without replacing AI SDK fields', () => {
    render(<AIChat api="/api/chat" scope="sports-123" scopeLabel="Sports" />);
    expect(stubs.transportOptions).toEqual([{ api: '/api/chat', body: { scope: 'sports-123' } }]);
  });

  it('does not send the human-readable scope label as an authorization scope', () => {
    render(<AIChat api="/api/chat" scopeLabel="My private workspace" />);
    expect(stubs.transportOptions).toEqual([{ api: '/api/chat' }]);
    expect(screen.getByText('My private workspace')).toBeTruthy();
  });

  it('accepts a custom fetch adapter and request headers for consumer APIs', () => {
    const requestFetch: typeof fetch = async () => new Response();
    render(<AIChat api="/api/chat" fetch={requestFetch} credentials="include" headers={{ 'X-Test': 'uzi' }} />);
    expect(stubs.transportOptions).toEqual([{
      api: '/api/chat', fetch: requestFetch, credentials: 'include', headers: { 'X-Test': 'uzi' },
    }]);
  });

  it('preserves the composer during transport option updates', () => {
    const firstFetch: typeof fetch = async () => new Response();
    const nextFetch: typeof fetch = async () => new Response();
    const { rerender } = render(<AIChat api="/api/chat" fetch={firstFetch} />);
    const input = screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Unsent draft' } });
    rerender(<AIChat api="/api/chat" fetch={nextFetch} />);
    expect((screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement).value).toBe('Unsent draft');
    expect(stubs.transportOptions[stubs.transportOptions.length - 1]).toEqual({ api: '/api/chat', fetch: nextFetch });
  });

  it('resets the composer when sessionKey changes between authenticated users', () => {
    const { rerender } = render(<AIChat api="/api/chat" sessionKey="user-one" />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), { target: { value: 'Private draft' } });
    rerender(<AIChat api="/api/chat" sessionKey="user-two" />);
    expect((screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement).value).toBe('');
  });

  it('allows starting a new session before reaching the question limit', () => {
    stubs.messages = [{ id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'hello' }] }];
    render(<AIChat api="/api/chat" />);
    fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
    expect(stubs.stop).toHaveBeenCalledTimes(1);
  });

  it('renders reasoning, source links and data using optional renderers', () => {
    stubs.messages = [{
      id: 'assistant-1', role: 'assistant', parts: [
        { type: 'text', text: 'Answer' },
        { type: 'reasoning', text: 'Analysis' },
        { type: 'source-url', sourceId: 's1', url: 'https://example.com', title: 'Example' },
        { type: 'data-weather', data: { celsius: 21 } },
      ],
    }];
    render(<AIChat api="/api/chat" components={{
      ReasoningRenderer: ({ children }) => <em>{children}</em>,
      DataRenderer: ({ data }) => <output>{JSON.stringify(data[0].data)}</output>,
    }} />);
    expect(screen.getByText('Answer')).toBeTruthy();
    expect(screen.getByText('Analysis')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Example' }).getAttribute('href')).toBe('https://example.com');
    expect(screen.getByText('{"celsius":21}')).toBeTruthy();
  });

  it('does not turn an untrusted source scheme into a clickable link', () => {
    stubs.messages = [{
      id: 'assistant-1', role: 'assistant', parts: [
        { type: 'source-url', sourceId: 's1', url: 'javascript:alert(1)', title: 'Unsafe' },
      ],
    }];
    render(<AIChat api="/api/chat" />);
    expect(screen.getByText('Unsafe')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('keeps Stop available while streaming the final allowed response', () => {
    stubs.messages = [
      { id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'Last question' }] },
    ];
    stubs.status = 'streaming';
    render(<AIChat api="/api/chat" messageLimit={1} />);
    expect(screen.getByRole('button', { name: 'Stop' })).toBeTruthy();
    expect(screen.queryByText(/1-question limit/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(stubs.stop).toHaveBeenCalledTimes(1);
  });

  it('offers a Stop button while streaming and disables the input', () => {
    stubs.status = 'streaming';
    render(<AIChat api="/api/chat" />);
    expect((screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(stubs.stop).toHaveBeenCalledTimes(1);
  });
});
