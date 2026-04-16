"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import { TopBar, type TopBarProps } from "../top-bar/TopBar";
import styles from "./app-shell.module.css";

const DESKTOP_BREAKPOINT = 960;

function getIsDesktop() {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= DESKTOP_BREAKPOINT;
}

export type AppShellProps = {
  /** Primary page content rendered in the main area. */
  children: ReactNode;
  /** Sidebar navigation or custom content. */
  sidebar: ReactNode;
  /** Brand element rendered next to the hamburger (text or JSX). */
  brand?: ReactNode;
  /** Optional brand href; when provided the brand renders as an anchor. */
  brandHref?: string;
  /** Optional content after the brand on the left side of the top bar. */
  topbarStart?: ReactNode;
  /** Optional content aligned to the right side of the top bar. */
  topbarEnd?: ReactNode;
  /** Optional built-in theme toggle for the top bar. */
  showThemeToggle?: boolean;
  themeToggleProps?: TopBarProps["themeToggleProps"];
  topBarBrandingLocation?: TopBarProps["brandingLocation"];
  /** Custom class names for styling overrides. */
  className?: string;
  sidebarClassName?: string;
  topbarClassName?: string;
  mainClassName?: string;
  /** Sets the sidebar width (e.g., `260`, `"18rem"`). */
  sidebarWidth?: number | string;
  /**
   * Closes the sidebar on mobile whenever this value changes.
   * Useful for reacting to route/pathname changes.
   */
  closeSidebarOnChangeKey?: unknown;
  /** Label for the hamburger button (aria-label). */
  hamburgerLabel?: string;
  /** Optional callback fired whenever the sidebar open state changes. */
  onSidebarToggle?: (open: boolean) => void;
};

/**
  * Responsive application shell with a collapsible sidebar and sticky top bar.
  *
  * - Sidebar opens by default on desktop, collapses on mobile.
  * - Closes on outside click/scroll/touch when in mobile mode.
  * - Provides optional hook to close the sidebar when a prop value changes
  *   (e.g., route transitions).
  */
export function AppShell({
  children,
  sidebar,
  brand,
  brandHref,
  topbarStart,
  topbarEnd,
  showThemeToggle = false,
  themeToggleProps,
  topBarBrandingLocation = "left",
  className,
  sidebarClassName,
  topbarClassName,
  mainClassName,
  sidebarWidth,
  closeSidebarOnChangeKey,
  hamburgerLabel = "Toggle navigation",
  onSidebarToggle,
}: AppShellProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transitionsReady, setTransitionsReady] = useState(false);
  const prevIsDesktopRef = useRef(false);
  const closeKeyRef = useRef(closeSidebarOnChangeKey);

  const sidebarRef = useRef<HTMLElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const sidebarId = useId();

  useEffect(() => {
    const desktop = getIsDesktop();
    setIsDesktop(desktop);
    setSidebarOpen(desktop);
    prevIsDesktopRef.current = desktop;
    const transitionFrame = window.requestAnimationFrame(() => {
      setTransitionsReady(true);
    });

    const handleResize = () => {
      const nowDesktop = getIsDesktop();
      setIsDesktop(nowDesktop);
      if (nowDesktop !== prevIsDesktopRef.current) {
        setSidebarOpen(nowDesktop);
        prevIsDesktopRef.current = nowDesktop;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(transitionFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close the sidebar when clicking outside or scrolling on mobile.
  useEffect(() => {
    if (isDesktop || !sidebarOpen) return;

    const mainElement = mainRef.current;
    const closeSidebar = () => setSidebarOpen(false);

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (sidebarRef.current?.contains(target)) return;
      if (hamburgerRef.current?.contains(target)) return;
      closeSidebar();
    };

    const timeoutId = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("scroll", closeSidebar, { passive: true });
      mainElement?.addEventListener("scroll", closeSidebar, { passive: true });
      document.addEventListener("touchmove", closeSidebar, { passive: true });
    }, 10);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", closeSidebar);
      mainElement?.removeEventListener("scroll", closeSidebar);
      document.removeEventListener("touchmove", closeSidebar);
    };
  }, [sidebarOpen, isDesktop]);

  // Allow consumers to request a mobile sidebar close when a value changes (e.g., pathname).
  useEffect(() => {
    if (!isDesktop && closeKeyRef.current !== closeSidebarOnChangeKey) {
      setSidebarOpen(false);
    }
    closeKeyRef.current = closeSidebarOnChangeKey;
  }, [closeSidebarOnChangeKey, isDesktop]);

  useEffect(() => {
    onSidebarToggle?.(sidebarOpen);
  }, [sidebarOpen, onSidebarToggle]);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  const sidebarWidthValue =
    sidebarWidth === undefined
      ? undefined
      : typeof sidebarWidth === "number"
        ? `${sidebarWidth}px`
        : sidebarWidth;

  const shellStyle: CSSProperties | undefined = sidebarWidthValue
    ? { ["--app-shell-sidebar-width" as string]: sidebarWidthValue }
    : undefined;

  const shellClasses = cx(
    styles.appShell,
    transitionsReady && styles.appShellAnimated,
    sidebarOpen ? styles.appShellOpen : styles.appShellCollapsed,
    className,
  );

  const sidebarClasses = cx(styles.appShellSidebar, sidebarOpen && styles.appShellSidebarOpen, sidebarClassName);

  return (
    <div
      className={shellClasses}
      style={shellStyle}
      data-app-shell
      data-desktop={isDesktop ? "true" : "false"}
      data-sidebar-open={sidebarOpen ? "true" : "false"}
    >
      <TopBar
        className={cx(styles.appShellTopbar, topbarClassName)}
        leading={
          <button
            ref={hamburgerRef}
            type="button"
            className={styles.appShellHamburger}
            onClick={toggleSidebar}
            aria-label={hamburgerLabel}
            aria-expanded={sidebarOpen}
            aria-controls={sidebarId}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        }
        brand={brand}
        brandHref={brandHref}
        brandingLocation={topBarBrandingLocation}
        center={topbarStart}
        actions={topbarEnd}
        showThemeToggle={showThemeToggle}
        themeToggleProps={themeToggleProps}
      />
      {!isDesktop && sidebarOpen && (
        <div className={styles.appShellBackdrop} onClick={() => setSidebarOpen(false)} onTouchStart={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      <aside ref={sidebarRef} id={sidebarId} className={sidebarClasses} aria-label="Sidebar navigation">
        {sidebar}
      </aside>
      <main ref={mainRef} className={cx(styles.appShellMain, mainClassName)}>
        {children}
      </main>
    </div>
  );
}
