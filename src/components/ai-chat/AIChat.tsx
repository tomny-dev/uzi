'use client';

import { useMemo } from 'react';
import type { CSSProperties, ComponentType } from 'react';

import {
  ThreadPrimitive,
  useThreadViewportAutoScroll,
} from '@assistant-ui/react';
import {
  AISDKChat,
  useAISDKChat,
  AssistantChatTransport,
} from '@assistant-ui/ai-sdk';
import { AuiConfig, AuiProvider } from '@assistant-ui/react';

import styles from './ai-chat.module.css';

export interface AIChatProps {
  readonly api: string;
  readonly scopeLabel?: string;
  readonly messageLimit?: number;
  readonly inputPlaceholder?: string;
  readonly inputMaxLength?: number;
  readonly components?: AIChatComponents;
  readonly onClose?: () => void;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export interface AIChatComponents {
  readonly MessageRenderer?: ComponentType<AIChatMessageRendererProps> | undefined;
  readonly ReasoningRenderer?: ComponentType<AIChatReasoningRendererProps> | undefined;
  readonly SourceRenderer?: ComponentType<AIChatSourceRendererProps> | undefined;
  readonly DataRenderer?: ComponentType<AIChatDataRendererProps> | undefined;
  readonly ErrorRenderer?: ComponentType<AIChatErrorRendererProps> | undefined;
}

export interface AIChatMessageRendererProps {
  readonly message: {
    readonly id: string;
    readonly role: 'user' | 'assistant';
    readonly parts: readonly unknown[];
    readonly metadata?: Record<string, unknown>;
  };
  readonly renderMessagePart: (
    part: Record<string, unknown>,
    index: number,
  ) => JSX.Element | null;
}

export interface AIChatReasoningRendererProps {
  readonly children: string;
  readonly title?: string;
}

export interface AIChatSourceRendererProps {
  readonly sources: readonly { readonly id: string }[];
  readonly renderSource: (source: { readonly id: string }, index: number) => JSX.Element | null;
}

export interface AIChatDataRendererProps {
  readonly data: readonly Record<string, unknown>[];
  readonly renderDataItem: (item: Record<string, unknown>, index: number) => JSX.Element | null;
}

export interface AIChatErrorRendererProps {
  readonly error: Error;
  readonly onRetry: () => void;
  readonly onClear: () => void;
}

function DefaultMessageRenderer({ message, renderMessagePart }: AIChatMessageRendererProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    const text = extractTextFromParts(message.parts);
    return <p className={styles.userMessage}>{text}</p>;
  }

  return (
    <div className={styles.assistantMessage}>
      {message.parts.map((part, index) => (
        <div key={(part as { id?: string }).id ?? index}>
          {renderMessagePart(part as Record<string, unknown>, index)}
        </div>
      ))}
    </div>
  );
}

function DefaultReasoningRenderer({ children }: AIChatReasoningRendererProps) {
  return (
    <details className={styles.reasoning}>
      <summary className={styles.reasoningSummary}>Reasoning</summary>
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
        <button type="button" onClick={onRetry}>
          Retry
        </button>
        <button type="button" onClick={onClear}>
          Start new chat
        </button>
      </div>
    </div>
  );
}

function extractTextFromParts(parts: readonly unknown[]): string {
  return (parts as { type?: string; text?: string }[])
    .filter((p) => typeof p === 'object' && p !== null && 'type' in p && p.type === 'text')
    .map((p) => (p as { text?: string }).text ?? '')
    .join('')
    .trim();
}

const CHAT_MESSAGE_LIMIT_DEFAULT = 8;

export function AIChat({
  api,
  scopeLabel,
  messageLimit = CHAT_MESSAGE_LIMIT_DEFAULT,
  inputPlaceholder = 'Ask a question...',
  inputMaxLength = 2000,
  components,
  onClose,
  className,
  style,
}: AIChatProps) {
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api,
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages },
        }),
      }),
    [api],
  );

  const thread = useMemo(
    () =>
      AuiConfig({
        threads: AISDKChat({ transport }),
      }),
    [transport],
  );

  return (
    <div
      className={[styles.container, className].filter(Boolean).join(' ')}
      style={style}
    >
      {scopeLabel && (
        <div className={styles.scope}>
          <span className={styles.scopeLabel}>Current scope</span>
          <strong>{scopeLabel}</strong>
          <p className={styles.scopeHelp}>
            Answers are scoped to this context. Chat history stays in this browser tab and is not
            persisted.
          </p>
        </div>
      )}

      {onClose && (
        <button
          className={styles.closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          &#x2715;
        </button>
      )}

      <AuiProvider config={thread}>
        <ThreadPrimitive.Root className={styles.thread}>
          <ChatViewport
            messageLimit={messageLimit}
            inputPlaceholder={inputPlaceholder}
            inputMaxLength={inputMaxLength}
            components={components}
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
}

function ChatViewport({ messageLimit, inputPlaceholder, inputMaxLength, components }: ChatViewportProps) {
  const chat = useAISDKChat();
  const messages = chat?.messages ?? [];
  const status = chat?.status ?? 'idle';
  const error = chat?.error;

  useThreadViewportAutoScroll({});

  const isBusy = status === 'submitted' || status === 'streaming';
  const historyFull = messages.length >= messageLimit;

  const sendMessage = chat?.sendMessage ?? (() => {});
  const clearError = chat?.clearError ?? (() => {});

  const handleSubmit = () => {
    const inputEl = document.querySelector<HTMLTextAreaElement>(
      `[class*="${styles.input}"]`,
    );
    const value = inputEl?.value?.trim();
    if (!value) return;
    clearError();
    sendMessage({ text: value });
  };

  const handleNewChat = () => {
    clearError();
  };

  const handleRetry = () => {
    clearError();
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      sendMessage({
        text: extractTextFromParts(lastUser.parts),
      });
    }
  };

  const MessageRenderer = components?.MessageRenderer ?? DefaultMessageRenderer;
  const ReasoningRenderer = components?.ReasoningRenderer ?? DefaultReasoningRenderer;
  const SourceRenderer = components?.SourceRenderer ?? DefaultSourceRenderer;
  const DataRenderer = components?.DataRenderer ?? DefaultDataRenderer;
  const ErrorRenderer = components?.ErrorRenderer ?? DefaultErrorRenderer;

  return (
    <ThreadPrimitive.Viewport className={styles.viewport}>
      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{inputPlaceholder.replace('Ask a question', 'Start a conversation')}</p>
        </div>
      ) : (
        <ThreadPrimitive.Messages
          components={{
            Message: MessageRenderer as ComponentType,
          }}
        />
      )}

      {isBusy && <p className={styles.status}>Thinking...</p>}

      {error ? (
        <ErrorRenderer error={error} onRetry={handleRetry} onClear={handleNewChat} />
      ) : historyFull ? (
        <div className={styles.historyLimit}>
          <span>This chat has reached its {messageLimit}-message limit.</span>
          <button type="button" onClick={handleNewChat}>
            Start new chat
          </button>
        </div>
      ) : (
        <form
          className={styles.composerForm}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <textarea
            className={styles.input}
            rows={1}
            placeholder={inputPlaceholder}
            maxLength={inputMaxLength}
            disabled={isBusy}
            style={{ resize: 'none' }}
          />
        </form>
      )}
    </ThreadPrimitive.Viewport>
  );
}
