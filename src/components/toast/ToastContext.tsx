"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cx } from "../../utils/cx";
import type {
  Toast,
  ToastConfig,
  ToastContextValue,
  ToastOptions,
  ToastPosition,
  ToastType,
} from "./types";
import styles from "./toast.module.css";

/** Default provider configuration. */
const DEFAULT_CONFIG: Required<ToastConfig> = {
  position: "top-right",
  maxToasts: 5,
  defaultDuration: 4000,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastIdCounter = 0;
const generateToastId = () => `toast-${++toastIdCounter}-${Date.now()}`;

/**
 * Toast notification context provider.
 *
 * @remarks
 * Wrap your app (or a section) to enable `useToast` calls. Supports configurable placement,
 * maximum visible toasts, and pause behavior on hover or window blur.
 *
 * @param props.children - React subtree that can consume the toast context.
 * @param props.config - Optional provider configuration overrides.
 */
export function ToastProvider({
  children,
  config,
}: {
  children: ReactNode;
  config?: ToastConfig;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const merged = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  const push = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = generateToastId();
      setToasts((prev) => {
        const next: Toast[] = [
          ...prev,
          {
            id,
            message,
            type: options.type ?? "info",
            duration: options.duration ?? (options.type === "error" ? 6000 : merged.defaultDuration),
            dismissible: options.dismissible ?? true,
            copyable: options.copyable ?? false,
            action: options.action,
          },
        ];
        if (next.length > merged.maxToasts) next.shift();
        return next;
      });
      return id;
    },
    [merged.defaultDuration, merged.maxToasts],
  );

  const success = useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) => push(message, { ...options, type: "success" }),
    [push],
  );
  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) =>
      push(message, { ...options, type: "error", duration: options?.duration ?? 6000 }),
    [push],
  );
  const warning = useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) => push(message, { ...options, type: "warning" }),
    [push],
  );
  const info = useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) => push(message, { ...options, type: "info" }),
    [push],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  useEffect(() => {
    if (!merged.pauseOnFocusLoss) return;
    const handleVisibility = () => setIsPaused(document.visibilityState !== "visible");
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [merged.pauseOnFocusLoss]);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, push, success, error, warning, info, dismiss, dismissAll }),
    [toasts, push, success, error, warning, info, dismiss, dismissAll],
  );

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastContainer
          toasts={toasts}
          position={merged.position}
          pauseOnHover={merged.pauseOnHover}
          isPaused={isPaused}
          onDismiss={dismiss}
          onPauseChange={setIsPaused}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access the toast API.
 *
 * @remarks
 * Exposes `push`, intent helpers (`success`, `error`, `warning`, `info`), and dismissal helpers.
 * Must be called within a `ToastProvider`.
 *
 * @throws Error if used outside of a `ToastProvider`.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

/** Renders the positioned toast stack. */
function ToastContainer({
  toasts,
  position,
  pauseOnHover,
  isPaused,
  onDismiss,
  onPauseChange,
}: {
  toasts: Toast[];
  position: ToastPosition;
  pauseOnHover: boolean;
  isPaused: boolean;
  onDismiss: (id: string) => void;
  onPauseChange: (paused: boolean) => void;
}) {
  const posClass = (() => {
    switch (position) {
      case "top-left":
        return "topLeft";
      case "top-center":
        return "topCenter";
      case "bottom-right":
        return "bottomRight";
      case "bottom-left":
        return "bottomLeft";
      case "bottom-center":
        return "bottomCenter";
      case "top-right":
      default:
        return "topRight";
    }
  })();

  return (
    <>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} isPaused={isPaused} onDismiss={onDismiss} />
      ))}
      <ToastPrimitive.Viewport
        className={cx(styles.stack, styles[posClass])}
        label="Notifications"
        onMouseEnter={() => pauseOnHover && onPauseChange(true)}
        onMouseLeave={() => pauseOnHover && onPauseChange(false)}
      />
    </>
  );
}

