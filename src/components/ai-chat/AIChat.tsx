'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ComponentType, FormEvent, KeyboardEvent, ReactNode } from 'react';

import { AuiConfig, AuiProvider, ThreadPrimitive } from '@assistant-ui/react';
import { AISDKChat, AssistantChatTransport, useAISDKChat } from '@assistant-ui/ai-sdk';

import styles from './ai-chat.module.css';

type AIChatTransportOptions = NonNullable<ConstructorParameters<typeof AssistantChatTransport>[0]>;

export interface AIChatProps {
  /** AI SDK UI-message stream endpoint. */
  readonly api: string;
  /** Opaque scope identifier sent to the API. Server must authorize it. */
  readonly scope?: string;
  /** Human-readable display text; never used as an access-control identifier. */
  readonly scopeLabel?: string;
  /** Fetch adapter for authentication, request instrumentation and local demos. */
  readonly fetch?: typeof globalThis.fetch;
  readonly headers?: Record<string, string>;
  readonly credentials?: RequestCredentials;
  /** Customize serialized requests for APIs with a strict request schema. */
  readonly prepareSendMessagesRequest?: AIChatTransportOptions['prepareSendMessagesRequest'];
  /** Change this when the authenticated identity changes to reset the transcript. */
  readonly sessionKey?: string | number;
  /** Maximum number of user turns (default: 8). */
  readonly messageLimit?: number;
  readonly inputPlaceholder?: string;
  /** Accessible name for the message textarea. */
  readonly inputAriaLabel?: string;
  readonly inputMaxLength?: number;
  readonly components?: AIChatComponents;
  /** Opt-in files, restricted to images/text accepted by the application API. */
  readonly attachments?: AIChatAttachmentOptions;
  /** Optional persistence; implementations must scope storage by user AND resource. */
  readonly history?: AIChatHistoryAdapter;
  /** Native SDK continuation predicate for tool approvals. */
  readonly sendAutomaticallyWhen?: NonNullable<Parameters<typeof AISDKChat>[0]>['sendAutomaticallyWhen'];
  readonly onClose?: () => void;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * Framework-independent presentation contract. The parent owns the runtime,
 * message identities, approvals, uploads, history and security boundaries.
 * Uzi does not serialize, persist or reinterpret any messages supplied here.
 */
export type AIChatMessage = AIChatMessageRendererProps['message'];

export interface AIChatAttachmentOptions {
  readonly accept: string;
  readonly maxFiles?: number;
  readonly maxBytesPerFile?: number;
}

export interface AIChatSelectedAttachment {
  readonly name: string;
  readonly size: number;
}

export interface AIChatHistoryAdapter {
  /** Load only validated UI messages from the authenticated principal's own storage. */
  readonly load: () => Promise<readonly AIChatMessage[]> | readonly AIChatMessage[];
  /** Save after complete turns; the consumer decides what metadata is safe. */
  readonly save: (messages: readonly AIChatMessage[]) => Promise<void> | void;
  readonly clear: () => Promise<void> | void;
  /** Observability for failed history operations; never include message payloads in logs. */
  readonly onError?: (operation: 'load' | 'save' | 'clear', error: unknown) => void;
}

export type AIChatToolApprovalHandler = (id: string, approved: boolean) => Promise<void> | void;

export interface AIChatViewProps {
  readonly messages: readonly AIChatMessage[];
  readonly status?: string;
  readonly error?: Error | null;
  readonly draft?: string;
  readonly onDraftChange?: (draft: string) => void;
  readonly onSend?: () => void;
  readonly onStop?: () => void;
  readonly onRetry?: () => void;
  readonly onNewChat?: () => void;
  /** No limit by default: specialized apps decide their own session policy. */
  readonly messageLimit?: number;
  readonly inputPlaceholder?: string;
  readonly inputAriaLabel?: string;
  readonly inputMaxLength?: number;
  readonly components?: AIChatComponents;
  readonly attachments?: readonly AIChatSelectedAttachment[];
  readonly onSelectAttachments?: (files: FileList) => void;
  readonly onRemoveAttachment?: (index: number) => void;
  readonly attachmentAccept?: string;
  readonly attachmentError?: string | null;
  /** Only invoked from explicit user action on an approval-requested tool part. */
  readonly onToolApproval?: AIChatToolApprovalHandler;
  /** Custom message toolbar controls, e.g. a conversation selector. */
  readonly toolbarActions?: ReactNode;
  /** Context labels or other app-owned notices above the transcript. */
  readonly header?: ReactNode;
  /** Upload actions, attachment previews or context chips before the input. */
  readonly composerLeading?: ReactNode;
  /** Additional buttons beside the Send/Stop control. */
  readonly composerTrailing?: ReactNode;
  /** Completely replace the composer while retaining shared transcript chrome. */
  readonly composer?: ReactNode;
  readonly emptyState?: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export interface AIChatComponents {
  readonly MessageRenderer?: ComponentType<AIChatMessageRendererProps>;
  readonly ReasoningRenderer?: ComponentType<AIChatReasoningRendererProps>;
  readonly SourceRenderer?: ComponentType<AIChatSourceRendererProps>;
  readonly DataRenderer?: ComponentType<AIChatDataRendererProps>;
  readonly ToolRenderer?: ComponentType<AIChatToolRendererProps>;
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
  readonly onToolApproval?: AIChatToolApprovalHandler;
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

export interface AIChatToolRendererProps {
  readonly part: Record<string, unknown>;
  readonly name: string;
  readonly approvalId?: string;
  readonly onApprove?: () => void;
  readonly onDeny?: () => void;
  readonly approvalPending: boolean;
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

/** Reusable role-aware message surface for domain renderers. */
export interface AIChatMessageBubbleProps {
  readonly role: 'user' | 'assistant';
  readonly label?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function AIChatMessageBubble({ role, label, children, className }: AIChatMessageBubbleProps) {
  return (
    <div className={[styles.messageBubble, role === 'user' ? styles.userMessage : styles.assistantMessage, className]
      .filter(Boolean).join(' ')} data-role={role}>
      {label && <span className={styles.messageLabel}>{label}</span>}
      {children}
    </div>
  );
}

function DefaultMessageRenderer({ message, renderMessagePart }: AIChatMessageRendererProps) {
  return (
    <AIChatMessageBubble role={message.role}>
      {message.parts.map((part, index) => (
        <div key={isRecord(part) && typeof part.id === 'string' ? part.id : index}>
          {isRecord(part) ? renderMessagePart(part, index) : null}
        </div>
      ))}
    </AIChatMessageBubble>
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
  onToolApproval?: AIChatToolApprovalHandler,
  pendingApprovalId?: string | null,
): ReactNode {
  const type = asString(part.type) ?? '';
  if (type === 'step-start') return null;
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
    const name = asString(part.toolName) ?? type.replace(/^tool-/, '');
    const approval = isRecord(part.approval) ? asString(part.approval.id) : undefined;
    const approvalId = part.state === 'approval-requested' ? approval : undefined;
    const controlsDisabled = pendingApprovalId !== null && pendingApprovalId !== undefined;
    const ToolRenderer = components?.ToolRenderer;
    const props: AIChatToolRendererProps = {
      part, name, approvalId,
      approvalPending: controlsDisabled,
      ...(approvalId && onToolApproval ? {
        onApprove: () => { if (!controlsDisabled) void onToolApproval(approvalId, true); },
        onDeny: () => { if (!controlsDisabled) void onToolApproval(approvalId, false); },
      } : {}),
    };
    if (ToolRenderer) return <ToolRenderer {...props} />;
    return (
      <div className={styles.toolPart}>
        <details>
          <summary>{name}</summary>
          <pre className={styles.structuredData}>
            {JSON.stringify(part.output ?? part.input ?? part, null, 2)}
          </pre>
        </details>
        {approvalId && (
          <div className={styles.approvalActions} aria-label={`Approval required for ${name}`}>
            {props.onApprove && props.onDeny ? (
              <>
                <button type="button" disabled={controlsDisabled} onClick={props.onApprove}>Approve</button>
                <button type="button" disabled={controlsDisabled} onClick={props.onDeny}>Deny</button>
              </>
            ) : <span>Approval required in application</span>}
          </div>
        )}
      </div>
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
  scope,
  scopeLabel,
  fetch: requestFetch,
  headers,
  credentials,
  prepareSendMessagesRequest,
  sessionKey,
  messageLimit = DEFAULT_MESSAGE_LIMIT,
  inputPlaceholder = 'Ask a question...',
  inputAriaLabel = 'Message',
  inputMaxLength = 2000,
  components,
  attachments,
  history,
  sendAutomaticallyWhen,
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
      ...(scope ? { body: { scope } } : {}),
      ...(requestFetch ? { fetch: requestFetch } : {}),
      ...(headers ? { headers } : {}),
      ...(credentials ? { credentials } : {}),
      ...(prepareSendMessagesRequest ? { prepareSendMessagesRequest } : {}),
    }),
    [api, scope, requestFetch, headers, credentials, prepareSendMessagesRequest],
  );
  const config = useMemo(
    () => AuiConfig({ threads: AISDKChat({ transport, ...(sendAutomaticallyWhen ? { sendAutomaticallyWhen } : {}) }) }),
    [transport, session, sendAutomaticallyWhen],
  );

  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')} style={style}>
      {scopeLabel && (
        <div className={styles.scope}>
          <span className={styles.scopeLabel}>Current scope</span>
          <strong>{scopeLabel}</strong>
        </div>
      )}
      {onClose && (
        <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close chat">
          &#x2715;
        </button>
      )}
      <AuiProvider key={JSON.stringify([api, scope, sessionKey, session])} config={config}>
        <ThreadPrimitive.Root className={styles.thread}>
          <ChatViewport
            messageLimit={Number.isFinite(messageLimit) ? Math.max(1, Math.floor(messageLimit)) : DEFAULT_MESSAGE_LIMIT}
            inputPlaceholder={inputPlaceholder}
            inputAriaLabel={inputAriaLabel}
            inputMaxLength={inputMaxLength}
            components={components}
            attachmentOptions={attachments}
            history={history}
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
  readonly inputAriaLabel: string;
  readonly inputMaxLength: number;
  readonly components?: AIChatComponents;
  readonly attachmentOptions?: AIChatAttachmentOptions;
  readonly history?: AIChatHistoryAdapter;
  readonly onNewChat: () => void;
}

function ChatViewport({
  messageLimit,
  inputPlaceholder,
  inputAriaLabel,
  inputMaxLength,
  components,
  attachmentOptions,
  history,
  onNewChat,
}: ChatViewportProps) {
  const chat = useAISDKChat();
  const [draft, setDraft] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!history);
  const expectedRestoredId = useRef<string | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const [approvalBusy, setApprovalBusy] = useState(false);
  const messages = chat?.messages ?? [];
  const status = chat?.status ?? 'ready';
  const isBusy = status === 'submitted' || status === 'streaming';
  const historyFull = messages.filter((message) => message.role === 'user').length >= messageLimit;
  const reportHistoryError = (operation: 'load' | 'save' | 'clear', error: unknown) => {
    if (history?.onError) history.onError(operation, error);
    else console.warn(`[Uzi AIChat] History ${operation} failed`);
  };
  // Persist only complete turns. Do not save an empty runtime over stored history
  // during hydration or while a response is still streaming.
  useEffect(() => {
    if (!history) return;
    let active = true;
    void Promise.resolve().then(() => history.load()).then((restored) => {
      if (!active) return;
      if (Array.isArray(restored)) {
        const valid = restored.filter((message) =>
          typeof message?.id === 'string' &&
          (message.role === 'user' || message.role === 'assistant') &&
          Array.isArray(message.parts));
        expectedRestoredId.current = valid.length ? valid[0].id : null;
        if (valid.length) chat?.setMessages(valid as Parameters<NonNullable<typeof chat>['setMessages']>[0]);
      }
      setHydrated(true);
    }).catch((error: unknown) => {
      if (active) {
        reportHistoryError('load', error);
        setHydrated(true);
      }
    });
    return () => { active = false; };
  }, [chat?.setMessages, history]);

  useEffect(() => {
    if (!history || !hydrated || isBusy) return;
    const snapshot = messages.filter((message) => message.role === 'user' || message.role === 'assistant').map((message) => ({
      id: message.id, role: message.role as 'user' | 'assistant', parts: message.parts,
      ...(isRecord(message.metadata) ? { metadata: message.metadata } : {}),
    }));
    // Guard against the transient empty SDK state between history.load and
    // setMessages propagation; otherwise an old transcript could be erased.
    if (expectedRestoredId.current) {
      if (!snapshot.some((message) => message.id === expectedRestoredId.current)) return;
      expectedRestoredId.current = null;
    }
    // Serialize writes. New Chat waits for in-flight writes before clearing.
    saveQueue.current = saveQueue.current.then(
      () => history.save(snapshot),
      () => history.save(snapshot),
    ).then(
      () => {},
      (error: unknown) => { reportHistoryError('save', error); },
    );
  }, [history, hydrated, isBusy, messages]);

  const handleSelectedFiles = (files: FileList) => {
    if (!attachmentOptions) return;
    const selected = Array.from(files);
    if (selected.length + selectedFiles.length > (attachmentOptions.maxFiles ?? 3)) {
      setAttachmentError('Too many attachments.');
      return;
    }
    if (selected.some((file) => file.size > (attachmentOptions.maxBytesPerFile ?? 5 * 1024 * 1024))) {
      setAttachmentError('An attachment exceeds the size limit.');
      return;
    }
    const allowedTypes = attachmentOptions.accept.split(',').map((item) => item.trim());
    if (selected.some((file) => !allowedTypes.some((allow) => (
      allow === file.type || (allow.endsWith('/*') && file.type.startsWith(allow.slice(0, -1)))
    )))) {
      setAttachmentError('Unsupported attachment type.');
      return;
    }
    setAttachmentError(null);
    setSelectedFiles((existing) => [...existing, ...selected]);
  };

  const handleSubmit = () => {
    const text = draft.trim();
    if (!chat || (!text && selectedFiles.length === 0) || isBusy || historyFull || chat.error || !hydrated || approvalBusy) return;
    const files = selectedFiles.length ? new DataTransfer() : null;
    selectedFiles.forEach((file) => files?.items.add(file));
    // AI SDK serializes FileList to FileUIParts and sends them through the
    // app-owned transport. The server MUST validate types and sizes again.
    // Clear the composer promptly; restore the draft and files if submission
    // fails, so users do not lose attachments or typed content.
    const previousDraft = draft;
    const previousFiles = selectedFiles;
    setDraft('');
    setSelectedFiles([]);
    setAttachmentError(null);
    void Promise.resolve(chat.sendMessage({ text, ...(files ? { files: files.files } : {}) }))
      .catch(() => {
        setDraft((current) => current || previousDraft);
        setSelectedFiles((current) => current.length ? current : previousFiles);
      });
  };

  const handleNewChat = () => {
    void (async () => {
      await chat?.stop();
      if (history) {
        try {
          await saveQueue.current;
          await history.clear();
        } catch (error) {
          reportHistoryError('clear', error);
          return;
        }
      }
      onNewChat();
    })();
  };

  const handleRetry = () => {
    if (!chat || isBusy) return;
    chat.clearError();
    void chat.regenerate();
  };

  return (
    <AIChatView
      messages={messages.filter((message) => message.role === 'user' || message.role === 'assistant').map((message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant',
        parts: message.parts,
        ...(isRecord(message.metadata) ? { metadata: message.metadata } : {}),
      }))}
      status={status}
      error={chat?.error}
      draft={draft}
      onDraftChange={setDraft}
      onSend={handleSubmit}
      onStop={() => { void chat?.stop(); }}
      onRetry={handleRetry}
      onNewChat={handleNewChat}
      messageLimit={messageLimit}
      attachments={selectedFiles.map((file) => ({ name: file.name, size: file.size }))}
      onSelectAttachments={attachmentOptions ? handleSelectedFiles : undefined}
      onRemoveAttachment={attachmentOptions ? (index) => setSelectedFiles((files) => files.filter((_, i) => i !== index)) : undefined}
      attachmentAccept={attachmentOptions?.accept}
      attachmentError={attachmentError}
      onToolApproval={chat ? async (id, approved) => {
        if (approvalBusy) return;
        setApprovalBusy(true);
        try { await chat.addToolApprovalResponse({ id, approved, ...(!approved ? { reason: 'User denied approval' } : {}) }); }
        finally { setApprovalBusy(false); }
      } : undefined}
      inputPlaceholder={inputPlaceholder}
      inputAriaLabel={inputAriaLabel}
      inputMaxLength={inputMaxLength}
      components={components}
    />
  );
}

/**
 * Controlled chat presentation for apps with their own AI SDK/assistant-ui
 * runtime. It does not create providers, transports or chat state. Callbacks
 * are the only way messages/actions leave the view.
 */
export function AIChatView({
  messages,
  status = 'ready',
  error,
  draft = '',
  onDraftChange,
  onSend,
  onStop,
  onRetry,
  onNewChat,
  messageLimit,
  inputPlaceholder = 'Ask a question...',
  inputAriaLabel = 'Message',
  inputMaxLength = 2000,
  components,
  attachments,
  onSelectAttachments,
  onRemoveAttachment,
  attachmentAccept,
  attachmentError,
  onToolApproval,
  toolbarActions,
  header,
  composerLeading,
  composerTrailing,
  composer,
  emptyState,
  className,
  style,
}: AIChatViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pinnedToBottom = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const approvalRef = useRef<string | null>(null);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const respondToApproval: AIChatToolApprovalHandler = async (id, approved) => {
    if (!onToolApproval || approvalRef.current) return;
    approvalRef.current = id;
    setPendingApprovalId(id);
    setApprovalError(null);
    try { await onToolApproval(id, approved); }
    catch { setApprovalError('Could not submit approval. Please try again.'); }
    finally { approvalRef.current = null; setPendingApprovalId(null); }
  };
  const isBusy = status === 'submitted' || status === 'streaming';
  const limit = messageLimit != null && Number.isFinite(messageLimit)
    ? Math.max(1, Math.floor(messageLimit)) : null;
  const historyFull = limit !== null && messages.filter((message) => message.role === 'user').length >= limit;
  const MessageRenderer = components?.MessageRenderer ?? DefaultMessageRenderer;
  const ErrorRenderer = components?.ErrorRenderer ?? DefaultErrorRenderer;

  // Follow streaming text only if the user is already near the bottom.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport && pinnedToBottom.current) viewport.scrollTop = viewport.scrollHeight;
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (!isBusy && !historyFull && !error && (draft.trim() || (attachments?.length ?? 0) > 0)) onSend?.();
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isBusy && !historyFull && !error && (draft.trim() || (attachments?.length ?? 0) > 0)) onSend?.();
  };

