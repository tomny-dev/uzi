"use client";

import { type AnchorHTMLAttributes, type CSSProperties, type ReactNode, useMemo } from "react";
import { cx } from "../../utils/cx";
import styles from "./sidebar-nav.module.css";

export type SidebarNavItem = {
  label: string;
  href?: string;
  icon?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  /**
   * When `true`, this item uses exact matching (matches its own path and paths starting with `{href}/`)
   * instead of prefix matching. This flag takes precedence over the global `matchStrategy` prop on a
   * per-item basis — even when `matchStrategy="prefix"`, an item with `exact: true` will use exact matching.
   * When `matchStrategy="most-specific"`, exact-flagged items participate in the length-based tiebreaker
   * like all other candidates, provided they pass their own match check first.
   */
  exact?: boolean;
  title?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  onClick?: () => void;
};

export type SidebarNavSection = {
  id?: string;
  label?: ReactNode;
  items: SidebarNavItem[];
};

export type SidebarNavProps = {
  items?: SidebarNavItem[];
  sections?: SidebarNavSection[];
  currentPath?: string;
  getIsActive?: (item: SidebarNavItem, currentPath?: string) => boolean;
  matchStrategy?: "prefix" | "most-specific";
  onItemClick?: (item: SidebarNavItem) => void;
  header?: ReactNode;
  footer?: ReactNode;
  ariaLabel?: string;
  collapsed?: boolean;
  iconSize?: number | string;
  className?: string;
  itemClassName?: string;
  sectionClassName?: string;
};

const isActivePrefix = (item: SidebarNavItem, path?: string) => {
  if (item.active !== undefined) return item.active;
  if (!item.href) return false;
  if (!path) return false;
  if (item.href === "/") return path === "/";
  return path.startsWith(item.href);
};

const isActiveExact = (item: SidebarNavItem, path?: string) => {
  if (item.active !== undefined) return item.active;
  if (!item.href) return false;
  if (!path) return false;
  // Root href "/" must match exactly — otherwise every path would match.
  if (item.href === "/") return path === "/";
  // Normalize trailing slashes for consistent matching with findMostSpecific length computation.
  const normalizedHref = item.href.endsWith("/") ? item.href.slice(0, -1) : item.href;
  return normalizedHref === path || path.startsWith(`${normalizedHref}/`);
};

const hrefLength = (href: string) => (href.endsWith("/") ? href.length - 1 : href.length);

const findMostSpecific = (items: SidebarNavItem[], currentPath?: string): Set<string> => {
  const result = new Set<string>();
  if (!currentPath) return result;

  // Collect all items that could match the path — use isActiveExact for exact-flagged items.
  // Exclude disabled items from matching since they are not interactive targets.
  const matchingItems = items.filter(item => {
    if (item.disabled || !item.href) return false;
    return item.exact ? isActiveExact(item, currentPath) : isActivePrefix(item, currentPath);
  });

  if (matchingItems.length === 0) return result;

  // Find the longest href among prefix matches.
  let maxLen = 0;
  for (const item of matchingItems) {
    if (!item.href) continue;
    const len = hrefLength(item.href);
    if (len > maxLen) maxLen = len;
  }

  // Only the items with the longest href are active.
  for (const item of matchingItems) {
    if (!item.href) continue;
    if (hrefLength(item.href) === maxLen) result.add(item.href);
  }

  return result;
};