/** Individual toast item with timers and actions. */
function ToastItem({
  toast,
  isPaused,
  onDismiss,
}: {
  toast: Toast;
  isPaused: boolean;
  onDismiss: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const timerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const remainingRef = useRef<number>(toast.duration ?? 0);
  const closingRef = useRef(false);

  const palette = getPalette(toast.type);
  const styleVars: CSSProperties = {
    ["--toast-bg" as any]: palette.background,
    ["--toast-border" as any]: palette.border,
    ["--toast-accent" as any]: palette.accent,
    ["--toast-text" as any]: palette.text,
    ["--toast-action-bg" as any]: palette.actionBg,
    ["--toast-action-border" as any]: palette.actionBorder,
  };

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const triggerDismiss = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setOpen(false);
    stopTimer();
    window.setTimeout(() => onDismiss(toast.id), 160);
  }, [onDismiss, toast.id]);

  const schedule = useCallback(
    (delay: number) => {
      if (!delay || delay <= 0) {
        triggerDismiss();
        return;
      }
      startRef.current = performance.now();
      stopTimer();
      timerRef.current = window.setTimeout(() => triggerDismiss(), delay);
    },
    [triggerDismiss],
  );

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return undefined;
    schedule(toast.duration);
    return stopTimer;
  }, [schedule, toast.duration]);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    if (isPaused) {
      const elapsed = performance.now() - startRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      stopTimer();
    } else {
      schedule(remainingRef.current);
    }
  }, [isPaused, schedule, toast.duration]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    try {
      await navigator.clipboard.writeText(toast.message);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    copyTimerRef.current = window.setTimeout(() => setCopyState("idle"), 1800);
  }, [toast.message]);

  const icon = getIcon(toast.type);

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) triggerDismiss();
      }}
      duration={2147483647}
      className={styles.toast}
      style={styleVars}
    >
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      <div className={styles.body}>
        <ToastPrimitive.Description className={styles.message}>
          {toast.message}
        </ToastPrimitive.Description>
        {toast.action && (
          <div className={styles.actions}>
            <ToastPrimitive.Action asChild altText={toast.action.label}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => {
                  toast.action?.onClick();
                  triggerDismiss();
                }}
              >
                {toast.action.label}
              </button>
            </ToastPrimitive.Action>
          </div>
        )}
      </div>
      <div className={styles.controls}>
        {toast.copyable && (
          <button
            type="button"
            className={cx(styles.iconButton, copyState === "failed" && styles.iconButtonError)}
            aria-label="Copy message"
            onClick={handleCopy}
          >
            {copyState === "copied" ? (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M2 6.5l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : copyState === "failed" ? (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M10 3L3 10M3 3l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <rect x="4.5" y="1.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M1.5 5.5v5a1.5 1.5 0 001.5 1.5h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
        {toast.dismissible !== false && (
          <ToastPrimitive.Close asChild>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Dismiss notification"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M10 3L3 10M3 3l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </ToastPrimitive.Close>
        )}
      </div>
    </ToastPrimitive.Root>
  );
}

function getPalette(type: ToastType) {
  switch (type) {
    case "success":
      return {
        background: "color-mix(in srgb, var(--success) 12%, var(--popover))",
        border: "color-mix(in srgb, var(--success) 30%, transparent)",
        accent: "var(--success)",
        text: "var(--popover-foreground)",
        actionBg: "color-mix(in srgb, var(--success) 14%, transparent)",
        actionBorder: "color-mix(in srgb, var(--success) 35%, transparent)",
      };
    case "error":
      return {
        background: "color-mix(in srgb, var(--destructive) 12%, var(--popover))",
        border: "color-mix(in srgb, var(--destructive) 30%, transparent)",
        accent: "var(--destructive)",
        text: "var(--popover-foreground)",
        actionBg: "color-mix(in srgb, var(--destructive) 14%, transparent)",
        actionBorder: "color-mix(in srgb, var(--destructive) 35%, transparent)",
      };
    case "warning":
      return {
        background: "color-mix(in srgb, var(--warning) 12%, var(--popover))",
        border: "color-mix(in srgb, var(--warning) 30%, transparent)",
        accent: "var(--warning)",
        text: "var(--popover-foreground)",
        actionBg: "color-mix(in srgb, var(--warning) 14%, transparent)",
        actionBorder: "color-mix(in srgb, var(--warning) 35%, transparent)",
      };
    case "info":
    default:
      return {
        background: "color-mix(in srgb, var(--primary) 12%, var(--popover))",
        border: "color-mix(in srgb, var(--primary) 30%, transparent)",
        accent: "var(--primary)",
        text: "var(--popover-foreground)",
        actionBg: "color-mix(in srgb, var(--primary) 14%, transparent)",
        actionBorder: "color-mix(in srgb, var(--primary) 35%, transparent)",
      };
  }
}

function getIcon(type: ToastType) {
  switch (type) {
    case "success":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "error":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "warning":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 3v6M8 11.5v1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 7v5M8 4.5v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
  }
}