  return (
    <div className={[styles.thread, className].filter(Boolean).join(' ')} style={style}>
      {header}
      <div
        ref={viewportRef}
        className={styles.viewport}
        onScroll={(event) => {
          const viewport = event.currentTarget;
          pinnedToBottom.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 80;
        }}
      >
        {(messages.length > 0 || toolbarActions) && (onNewChat || toolbarActions) && (
          <div className={styles.chatToolbar}>
            {toolbarActions}
            {onNewChat && messages.length > 0 && (
              <button type="button" onClick={onNewChat}>New chat</button>
            )}
          </div>
        )}
        <div className={styles.messageList} role="log" aria-label="Chat history" aria-live="polite">
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              {emptyState ?? <p>Start a conversation</p>}
            </div>
          )}
          {messages.map((message) => (
            <MessageRenderer
              key={message.id}
              message={message}
              renderMessagePart={(part, index) => renderPart(part, index, components, onToolApproval ? respondToApproval : undefined, pendingApprovalId)}
              onToolApproval={onToolApproval ? respondToApproval : undefined}
            />
          ))}
          {isBusy && <p className={styles.status}>Thinking...</p>}
        </div>
      </div>
      <div className={styles.footer}>
        {approvalError && <p role="alert" className={styles.attachmentError}>{approvalError}</p>}
        {attachmentError && <p role="alert" className={styles.attachmentError}>{attachmentError}</p>}
        {error && (
          onRetry && onNewChat ? (
            <ErrorRenderer error={error} onRetry={onRetry} onClear={onNewChat} />
          ) : (
            <div className={styles.error} role="alert">
              <p>{error.message}</p>
              {(onRetry || onNewChat) && (
                <div className={styles.errorActions}>
                  {onRetry && <button type="button" onClick={onRetry}>Retry response</button>}
                  {onNewChat && <button type="button" onClick={onNewChat}>Start new chat</button>}
                </div>
              )}
            </div>
          )
        )}
        {historyFull && !error && !isBusy && onNewChat && (
          <div className={styles.historyLimit}>
            <span>This chat has reached its {limit}-question limit.</span>
            <button type="button" onClick={onNewChat}>Start new chat</button>
          </div>
        )}
        {(!historyFull || isBusy) && !error && (
          composer !== undefined ? composer : (
            <form className={styles.composerForm} onSubmit={handleFormSubmit}>
              {composerLeading && <div className={styles.composerExtras}>{composerLeading}</div>}
              {onSelectAttachments && (
                <div className={styles.composerExtras}>
                  <input
                    ref={fileInputRef}
                    className={styles.visuallyHidden}
                    type="file"
                    aria-label="Add attachments"
                    accept={attachmentAccept}
                    multiple
                    disabled={isBusy}
                    onChange={(event) => {
                      if (event.target.files) onSelectAttachments(event.target.files);
                      event.target.value = '';
                    }}
                  />
                  {attachments && attachments.length > 0 && (
                    <ul className={styles.attachmentList}>
                      {attachments.map((attachment, index) => (
                        <li key={index}>
                          <span>{attachment.name}</span>
                          {onRemoveAttachment && (
                            <button type="button" onClick={() => onRemoveAttachment(index)}
                              aria-label={`Remove ${attachment.name}`}>Remove</button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className={styles.composerSurface}>
                <div className={styles.composerRow}>
                  {onSelectAttachments && (
                    <button type="button" className={styles.composerIconButton}
                      aria-label="Add attachments" title="Add attachments"
                      disabled={isBusy} onClick={() => fileInputRef.current?.click()}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m21 11-8.5 8.5a6 6 0 0 1-8.5-8.5l9-9a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8l8.5-8.5" />
                      </svg>
                    </button>
                  )}
                  <textarea
                    className={styles.input}
                    aria-label={inputAriaLabel}
                    rows={1}
                    value={draft}
                    onChange={(event) => onDraftChange?.(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={inputPlaceholder}
                    maxLength={inputMaxLength}
                    disabled={isBusy || !onSend || !onDraftChange}
                    readOnly={!onDraftChange}
                  />
                  <div className={styles.composerActions}>
                    {composerTrailing}
                    {isBusy ? (
                      onStop && <button type="button" className={styles.composerIconButton} onClick={onStop}
                        aria-label="Stop response" title="Stop response">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
                      </button>
                    ) : (
                      <button type="submit" className={styles.sendButton} aria-label="Send message"
                        title="Send message" disabled={!onSend || (!draft.trim() && !attachments?.length)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-7 7 7-7 7 7" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}
