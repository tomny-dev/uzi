"use client";

import { useRef, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./modal.module.css";

export type ModalSize = "sm" | "md" | "lg";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  /** Content between the header and footer */
  children: ReactNode;
  /** Rendered inside the footer row — typically action buttons */
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, subtitle, size = "md", children, footer }: ModalProps) {
  const mouseDownOnBackdrop = useRef(false);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(e) => { mouseDownOnBackdrop.current = e.target === e.currentTarget; }}
      onMouseUp={(e) => {
        if (mouseDownOnBackdrop.current && e.target === e.currentTarget) onClose();
        mouseDownOnBackdrop.current = false;
      }}
    >
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
    </div>
  );
}