export function SidebarNav({
  items = [],
  sections,
  currentPath,
  getIsActive,
  matchStrategy = "prefix",
  onItemClick,
  header,
  footer,
  ariaLabel = "Sidebar navigation",
  collapsed = false,
  iconSize,
  className,
  itemClassName,
  sectionClassName,
}: SidebarNavProps) {
  const resolvedSections = sections?.length
    ? sections
    : [{ id: "default", items }];

  // Build the default isActive function based on matchStrategy.
  const defaultIsActiveFn = useMemo<(item: SidebarNavItem, path?: string) => boolean>(() => {
    if (matchStrategy === "most-specific") {
      const allItems = resolvedSections.flatMap(section => section.items);
      const mostSpecificHrefs = findMostSpecific(allItems, currentPath);
      return (item: SidebarNavItem) => {
        if (item.active !== undefined) return item.active;
        if (!item.href) return false;
        // Exact-flagged items participate in the length-based tiebreaker like all other candidates.
        return mostSpecificHrefs.has(item.href);
      };
    } else {
      return (item: SidebarNavItem, path?: string) => {
        if (item.active !== undefined) return item.active;
        if (item.exact) return isActiveExact(item, path);
        return isActivePrefix(item, path);
      };
    }
  }, [matchStrategy, resolvedSections, currentPath]);

  const resolvedGetIsActive = getIsActive ?? defaultIsActiveFn;

  const style =
    iconSize !== undefined
      ? ({
          ["--sidebar-nav-icon-size" as string]:
            typeof iconSize === "number" ? `${iconSize}px` : iconSize,
        } satisfies CSSProperties)
      : undefined;

  return (
    <nav
      className={cx(
        styles.sidebarNav,
        collapsed && styles.sidebarNavCollapsed,
        className,
      )}
      aria-label={ariaLabel}
      style={style}
    >
      {header ? <div className={styles.header}>{header}</div> : null}
      <div className={styles.sections}>
        {resolvedSections.map((section, sectionIndex) => (
          <div
            key={section.id ?? `section-${sectionIndex}`}
            className={cx(styles.section, sectionClassName)}
          >
            {section.label && !collapsed ? (
              <div className={styles.sectionLabel}>{section.label}</div>
            ) : null}
            <div className={styles.sectionItems}>
              {section.items.map((item, itemIndex) => (
                <SidebarNavEntry
                  key={`${section.id ?? sectionIndex}-${item.href ?? item.title ?? itemIndex}`}
                  item={item}
                  active={resolvedGetIsActive(item, currentPath)}
                  collapsed={collapsed}
                  itemClassName={itemClassName}
                  onItemClick={onItemClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </nav>
  );
}

type SidebarNavEntryProps = {
  item: SidebarNavItem;
  active: boolean;
  collapsed: boolean;
  itemClassName?: string;
  onItemClick?: (item: SidebarNavItem) => void;
};

function SidebarNavEntry({
  item,
  active,
  collapsed,
  itemClassName,
  onItemClick,
}: SidebarNavEntryProps) {
  const rel = item.rel ?? (item.target === "_blank" ? "noreferrer" : undefined);
  const title = item.title ?? (typeof item.label === "string" ? item.label : undefined);
  const classes = cx(
    styles.item,
    active && styles.itemActive,
    collapsed && styles.itemCollapsed,
    item.disabled && styles.itemDisabled,
    itemClassName,
  );
  const content = (
    <>
      {item.icon && <span className={styles.icon}>{item.icon}</span>}
      {!collapsed ? (
        <span className={styles.itemBody}>
          <span className={styles.labelRow}>
            <span className={styles.label}>{item.label}</span>
            {item.badge && <span className={styles.badge}>{item.badge}</span>}
          </span>
          {item.description ? <span className={styles.description}>{item.description}</span> : null}
        </span>
      ) : null}
    </>
  );

  const handleClick = () => {
    if (item.disabled) return;
    item.onClick?.();
    onItemClick?.(item);
  };

  if (!item.href) {
    return (
      <button
        type="button"
        className={classes}
        aria-current={active ? "page" : undefined}
        aria-disabled={item.disabled ? "true" : undefined}
        disabled={item.disabled}
        title={collapsed ? title : undefined}
        onClick={handleClick}
      >
        {content}
      </button>
    );
  }

  if (item.disabled) {
    return (
      <div
        className={classes}
        aria-current={active ? "page" : undefined}
        aria-disabled="true"
        title={collapsed ? title : undefined}
      >
        {content}
      </div>
    );
  }

  return (
    <a
      className={classes}
      href={item.href}
      target={item.target}
      rel={rel}
      aria-current={active ? "page" : undefined}
      title={collapsed ? title : undefined}
      onClick={handleClick}
    >
      {content}
    </a>
  );
}
