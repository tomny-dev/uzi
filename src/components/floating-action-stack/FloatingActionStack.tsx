'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './floating-action-stack.module.css';

/** A single screen-edge action rail shared by unrelated application features. */
export interface FloatingActionStackProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly label?: string;
}

export function FloatingActionStack({ children, className, label = 'Quick actions' }: FloatingActionStackProps) {
  return (
    <nav
      aria-label={label}
      className={[styles.stack, className].filter(Boolean).join(' ')}
    >
      {children}
    </nav>
  );
}

export interface FloatingActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Stable accessible name, including when the mobile label is hidden. */
  readonly label: string;
  readonly icon: ReactNode;
  readonly children?: ReactNode;
  /** Use secondary styling for contextual actions above the primary launcher. */
  readonly variant?: 'primary' | 'secondary';
}

/** A directly accessible action, not a speed-dial menu or nested overlay. */
export function FloatingActionButton({
  label,
  icon,
  children,
  variant = 'primary',
  className,
  ...buttonProps
}: FloatingActionButtonProps) {
  return (
    <button
      {...buttonProps}
      type="button"
      aria-label={label}
      className={[styles.action, variant === 'secondary' ? styles.secondary : styles.primary, className]
        .filter(Boolean).join(' ')}
    >
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <span className={styles.label}>{children ?? label}</span>
    </button>
  );
}
