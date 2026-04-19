"use client";

import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cx } from "../../utils/cx";
import "./modal.module.css";

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
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <div className={"portalLayer"}>
          <DialogPrimitive.Overlay className={cx("backdrop", className)} />
          <DialogPrimitive.Content className={"overlayContent"}>
            {children}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
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
      <div className={cx("modal", `size-${size}`)}>
        <div className={"header"}>
          <div className={"titles"}>
            <DialogPrimitive.Title className={"title"}>{title}</DialogPrimitive.Title>
            {subtitle ? (
              <DialogPrimitive.Description className={"subtitle"}>
                {subtitle}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close asChild>
            <button className={"closeButton"} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </DialogPrimitive.Close>
        </div>

        <div className={"body"}>{children}</div>

        {footer && <div className={"footer"}>{footer}</div>}
      </div>
    </ModalOverlay>
  );
}
