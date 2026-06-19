"use client";

import { type AnchorHTMLAttributes, type CSSProperties, type ReactNode } from "react";
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

export type MatchStrategy = "prefix" | "most-specific";

export type SidebarNavProps = {
  items?: SidebarNavItem[];
  sections?: SidebarNavSection[];
  currentPath?: string;
  getIsActive?: (item: SidebarNavItem, currentPath?: string) => boolean;
  matchStrategy?: MatchStrategy;
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

const defaultIsActive = (item: SidebarNavItem, path?: string) => {
  if (item.active !== undefined) return item.active;
  if (!item.href) return false;
  if (!path) return false;
  if (item.href === "/") return path === "/";
  return path.startsWith(item.href);
};

const matchesPath = (href: string, currentPath: string): boolean => {
  if (href === "/") return currentPath === "/";
  const normalizedHref = href.endsWith("/") ? href : `${href}/`;
  return currentPath === href || currentPath.startsWith(normalizedHref);
};

const resolveIsActive = (
  allHrefs: string[],
  strategy: MatchStrategy,
): ((item: SidebarNavItem) => boolean) => {
  if (strategy !== "most-specific") {
    return defaultIsActive;
  }

  return (item: SidebarNavItem): boolean => {
    if (item.active !== undefined) return item.active;
    if (!item.href) return false;

    const matchingHrefs = allHrefs.filter((href) => matchesPath(href, item.href!));
    const longestHref = matchingHrefs.sort((a, b) => b.length - a.length)[0];
    return item.href === longestHref;
  };
};

export function SidebarNav({
  items = [],
  sections,
  currentPath,
  getIsActive: customGetIsActive,
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

  // Collect all hrefs from all items for most-specific matching
  const allHrefs = resolvedSections.flatMap((section) =>
    section.items.map((item) => item.href).filter((href): href is string => !!href),
  );

  // Build the active-state function based on strategy (only when no custom override)
  const isActiveFn = customGetIsActive ?? resolveIsActive(allHrefs, matchStrategy);

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
                  active={isActiveFn(item)}
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
