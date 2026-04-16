"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./modal.module.css";

// ── ModalOverlay ─────────────────────────────────────────────────────────────
// Bare backdrop + container. No opinions on layout inside.
// Use this when you need a full-custom layout (e.g. wide media modals).

export type ModalOverlayProps = {
  open: boolean;
  onClose: () => void;
  /** Extra class applied to the backdrop */
  className?: string;
  children: ReactNode;
};

export function ModalOverlay({ open, onClose, className, children }: ModalOverlayProps) {
  const mouseDownOnBackdrop = useRef(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    // Capture phase so the innermost modal handles Escape first
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cx(styles.backdrop, className)}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => { mouseDownOnBackdrop.current = e.target === e.currentTarget; }}
      onMouseUp={(e) => {
        if (mouseDownOnBackdrop.current && e.target === e.currentTarget) onClose();
        mouseDownOnBackdrop.current = false;
      }}
    >
      {children}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
// Opinionated dialog: header (title + close button), scrollable body, footer.

export type ModalSize = "sm" | "md" | "lg" | "xl";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, subtitle, size = "md", children, footer }: ModalProps) {
  return (
    <ModalOverlay open={open} onClose={onClose}>
      <div className={cx(styles.modal, styles[`size-${size}`])}>
        <div className={styles.header}>
          <div className={styles.titles}>
            <div className={styles.title}>{title}</div>
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </ModalOverlay>
  );
}
