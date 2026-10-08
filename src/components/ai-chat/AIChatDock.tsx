'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import styles from './ai-chat-dock.module.css';

export interface AIChatDockProps {
  /** Visible assistant name, e.g. "Betty" or "Ask Tultr". */
  readonly title: string;
  readonly description?: string;
  /** Accessible name for the floating action button. Defaults to "Open {title}". */
  readonly launcherLabel?: string;
  /** Turn off the built-in FAB when a parent FloatingActionStack owns the launcher. */
  readonly showLauncher?: boolean;
  /** Optional stable panel ID for an external button's aria-controls. */
  readonly panelId?: string;
  /** ID of the external launch button to restore keyboard focus after close. */
  readonly externalLauncherId?: string;
  readonly children: ReactNode;
  /** Controlled visibility; when omitted, the dock manages its own state. */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Controlled expansion; apps may synchronize this with a dedicated route. */
  readonly expanded?: boolean;
  readonly defaultExpanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly className?: string;
}

/**
 * Shared chat navigation chrome. Children remain mounted while closed to retain
 * the consumer's active AI SDK conversation, pending approvals and attachments.
 * The dock never creates a second chat runtime or reads application messages.
 * Desktop is deliberately non-modal: Tab can move back into the page.
 * On mobile the full-screen modal sheet traps sequential keyboard focus.
 */
export function AIChatDock({
  title,
  description,
  launcherLabel,
  showLauncher = true,
  panelId: controlledPanelId,
  externalLauncherId,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
}: AIChatDockProps) {
  const autoId = useId();
  const panelId = controlledPanelId ?? `uzi-ai-dock-${autoId}`;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isOpen = open ?? internalOpen;
  const isExpanded = expanded ?? internalExpanded;
  const [mobile, setMobile] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  const changeOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const changeExpanded = (next: boolean) => {
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
    if (next && !isOpen) changeOpen(true);
  };

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      panelRef.current?.focus();
    } else if (!isOpen && wasOpen.current) {
      const previous = openerRef.current;
      if (previous?.isConnected && previous !== panelRef.current) previous.focus();
      else if (externalLauncherId) document.getElementById(externalLauncherId)?.focus();
      else launcherRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen, externalLauncherId]);

  useEffect(() => {
    if (!isOpen || !mobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen, mobile]);

  useEffect(() => {
    if (!isOpen) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        changeOpen(false);
        return;
      }
      // On desktop the panel is non-modal; only the mobile sheet traps focus.
      if (event.key !== 'Tab' || !mobile) return;
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []).filter((item) => item.tabIndex >= 0 && item.getClientRects().length > 0);
      if (!focusable.length) { event.preventDefault(); panelRef.current?.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panelRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panelRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [isOpen, mobile, onOpenChange, open]);

  return (
    <div className={[styles.dock, className].filter(Boolean).join(' ')}>
      {showLauncher && !isOpen && (
        <button
          ref={launcherRef}
          type="button"
          className={styles.launcher}
          aria-controls={panelId}
          aria-expanded={false}
          aria-label={launcherLabel ?? `Open ${title}`}
          onClick={() => changeOpen(true)}
        >
          <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9.1 9.1 0 0 1-4-.9L3 21l1.9-5.5a9.1 9.1 0 0 1-.9-4 8.5 8.5 0 0 1 8.5-8.5h.5A8.5 8.5 0 0 1 21 11.5Z" />
          </svg>
          <span className={styles.launcherText}>{title}</span>
        </button>
      )}
      {isOpen && mobile && <div className={styles.backdrop} aria-hidden="true" onClick={() => changeOpen(false)} />}
      <section
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal={mobile && isOpen}
        aria-label={title}
        tabIndex={-1}
        className={styles.panel}
        data-expanded={isExpanded}
        hidden={!isOpen}
      >
        <header className={styles.header}>
          <div className={styles.identity}>
            <div className={styles.avatar} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="6" width="16" height="14" rx="4" />
                <path d="M12 3v3M9 13h.01M15 13h.01M9 17h6" />
              </svg>
            </div>
            <div className={styles.titles}>
              <strong className={styles.title}>{title}</strong>
              {description && <span className={styles.description}>{description}</span>}
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.iconButton}
              aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
              title={isExpanded ? 'Collapse' : 'Expand'}
              onClick={() => changeExpanded(!isExpanded)}>
              {isExpanded ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3v6H3M15 21v-6h6M3 9l6-6M21 15l-6 6" /></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 21h5v-5M3 3l7 7M21 21l-7-7" /></svg>
              )}
            </button>
            <button type="button" className={styles.iconButton}
              aria-label={`Close ${title}`} title="Close"
              onClick={() => changeOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </section>
    </div>
  );
}
