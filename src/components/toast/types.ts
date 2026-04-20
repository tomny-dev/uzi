/** Visual intent for a toast. Drives colors and icons. */
export type ToastType = "success" | "error" | "warning" | "info";

/** Where toast stack is anchored in the viewport. */
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

/** A single toast entry. */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  dismissible?: boolean;
  copyable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/** Options when pushing a toast. */
export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  dismissible?: boolean;
  copyable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/** Provider configuration. */
export interface ToastConfig {
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
  pauseOnHover?: boolean;
  pauseOnFocusLoss?: boolean;
}

/** Public API exposed by the toast context. */
export interface ToastContextValue {
  toasts: Toast[];
  push: (message: string, options?: ToastOptions) => string;
  success: (message: string, options?: Omit<ToastOptions, "type">) => string;
  error: (message: string, options?: Omit<ToastOptions, "type">) => string;
  warning: (message: string, options?: Omit<ToastOptions, "type">) => string;
  info: (message: string, options?: Omit<ToastOptions, "type">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
