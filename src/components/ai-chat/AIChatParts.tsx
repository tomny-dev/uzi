'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import styles from './ai-chat.module.css';

import type {
  AIChatComponents,
  AIChatDataRendererProps,
  AIChatErrorRendererProps,
  AIChatMessageRendererProps,
  AIChatReasoningRendererProps,
  AIChatSource,
  AIChatSourceRendererProps,
  AIChatToolApprovalHandler,
  AIChatToolRendererProps,
} from './AIChat';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function safeHttpUrl(value: unknown): string | undefined {
  const url = asString(value);
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

/** Allow only inert bitmap image data, never script-capable data or blob links from messages. */
function safeImageUrl(value: unknown): string | undefined {
  const url = asString(value);
  return url && (/^https?:\/\//i.test(url) || /^data:image\/(?:png|jpeg|gif|webp|avif);base64,/i.test(url))
    ? url : undefined;
}

function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Shared attachment surface for built-in Uzi chat and custom SDK runtimes. */
export interface AIChatAttachmentPreviewProps {
  readonly name: string;
  readonly size?: number;
  /** HTTP(S), safe bitmap data URI, or a local object URL when staged. */
  readonly imageUrl?: string;
  /** Optional HTTP(S) link for non-image files. */
  readonly href?: string;
  /** Compact composer chip rather than a history attachment. */
  readonly staged?: boolean;
  readonly onRemove?: () => void;
  /** Pass an SDK-owned remove button here when removal must be done by a primitive. */
  readonly removeControl?: ReactNode;
}

/** The same attachment surface is used for staged files and sent message parts. */
export function AIChatAttachmentPreview({ name, size, imageUrl, href, staged, onRemove, removeControl }: AIChatAttachmentPreviewProps) {
  const safePreviewUrl = imageUrl && (safeImageUrl(imageUrl) || (staged && /^blob:/i.test(imageUrl) ? imageUrl : undefined));
  const safeHref = safeHttpUrl(href);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previewButtonRef = useRef<HTMLButtonElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (previewOpen && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal?.();
  }, [previewOpen]);

  return (
    <div className={[styles.attachmentCard, staged ? styles.stagedAttachment : styles.sentAttachment,
      staged && !safePreviewUrl ? styles.stagedFileAttachment : '',
      safePreviewUrl && !staged ? styles.sentImageAttachment : ''].filter(Boolean).join(' ')}>
      {safePreviewUrl ? (
        <button ref={previewButtonRef} type="button" className={styles.imageAttachmentButton}
          onClick={() => setPreviewOpen(true)} aria-label={`Preview ${name}`} title={`Preview ${name}`}>
          <img className={styles.attachmentThumbnail} src={safePreviewUrl} alt={name} loading="lazy" />
        </button>
      ) : (
        <div className={styles.fileAttachment}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6M8 13h8M8 17h5" />
          </svg>
          <span className={styles.fileAttachmentDetails}>
            {safeHref ? <a href={safeHref} target="_blank" rel="noopener noreferrer" title={name}>{name}</a>
              : <span title={name}>{name}</span>}
            {size !== undefined && <small>{formatAttachmentSize(size)}</small>}
          </span>
        </div>
      )}
      {removeControl && <span className={styles.removeAttachmentSlot}>{removeControl}</span>}
      {!removeControl && onRemove && (
        <button type="button" className={styles.removeAttachment} onClick={onRemove}
          aria-label={`Remove ${name}`} title={`Remove ${name}`}>×</button>
      )}
      {previewOpen && safePreviewUrl && (
        <dialog ref={dialogRef} className={styles.attachmentDialog} aria-label={`Preview ${name}`}
          onClose={() => { setPreviewOpen(false); previewButtonRef.current?.focus(); }}
          onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
          <div className={styles.attachmentDialogHeader}>
            <span title={name}>{name}</span>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close attachment preview">×</button>
          </div>
          <img src={safePreviewUrl} alt={name} />
        </dialog>
      )}
    </div>
  );
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

export function DefaultMessageRenderer({ message, renderMessagePart }: AIChatMessageRendererProps) {
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

export function DefaultErrorRenderer({ error, onRetry, onClear }: AIChatErrorRendererProps) {
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

export function renderPart(
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
    const name = asString(part.filename) ?? asString(part.name) ?? 'Attachment';
    const mediaType = asString(part.mediaType) ?? asString(part.mimeType);
    const isImage = type === 'image' || /^image\/(?:png|jpeg|gif|webp|avif)$/i.test(mediaType ?? '')
      || /\.(?:png|jpe?g|gif|webp|avif)$/i.test(name);
    const imageUrl = isImage ? safeImageUrl(part.url) : undefined;
    return <AIChatAttachmentPreview name={name} imageUrl={imageUrl} href={safeHttpUrl(part.url)}
      size={typeof part.size === 'number' && part.size >= 0 ? part.size : undefined} />;
  }
  // Preserve unsupported part types as inspectable data instead of silently dropping them.
  return <pre className={styles.structuredData}>{JSON.stringify(part, null, 2)}</pre>;
}
