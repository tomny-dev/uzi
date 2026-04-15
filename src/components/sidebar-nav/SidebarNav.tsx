"use client";

import { type AnchorHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./sidebar-nav.module.css";

export type SidebarNavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
  active?: boolean;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  onClick?: () => void;
};

export type SidebarNavProps = {
  items: SidebarNavItem[];
  /** Optional path-like value used for default active matching. */
  currentPath?: string;
  /**
   * Custom active matcher. Defaults to prefix matching (with a special case for `/`).
   * If `item.active` is provided, it wins over this function.
   */
  getIsActive?: (item: SidebarNavItem, currentPath?: string) => boolean;
  /** Called after the item click handler (if provided). */
  onItemClick?: (item: SidebarNavItem) => void;
  className?: string;
  itemClassName?: string;
};

const defaultIsActive = (item: SidebarNavItem, path?: string) => {
  if (item.active !== undefined) return item.active;
  if (!path) return false;
  if (item.href === "/") return path === "/";
  return path.startsWith(item.href);
};

export function SidebarNav({
  items,
  currentPath,
  getIsActive = defaultIsActive,
  onItemClick,
  className,
  itemClassName,
}: SidebarNavProps) {
  return (
    <nav className={cx(styles.nav, className)} aria-label="Sidebar navigation">
      {items.map((item) => {
        const active = getIsActive(item, currentPath);
        const rel = item.rel ?? (item.target === "_blank" ? "noreferrer" : undefined);

        return (
          <a
            key={item.href}
            className={cx(styles.item, active && styles.active, itemClassName)}
            href={item.href}
            target={item.target}
            rel={rel}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              item.onClick?.();
              onItemClick?.(item);
            }}
          >
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            <span className={styles.label}>{item.label}</span>
            {item.badge && <span className={styles.badge}>{item.badge}</span>}
          </a>
        );
      })}
    </nav>
  );
}
