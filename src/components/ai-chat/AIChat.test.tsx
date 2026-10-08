import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const stubs = vi.hoisted(() => ({
  messages: [] as Array<{ id: string; role: 'user' | 'assistant'; parts: Array<Record<string, unknown>> }>,
  status: 'ready',
  error: undefined as Error | undefined,
  sendMessage: vi.fn(),
  clearError: vi.fn(),
  regenerate: vi.fn(),
  stop: vi.fn(),
  setMessages: vi.fn(),
  addToolApprovalResponse: vi.fn(),
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

import { AIChat, AIChatView } from './AIChat';

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

  it('accepts a consumer-provided request serializer for strict API routes', () => {
    const serialize: NonNullable<React.ComponentProps<typeof AIChat>['prepareSendMessagesRequest']> =
      ({ messages }) => ({ body: { messages } });
    render(<AIChat api="/api/ask/game" prepareSendMessagesRequest={serialize} />);
    expect(stubs.transportOptions).toEqual([{ api: '/api/ask/game', prepareSendMessagesRequest: serialize }]);
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

describe('AIChatView (external runtime)', () => {
  const message = {
    id: 'persisted-assistant-1',
    role: 'assistant' as const,
    parts: [{ type: 'tool-log_bet', state: 'approval-requested', approval: { id: 'approval-1' } }],
  };

  it('renders app-owned history and specialized approval UI without creating an SDK transport', () => {
    const approve = vi.fn();
    const deny = vi.fn();
    render(
      <AIChatView
        messages={[message]}
        draft=""
        onDraftChange={vi.fn()}
        onSend={vi.fn()}
        components={{
          MessageRenderer: ({ message: entry }) => (
            <div>
              <span>{entry.id}</span>
              <button onClick={approve}>Approve bet</button>
              <button onClick={deny}>Deny bet</button>
            </div>
          ),
        }}
      />,
    );
    expect(screen.getByText('persisted-assistant-1')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Approve bet' }));
    fireEvent.click(screen.getByRole('button', { name: 'Deny bet' }));
    expect(approve).toHaveBeenCalledOnce();
    expect(deny).toHaveBeenCalledOnce();
    expect(stubs.transportOptions).toEqual([]);
    expect(stubs.sendMessage).not.toHaveBeenCalled();
  });

  it('delegates controlled input, attachments, retry and stop to the host', () => {
    const changeDraft = vi.fn();
    const submit = vi.fn();
    const stop = vi.fn();
    const attach = vi.fn();
    const { rerender } = render(
      <AIChatView
        messages={[]}
        status="ready"
        draft="Place a bet"
        onDraftChange={changeDraft}
        onSend={submit}
        composerLeading={<button type="button" onClick={attach}>Attach screenshot</button>}
        toolbarActions={<span>Betty</span>}
      />,
    );
    expect(screen.getByText('Betty')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Attach screenshot' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), { target: { value: 'new draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(attach).toHaveBeenCalledOnce();
    expect(changeDraft).toHaveBeenCalledWith('new draft');
    expect(submit).toHaveBeenCalledOnce();

    rerender(<AIChatView messages={[]} draft="Place a bet" status="streaming" onDraftChange={changeDraft} onSend={submit} onStop={stop} />);
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(stop).toHaveBeenCalledOnce();
  });

  it('supports a custom composer and no default user-turn cap', () => {
    const messages = Array.from({ length: 12 }, (_, index) => ({
      id: `user-${index}`, role: 'user' as const,
      parts: [{ type: 'text', text: `Question ${index}` }],
    }));
    render(<AIChatView messages={messages} composer={<button type="button">Betty composer</button>} />);
    expect(screen.getByRole('button', { name: 'Betty composer' })).toBeTruthy();
    expect(screen.queryByText(/question limit/)).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('cannot send when an error is present or during streaming', () => {
    const send = vi.fn();
    const props = { messages: [], draft: 'Should not send', onDraftChange: vi.fn(), onSend: send };
    const { rerender } = render(<AIChatView {...props} status="streaming" />);
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message' }), { key: 'Enter' });
    expect(send).not.toHaveBeenCalled();
    rerender(<AIChatView {...props} status="error" error={new Error('Network issue')} />);
    expect(screen.getByRole('alert').textContent).toContain('Network issue');
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });
});

describe('AIChat shared opt-in capabilities', () => {
  it('uses SDK-native structured approval response with the exact approval id', async () => {
    stubs.messages = [{
      id: 'assistant-approval',
      role: 'assistant',
      parts: [{ type: 'tool-place_order', state: 'approval-requested', approval: { id: 'approval-42' }, input: { dryRun: true } }],
    }];
    render(<AIChat api="/api/chat" />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(stubs.addToolApprovalResponse).toHaveBeenCalledWith({
      id: 'approval-42', approved: true,
    }));
    expect(stubs.sendMessage).not.toHaveBeenCalled();
  });

  it('allows explicit denial without transmitting text-based approval JSON', async () => {
    stubs.messages = [{
      id: 'assistant-approval',
      role: 'assistant',
      parts: [{ type: 'tool-place_order', state: 'approval-requested', approval: { id: 'approval-77' } }],
    }];
    render(<AIChat api="/api/chat" />);
    fireEvent.click(screen.getByRole('button', { name: 'Deny' }));
    await waitFor(() => expect(stubs.addToolApprovalResponse).toHaveBeenCalledWith({
      id: 'approval-77', approved: false, reason: 'User denied approval',
    }));
    expect(stubs.sendMessage).not.toHaveBeenCalled();
  });

  it('shows staged attachments and rejects unsupported types before sending', () => {
    render(<AIChat api="/api/chat" attachments={{
      accept: 'image/png,image/jpeg', maxFiles: 2, maxBytesPerFile: 1024,
    }} />);
    const picker = screen.getByLabelText('Add attachments') as HTMLInputElement;
    fireEvent.change(picker, { target: { files: [new File(['sample'], 'test.exe', { type: 'application/octet-stream' })] } });
    expect(screen.getByRole('alert').textContent).toContain('Unsupported attachment type');
    expect(stubs.sendMessage).not.toHaveBeenCalled();
    fireEvent.change(picker, { target: { files: [new File(['sample'], 'screen.png', { type: 'image/png' })] } });
    expect(screen.getByText('screen.png')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove screen.png' }));
    expect(screen.queryByText('screen.png')).toBeNull();
  });

  it('does not render upload controls unless file attachments are opted into', () => {
    render(<AIChat api="/api/chat" />);
    expect(screen.queryByLabelText('Add attachments')).toBeNull();
  });

  it('restores app-scoped history through the SDK without sending requests', async () => {
    const restored = [{
      id: 'past-user-1', role: 'user' as const, parts: [{ type: 'text', text: 'Earlier question' }],
    }];
    const adapter = { load: vi.fn(() => restored), save: vi.fn(), clear: vi.fn() };
    render(<AIChat api="/api/chat" history={adapter} />);
    await waitFor(() => expect(stubs.setMessages).toHaveBeenCalled());
    expect(stubs.setMessages).toHaveBeenCalledWith(restored);
    expect(stubs.sendMessage).not.toHaveBeenCalled();
    expect(adapter.load).toHaveBeenCalledTimes(1);
  });

  it('delegates tool action from AIChatView to the existing app approval handler', async () => {
    const respond = vi.fn();
    render(<AIChatView
      messages={[{
        id: 'assistant-approval',
        role: 'assistant',
        parts: [{ type: 'tool-checkout', state: 'approval-requested', approval: { id: 'external-approval' } }],
      }]}
      onToolApproval={respond}
    />);
    fireEvent.click(screen.getByRole('button', { name: 'Deny' }));
    await waitFor(() => expect(respond).toHaveBeenCalledWith('external-approval', false));
    expect(stubs.addToolApprovalResponse).not.toHaveBeenCalled();
  });
});
