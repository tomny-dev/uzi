import * as React from "react";
import { cx } from "../../utils/cx";
import styles from "./empty-state-page.module.css";

export type EmptyStatePageVariant = "noData" | "noConnection" | "noPermissions";

export interface EmptyStatePageProps {
  /** Page variant driving icon, title, description defaults */
  variant?: EmptyStatePageVariant;
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Primary action button */
  primaryAction?: React.ReactNode;
  /** Secondary action button */
  secondaryAction?: React.ReactNode;
  /** Optional custom SVG icon (overrides variant icon) */
  icon?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/** Inline SVG icon for the "no data" variant */
function NoDataIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={styles.iconSvg} aria-hidden="true">
      <rect x="8" y="10" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="18" x2="40" y2="18" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="30" x2="32" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Inline SVG icon for the "no connection" variant */
function NoConnectionIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={styles.iconSvg} aria-hidden="true">
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" />
      <path d="M18 18l12 12M30 18L18 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Inline SVG icon for the "no permissions" variant */
function NoPermissionsIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={styles.iconSvg} aria-hidden="true">
      <rect x="12" y="20" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20v-6a4 4 0 018 0v6" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="30" r="2" fill="currentColor" />
    </svg>
  );
}

const variantMap: Record<
  EmptyStatePageVariant,
  { icon: React.FC; title: string; description: string }
> = {
  noData: {
    icon: NoDataIcon,
    title: "No data yet",
    description: "When you add data, it will appear here.",
  },
  noConnection: {
    icon: NoConnectionIcon,
    title: "No connection",
    description: "Check your network settings and try again.",
  },
  noPermissions: {
    icon: NoPermissionsIcon,
    title: "Access denied",
    description: "You don't have permission to view this content.",
  },
};

/**
 * EmptyStatePage — a Card-based page template with variant icons, title, description, and actions.
 *
 * Layout:
 *   Card → Icon → Title → Description → Actions
 */
export function EmptyStatePage({
  variant = "noData",
  title,
  description,
  primaryAction,
  secondaryAction,
  icon,
  className,
}: EmptyStatePageProps) {
  const { icon: VariantIcon, title: defaultTitle, description: defaultDescription } = variantMap[variant];

  return (
    <div className={cx(styles.wrapper, className)}>
      <div className={styles.card}>
        <div className={styles.iconArea}>
          {icon ?? <VariantIcon />}
        </div>
        <div className={styles.content}>
          <h2 className={styles.title}>{title ?? defaultTitle}</h2>
          <p className={styles.description}>{description ?? defaultDescription}</p>
        </div>
        {(primaryAction || secondaryAction) && (
          <div className={styles.actions}>
            {primaryAction}
            {secondaryAction}
          </div>
        )}
      </div>
    </div>
  );
}
