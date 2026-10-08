'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties, ComponentType, FormEvent, KeyboardEvent, ReactNode } from 'react';

import { AuiConfig, AuiProvider, ThreadPrimitive } from '@assistant-ui/react';
import { AISDKChat, AssistantChatTransport, useAISDKChat } from '@assistant-ui/ai-sdk';

import styles from './ai-chat.module.css';

export interface AIChatProps {
  /** AI SDK UI-message stream endpoint. */
  readonly api: string;
  /** Optional scope forwarded as a request field; the API must validate and enforce it. */
  readonly scopeLabel?: string;
  /** Maximum number of user turns (default: 8). */
  readonly messageLimit?: number;
  readonly inputPlaceholder?: string;
  readonly inputMaxLength?: number;
  readonly components?: AIChatComponents;
  readonly onClose?: () => void;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export interface AIChatComponents {
  readonly MessageRenderer?: ComponentType<AIChatMessageRendererProps>;
  readonly ReasoningRenderer?: ComponentType<AIChatReasoningRendererProps>;
  readonly SourceRenderer?: ComponentType<AIChatSourceRendererProps>;
  readonly DataRenderer?: ComponentType<AIChatDataRendererProps>;
  readonly ErrorRenderer?: ComponentType<AIChatErrorRendererProps>;
}

export interface AIChatMessageRendererProps {
  readonly message: {
    readonly id: string;
    readonly role: 'user' | 'assistant';
    readonly parts: readonly unknown[];
    readonly metadata?: Record<string, unknown>;
  };
  readonly renderMessagePart: (part: Record<string, unknown>, index: number) => ReactNode;
}

export interface AIChatReasoningRendererProps {
  readonly children: string;
  readonly title?: string;
}

export interface AIChatSource {
  readonly id: string;
  readonly title?: string;
  readonly url?: string;
}

export interface AIChatSourceRendererProps {
  readonly sources: readonly AIChatSource[];
  readonly renderSource: (source: AIChatSource, index: number) => ReactNode;
}

export interface AIChatDataRendererProps {
  readonly data: readonly Record<string, unknown>[];
  readonly renderDataItem: (item: Record<string, unknown>, index: number) => ReactNode;
}

export interface AIChatErrorRendererProps {
  readonly error: Error;
  readonly onRetry: () => void;
  readonly onClear: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function safeHttpUrl(value: unknown): string | undefined {
  const url = asString(value);
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

function DefaultMessageRenderer({ message, renderMessagePart }: AIChatMessageRendererProps) {
  return (
    <div className={message.role === 'user' ? styles.userMessage : styles.assistantMessage}>
      {message.parts.map((part, index) => (
        <div key={isRecord(part) && typeof part.id === 'string' ? part.id : index}>
          {isRecord(part) ? renderMessagePart(part, index) : null}
        </div>
      ))}
    </div>
  );
}

function DefaultReasoningRenderer({ children, title = 'Reasoning' }: AIChatReasoningRendererProps) {
  return (
    <details className={styles.reasoning}>
      <summary className={styles.reasoningSummary}>{title}</summary>
      <p className={styles.reasoningText}>{children}</p>
    </details>
  );
}

function DefaultSourceRenderer({ sources, renderSource }: AIChatSourceRendererProps) {
  return (
    <div className={styles.sources}>
      <span className={styles.sourcesLabel}>Sources</span>
      <ul>
        {sources.map((source, index) => (
          <li key={source.id}>{renderSource(source, index)}</li>
        ))}
      </ul>
    </div>
  );
}

function DefaultDataRenderer({ data, renderDataItem }: AIChatDataRendererProps) {
  return (
    <div className={styles.data}>
      {data.map((item, index) => (
        <div key={index}>{renderDataItem(item, index)}</div>
      ))}
    </div>
  );
}

function DefaultErrorRenderer({ error, onRetry, onClear }: AIChatErrorRendererProps) {
  return (
    <div className={styles.error} role="alert">
      <p>{error.message}</p>
      <div className={styles.errorActions}>
        <button type="button" onClick={onRetry}>Retry response</button>
        <button type="button" onClick={onClear}>Start new chat</button>
      </div>
    </div>
  );
}

function renderPart(
  part: Record<string, unknown>,
  index: number,
  components: AIChatComponents | undefined,
): ReactNode {
  const type = asString(part.type) ?? '';
  if (type === 'text') {
    return <span className={styles.textPart}>{asString(part.text) ?? ''}</span>;
  }
  if (type === 'reasoning') {
    const ReasoningRenderer = components?.ReasoningRenderer ?? DefaultReasoningRenderer;
    return <ReasoningRenderer>{asString(part.text) ?? ''}</ReasoningRenderer>;
  }
  if (type === 'source-url' || type === 'source-document') {
    const SourceRenderer = components?.SourceRenderer ?? DefaultSourceRenderer;
    const source: AIChatSource = {
      id: asString(part.sourceId) ?? asString(part.id) ?? `source-${index}`,
      title: asString(part.title) ?? asString(part.filename),
      url: safeHttpUrl(part.url),
    };
    return (
      <SourceRenderer
        sources={[source]}
        renderSource={(item) => item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.title ?? item.url}
          </a>
        ) : <span>{item.title ?? item.id}</span>}
      />
    );
  }
  if (type.startsWith('data-')) {
    const DataRenderer = components?.DataRenderer ?? DefaultDataRenderer;
    return (
      <DataRenderer
        data={[part]}
        renderDataItem={(item) => (
          <pre className={styles.structuredData}>{JSON.stringify(item.data ?? item, null, 2)}</pre>
        )}
      />
    );
  }
  if (type.startsWith('tool-') || type === 'dynamic-tool') {
    return (
      <details className={styles.toolPart}>
        <summary>{asString(part.toolName) ?? type.replace(/^tool-/, '')}</summary>
        <pre className={styles.structuredData}>
          {JSON.stringify(part.output ?? part.input ?? part, null, 2)}
        </pre>
      </details>
    );
  }
  if (type === 'file' || type === 'image') {
    const url = safeHttpUrl(part.url);
    return url ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {asString(part.filename) ?? 'View attachment'}
      </a>
    ) : <span>Attachment</span>;
  }
  // Preserve unsupported part types as inspectable data instead of silently dropping them.
  return <pre className={styles.structuredData}>{JSON.stringify(part, null, 2)}</pre>;
}

