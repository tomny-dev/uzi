import "./theme/theme.css";

// Primitives
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/button/Button";
export { Button } from "./components/button/Button";

export type { AvatarProps, AvatarSize } from "./components/avatar/Avatar";
export { Avatar, AvatarFallback, AvatarImage } from "./components/avatar/Avatar";

export type { CardProps, CardPadding, CardTone } from "./components/card/Card";
export { Card } from "./components/card/Card";

export type { PillProps, PillSize, PillTone } from "./components/pill/Pill";
export { Pill } from "./components/pill/Pill";

// Overlays
export type { ModalOverlayProps, ModalProps, ModalSize } from "./components/modal/Modal";
export { Modal, ModalOverlay } from "./components/modal/Modal";

// Feedback
export type { AlertProps, AlertTone } from "./components/alert/Alert";
export { Alert } from "./components/alert/Alert";

export { ToastProvider, useToast } from "./components/toast/ToastContext";
export type {
  Toast,
  ToastConfig,
  ToastContextValue,
  ToastOptions,
  ToastPosition,
  ToastType,
} from "./components/toast/types";

// Inputs
export type { InputProps } from "./components/input/Input";
export { Input } from "./components/input/Input";

export type { LabelProps } from "./components/label/Label";
export { Label } from "./components/label/Label";

export type { CheckboxProps } from "./components/checkbox/Checkbox";
export { Checkbox } from "./components/checkbox/Checkbox";

export type { DropdownProps, DropdownOption } from "./components/dropdown/Dropdown";
export { Dropdown } from "./components/dropdown/Dropdown";

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./components/dropdown-menu/DropdownMenu";

// Layout
export type { AppShellProps } from "./components/app-shell/AppShell";
export { AppShell } from "./components/app-shell/AppShell";

export type { SidebarNavItem, SidebarNavProps, SidebarNavSection } from "./components/sidebar-nav/SidebarNav";
export { SidebarNav } from "./components/sidebar-nav/SidebarNav";

export type { TopBarProps } from "./components/top-bar/TopBar";
export { TopBar } from "./components/top-bar/TopBar";

export type { ThemeToggleButtonProps } from "./components/theme-toggle-button/ThemeToggleButton";
export { ThemeToggleButton } from "./components/theme-toggle-button/ThemeToggleButton";

// Theme
export type { UziAccent, UziResolvedTheme, UziTheme } from "./theme/ThemeProvider";
export { ThemeProvider, useTheme } from "./theme/ThemeProvider";

// Utils
export { cx } from "./utils/cx";

// Feedback / display
export type { SkeletonProps } from "./components/skeleton/Skeleton";
export { Skeleton } from "./components/skeleton/Skeleton";

export type { ProgressProps, ProgressTone } from "./components/progress/Progress";
export { Progress } from "./components/progress/Progress";

// Inputs
export type { SelectProps, SelectOption } from "./components/select/Select";
export { Select } from "./components/select/Select";
