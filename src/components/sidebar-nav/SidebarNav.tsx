"use client";

import { type AnchorHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import "./sidebar-nav.module.css";

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

export type SidebarNavProps = {
  items?: SidebarNavItem[];
  sections?: SidebarNavSection[];
  currentPath?: string;
  getIsActive?: (item: SidebarNavItem, currentPath?: string) => boolean;
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

export function SidebarNav({
  items = [],
  sections,
  currentPath,
  getIsActive = defaultIsActive,
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
  const style =
    iconSize !== undefined
      ? ({
          ["--sidebar-nav-icon-size" as string]:
            typeof iconSize === "number" ? `${iconSize}px` : iconSize,
        } satisfies CSSProperties)
      : undefined;

  return (
    <nav
      className={cx("uziSidebarNav", collapsed && "uziSidebarNavCollapsed", className)}
      aria-label={ariaLabel}
      style={style}
    >
      {header ? <div className={"uziSidebarNavHeader"}>{header}</div> : null}
      <div className={"uziSidebarNavSections"}>
        {resolvedSections.map((section, sectionIndex) => (
          <div
            key={section.id ?? `section-${sectionIndex}`}
            className={cx("uziSidebarNavSection", sectionClassName)}
          >
            {section.label && !collapsed ? (
              <div className={"uziSidebarNavSectionLabel"}>{section.label}</div>
            ) : null}
            <div className={"uziSidebarNavSectionItems"}>
              {section.items.map((item, itemIndex) => (
                <SidebarNavEntry
                  key={`${section.id ?? sectionIndex}-${item.href ?? item.title ?? itemIndex}`}
                  item={item}
                  active={getIsActive(item, currentPath)}
                  collapsed={collapsed}
                  itemClassName={itemClassName}
                  onItemClick={onItemClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {footer ? <div className={"uziSidebarNavFooter"}>{footer}</div> : null}
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
    "uziSidebarNavItem",
    active && "uziSidebarNavItemActive",
    collapsed && "uziSidebarNavItemCollapsed",
    item.disabled && "uziSidebarNavItemDisabled",
    itemClassName,
  );
  const content = (
    <>
      {item.icon && <span className={"uziSidebarNavIcon"}>{item.icon}</span>}
      {!collapsed ? (
        <span className={"uziSidebarNavItemBody"}>
          <span className={"uziSidebarNavLabelRow"}>
            <span className={"uziSidebarNavLabel"}>{item.label}</span>
            {item.badge && <span className={"uziSidebarNavBadge"}>{item.badge}</span>}
          </span>
          {item.description ? <span className={"uziSidebarNavDescription"}>{item.description}</span> : null}
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