const DEFAULT_MESSAGE_LIMIT = 8;

export function AIChat({
  api,
  scopeLabel,
  messageLimit = DEFAULT_MESSAGE_LIMIT,
  inputPlaceholder = 'Ask a question...',
  inputMaxLength = 2000,
  components,
  onClose,
  className,
  style,
}: AIChatProps) {
  // Remounting the provider creates a fresh AI SDK chat id, not merely an empty transcript.
  const [session, setSession] = useState(0);
  const transport = useMemo(
    () => new AssistantChatTransport({
      api,
      // The transport merges this with the AI SDK messages, id, model context and tools.
      // The endpoint, not the presentation component, must enforce the scope.
      ...(scopeLabel ? { body: { scope: scopeLabel } } : {}),
    }),
    [api, scopeLabel],
  );
  const config = useMemo(
    () => AuiConfig({ threads: AISDKChat({ transport }) }),
    [transport, session],
  );

  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')} style={style}>
      {scopeLabel && (
        <div className={styles.scope}>
          <span className={styles.scopeLabel}>Current scope</span>
          <strong>{scopeLabel}</strong>
          <p className={styles.scopeHelp}>
            Scope is sent with each request and must be enforced by the API.
          </p>
        </div>
      )}
      {onClose && (
        <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close chat">
          &#x2715;
        </button>
      )}
      <AuiProvider key={`${api}: ${scopeLabel ?? ''}:${session}`} config={config}>
        <ThreadPrimitive.Root className={styles.thread}>
          <ChatViewport
            messageLimit={Math.max(1, Math.floor(messageLimit))}
            inputPlaceholder={inputPlaceholder}
            inputMaxLength={inputMaxLength}
            components={components}
            onNewChat={() => setSession((previous) => previous + 1)}
          />
        </ThreadPrimitive.Root>
      </AuiProvider>
    </div>
  );
}

interface ChatViewportProps {
  readonly messageLimit: number;
  readonly inputPlaceholder: string;
  readonly inputMaxLength: number;
  readonly components?: AIChatComponents;
  readonly onNewChat: () => void;
}

function ChatViewport({
  messageLimit,
  inputPlaceholder,
  inputMaxLength,
  components,
  onNewChat,
}: ChatViewportProps) {
  const chat = useAISDKChat();
  const [draft, setDraft] = useState('');
  const messages = chat?.messages ?? [];
  const status = chat?.status ?? 'ready';
  const isBusy = status === 'submitted' || status === 'streaming';
  const historyFull = messages.filter((message) => message.role === 'user').length >= messageLimit;
  const MessageRenderer = components?.MessageRenderer ?? DefaultMessageRenderer;
  const ErrorRenderer = components?.ErrorRenderer ?? DefaultErrorRenderer;

  const handleSubmit = () => {
    const text = draft.trim();
    if (!chat || !text || isBusy || historyFull || chat.error) return;
    setDraft('');
    void chat.sendMessage({ text });
  };

  const handleNewChat = () => {
    void chat?.stop();
    onNewChat();
  };

  const handleRetry = () => {
    if (!chat || isBusy) return;
    chat.clearError();
    void chat.regenerate();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <ThreadPrimitive.Viewport className={styles.viewport}>
      <div className={styles.messageList} role="log" aria-label="Chat history" aria-live="polite">
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <p>Start a conversation</p>
          </div>
        )}
        {messages.filter((message) => message.role === 'user' || message.role === 'assistant').map((message) => (
          <MessageRenderer
            key={message.id}
            message={{
              id: message.id,
              role: message.role as 'user' | 'assistant',
              parts: message.parts,
              ...(isRecord(message.metadata) ? { metadata: message.metadata } : {}),
            }}
            renderMessagePart={(part, index) => renderPart(part, index, components)}
          />
        ))}
        {isBusy && <p className={styles.status} role="status">Thinking...</p>}
      </div>
      <ThreadPrimitive.ViewportFooter className={styles.footer}>
        {!chat && <p className={styles.error} role="alert">Chat runtime is unavailable.</p>}
        {chat?.error && (
          <ErrorRenderer error={chat.error} onRetry={handleRetry} onClear={handleNewChat} />
        )}
        {historyFull && !chat?.error && (
          <div className={styles.historyLimit}>
            <span>This chat has reached its {messageLimit}-question limit.</span>
            <button type="button" onClick={handleNewChat}>Start new chat</button>
          </div>
        )}
        {!historyFull && !chat?.error && (
          <form className={styles.composerForm} onSubmit={handleFormSubmit}>
            <textarea
              className={styles.input}
              aria-label="Message"
              rows={2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              maxLength={inputMaxLength}
              disabled={isBusy || !chat}
            />
            {isBusy ? (
              <button type="button" className={styles.sendButton} onClick={() => void chat?.stop()}>
                Stop
              </button>
            ) : (
              <button type="submit" className={styles.sendButton} disabled={!chat || !draft.trim()}>
                Send
              </button>
            )}
          </form>
        )}
      </ThreadPrimitive.ViewportFooter>
    </ThreadPrimitive.Viewport>
  );
}
