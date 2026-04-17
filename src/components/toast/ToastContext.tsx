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
import { cx } from "../../utils/cx";
import type {
  Toast,
  ToastConfig,
  ToastContextValue,
  ToastOptions,
  ToastPosition,
  ToastType,
} from "./types";
import "./toast.module.css";

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
      {children}
      <ToastContainer
        toasts={toasts}
        position={merged.position}
        pauseOnHover={merged.pauseOnHover}
        isPaused={isPaused}
        onDismiss={dismiss}
        onPauseChange={setIsPaused}
      />
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
    <div
      className={cx("stack", posClass)}
      role="presentation"
      onMouseEnter={() => pauseOnHover && onPauseChange(true)}
      onMouseLeave={() => pauseOnHover && onPauseChange(false)}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} isPaused={isPaused} onDismiss={onDismiss} />
      ))}
    </div>
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
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const remainingRef = useRef<number>(toast.duration ?? 0);

  const palette = getPalette(toast.type);
  const styleVars: CSSProperties = {
    ["--toast-bg" as any]: palette.background,
    ["--toast-border" as any]: palette.border,
    ["--toast-text" as any]: palette.text,
    ["--toast-button-bg" as any]: palette.buttonBg,
    ["--toast-button-border" as any]: palette.buttonBorder,
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
    setExiting(true);
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

  const icon = getIcon(toast.type);

  return (
    <div className={cx("toast", exiting && "exit")} style={styleVars} role="status" aria-live="polite">
      <span className={"icon"} aria-hidden>
        {icon}
      </span>
      <div className={"body"}>
        <div className={"message"}>{toast.message}</div>
        {toast.action && (
          <div className={"actions"}>
            <button
              type="button"
              className={"actionButton"}
              onClick={() => {
                toast.action?.onClick();
                triggerDismiss();
              }}
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>
      {toast.dismissible !== false && (
        <button
          type="button"
          className={"closeButton"}
          onClick={triggerDismiss}
          aria-label="Dismiss notification"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M11 3L3 11M3 3l8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

function getPalette(type: ToastType) {
  switch (type) {
    case "success":
      return {
        background: "#22c55e",
        border: "#16a34a",
        text: "#0b1224",
        buttonBg: "rgba(0, 0, 0, 0.08)",
        buttonBorder: "rgba(0, 0, 0, 0.2)",
        actionBg: "rgba(0, 0, 0, 0.1)",
        actionBorder: "rgba(0, 0, 0, 0.2)",
      };
    case "error":
      return {
        background: "#f87171",
        border: "#ef4444",
        text: "#0b1224",
        buttonBg: "rgba(0, 0, 0, 0.08)",
        buttonBorder: "rgba(0, 0, 0, 0.2)",
        actionBg: "rgba(0, 0, 0, 0.1)",
        actionBorder: "rgba(0, 0, 0, 0.2)",
      };
    case "warning":
      return {
        background: "#fbbf24",
        border: "#f59e0b",
        text: "#0b1224",
        buttonBg: "rgba(0, 0, 0, 0.08)",
        buttonBorder: "rgba(0, 0, 0, 0.2)",
        actionBg: "rgba(0, 0, 0, 0.1)",
        actionBorder: "rgba(0, 0, 0, 0.2)",
      };
    case "info":
    default:
      return {
        background: "#38bdf8",
        border: "#0ea5e9",
        text: "#0b1224",
        buttonBg: "rgba(0, 0, 0, 0.08)",
        buttonBorder: "rgba(0, 0, 0, 0.2)",
        actionBg: "rgba(0, 0, 0, 0.1)",
        actionBorder: "rgba(0, 0, 0, 0.2)",
      };
  }
}

function getIcon(type: ToastType) {
  switch (type) {
    case "success":
      return "OK";
    case "error":
      return "X";
    case "warning":
      return "!";
    case "info":
    default:
      return "i";
  }
}
