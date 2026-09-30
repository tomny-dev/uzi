"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./conversation.module.css";

export type ConversationRole = "assistant" | "user" | "system";

export interface ConversationProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Conversation({ children, className, ...props }: ConversationProps) {
  return <div className={cx(styles.root, className)} {...props}>{children}</div>;
}

export function ConversationHeader({ children, className, ...props }: ConversationProps) {
  return <header className={cx(styles.header, className)} {...props}>{children}</header>;
}

export function ConversationMessages({ children, className, ...props }: ConversationProps) {
  return <div className={cx(styles.messages, className)} {...props}>{children}</div>;
}

export interface ConversationMessageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  role: ConversationRole;
  label?: ReactNode;
}

export function ConversationMessage({ children, role, label, className, ...props }: ConversationMessageProps) {
  return (
    <div className={cx(styles.message, styles[role], className)} data-role={role} {...props}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.bubble}>{children}</div>
    </div>
  );
}

export function ConversationStatus({ children, className, ...props }: ConversationProps) {
  return <div className={cx(styles.status, className)} role="status" aria-live="polite" {...props}>{children}</div>;
}

export function ConversationAttachments({ children, className, ...props }: ConversationProps) {
  return <div className={cx(styles.attachments, className)} {...props}>{children}</div>;
}

export function ConversationComposer({ children, className, ...props }: ConversationProps) {
  return <div className={cx(styles.composer, className)} {...props}>{children}</div>;
}
