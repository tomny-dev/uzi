import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { AIChatComponents, AIChatMessage } from './AIChat';
import { AIChat, AIChatView } from './AIChat';

/**
 * Storybook-only AI SDK UI-message stream. No real AI provider, credentials,
 * global fetch monkey-patching, or external service is required.
 */
let demoResponseSequence = 0;

const demoFetch: typeof fetch = async (input, init) => {
  const target = new URL(
    typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
    'http://localhost',
  );
  if (!target.pathname.startsWith('/__uzi-storybook__/chat')) {
    throw new Error('Storybook AIChat mock received an unexpected request');
  }
  if (target.pathname.endsWith('/error')) {
    return new Response('Simulated provider failure', { status: 503, statusText: 'Service Unavailable' });
  }

  const body = JSON.parse(String(init?.body ?? '{}')) as {
    messages?: Array<{ role?: string; parts?: Array<{ type?: string; text?: string }> }>;
  };
  const lastUser = body.messages?.filter((message) => message.role === 'user').slice(-1)[0];
  const prompt = lastUser?.parts?.filter((part) => part.type === 'text')
    .map((part) => part.text ?? '').join(' ') || 'Hello';

  const responseId = ++demoResponseSequence;
  const events: Array<Record<string, unknown>> = [
    { type: 'start', messageId: `storybook-assistant-${responseId}` },
    { type: 'reasoning-start', id: `reasoning-${responseId}` },
    { type: 'reasoning-delta', id: `reasoning-${responseId}`, delta: 'This is simulated reasoning from Storybook.' },
    { type: 'reasoning-end', id: `reasoning-${responseId}` },
    { type: 'text-start', id: `text-${responseId}` },
    { type: 'text-delta', id: `text-${responseId}`, delta: `You asked: "${prompt}". ` },
    { type: 'text-delta', id: `text-${responseId}`, delta: 'This answer is a local Storybook mock, not a live AI response.' },
    { type: 'text-end', id: `text-${responseId}` },
    { type: 'source-url', sourceId: 'docs', title: 'Uzi documentation', url: 'https://github.com/tomny-dev/uzi' },
    { type: 'data-preview', data: { example: true, source: 'storybook' } },
    { type: 'finish' },
  ];
  const payload = events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n';
  const bytes = new TextEncoder().encode(payload);
  return new Response(
    new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(bytes); controller.close(); } }),
    {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'x-vercel-ai-ui-message-stream': 'v1',
      },
    },
  );
};

const customComponents: AIChatComponents = {
  ReasoningRenderer: ({ children }) => <details><summary>How it arrived here</summary><p>{children}</p></details>,
  DataRenderer: ({ data, renderDataItem }) => (
    <section aria-label="Custom structured data">
      <strong>Additional results</strong>
      {data.map((part, index) => <div key={index}>{renderDataItem(part, index)}</div>)}
    </section>
  ),
};

const meta = {
  title: 'Components/AIChat',
  component: AIChat,
  args: {
    api: '/__uzi-storybook__/chat',
    fetch: demoFetch,
    inputPlaceholder: 'Ask the demo assistant...',
  },
  parameters: {
    docs: {
      description: {
        component: 'Self-contained interactive demo using an injected mock fetch. No AI API key or backend is needed.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(36rem, 100%)', height: '30rem', minWidth: 0 }}>
      <AIChat {...args} />
    </div>
  ),
} satisfies Meta<typeof AIChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ScopedChat: Story = {
  args: {
    scope: 'project-123',
    scopeLabel: 'Example project',
    inputPlaceholder: 'Ask about this project...',
  },
};

export const ShortSession: Story = {
  args: {
    messageLimit: 2,
    inputPlaceholder: 'Try sending two questions...',
  },
};

export const CustomRenderers: Story = {
  args: { components: customComponents },
};

export const ErrorAndRetry: Story = {
  args: { api: '/__uzi-storybook__/chat/error' },
  parameters: {
    docs: { description: { story: 'Send a prompt to exercise the error, Retry response and Start new chat controls.' } },
  },
};

/** Demonstrates how a complex consumer supplies its own history, approvals and composer actions. */
function ExternalRuntimeExample() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { id: 'assistant-1', role: 'assistant', parts: [
      { type: 'text', text: 'I prepared a sample ticket. Confirm before recording it.' },
      { type: 'tool-log_bet', state: 'approval-requested', approval: { id: 'example-1' } },
    ] },
  ]);
  const [decision, setDecision] = useState('Waiting for approval');
  const [attachment, setAttachment] = useState(false);
  const approve = (answer: string) => setDecision(answer);
  return (
    <div style={{ height: '30rem', width: 'min(36rem, 100%)' }}>
      <AIChatView
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => {
          if (!draft.trim()) return;
          setMessages((current) => [...current, { id: `user-${current.length}`, role: 'user', parts: [{ type: 'text', text: draft }] }]);
          setDraft('');
        }}
        header={<div style={{ padding: 12 }}>App-owned context: upcoming event</div>}
        composerLeading={<div>
          <button type="button" onClick={() => setAttachment((value) => !value)}>Toggle screenshot</button>
          {attachment && <span> screenshot.png attached</span>}
        </div>}
        toolbarActions={<span>Betty-style controlled runtime</span>}
        components={{
          MessageRenderer: ({ message, renderMessagePart }) => (
            <div style={{ padding: 12 }}>
              {message.parts.map((part, index) => (
                <div key={index}>
                  {(part as { type?: string }).type === 'tool-log_bet' ? (
                    <div>
                      <p>{decision}</p>
                      <button type="button" onClick={() => approve('Approved by user')}>Approve</button>
                      <button type="button" onClick={() => approve('Denied by user')}>Deny</button>
                    </div>
                  ) : renderMessagePart(part as Record<string, unknown>, index)}
                </div>
              ))}
            </div>
          ),
        }}
      />
    </div>
  );
}

export const ExternallyManagedRuntime: Story = {
  render: () => <ExternalRuntimeExample />,
  parameters: {
    docs: { description: { story: 'The host controls chat history, attachments, approval actions and composer state. This demo makes no network requests or wagers.' } },
  },
};
