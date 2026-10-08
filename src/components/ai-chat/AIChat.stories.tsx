import type { Meta, StoryObj } from '@storybook/react';
import type { AIChatComponents } from './AIChat';
import { AIChat } from './AIChat';

/**
 * Storybook-only AI SDK UI-message stream. No real AI provider, credentials,
 * global fetch monkey-patching, or external service is required.
 */
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

  const events: Array<Record<string, unknown>> = [
    { type: 'start', messageId: 'storybook-assistant' },
    { type: 'reasoning-start', id: 'reasoning-1' },
    { type: 'reasoning-delta', id: 'reasoning-1', delta: 'This is simulated reasoning from Storybook.' },
    { type: 'reasoning-end', id: 'reasoning-1' },
    { type: 'text-start', id: 'text-1' },
    { type: 'text-delta', id: 'text-1', delta: `You asked: "${prompt}". ` },
    { type: 'text-delta', id: 'text-1', delta: 'This answer is a local Storybook mock, not a live AI response.' },
    { type: 'text-end', id: 'text-1' },
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
