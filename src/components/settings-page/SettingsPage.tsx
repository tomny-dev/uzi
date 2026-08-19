import * as React from "react";
import { cx } from "../../utils/cx";
import styles from "./settings-page.module.css";

export interface SettingsSection {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export interface SettingsPageProps {
  /** Page title */
  title: React.ReactNode;
  /** Page subtitle / description */
  description?: React.ReactNode;
  /** Form sections rendered in the main content area */
  sections: SettingsSection[];
  /** Content rendered in the danger zone (red visual distinction) */
  dangerZone?: React.ReactNode;
  /** Danger zone title */
  dangerZoneTitle?: React.ReactNode;
  /** Danger zone description */
  dangerZoneDescription?: React.ReactNode;
  /** Sticky footer content (e.g., Save / Cancel buttons) */
  footer: React.ReactNode;
  /** Whether the page is saving */
  saving?: boolean;
  /** Additional class name for the outer wrapper */
  className?: string;
}

/**
 * SettingsPage — a settings layout with sections, a danger zone, and a sticky save footer.
 *
 * Layout:
 *   Header (title + description)
 *   Scrollable content:
 *     Section group with headings and descriptions
 *     Danger zone with red visual distinction
 *   Sticky footer: save/cancel buttons
 */
export function SettingsPage({
  title,
  description,
  sections,
  dangerZone,
  dangerZoneTitle,
  dangerZoneDescription,
  footer,
  saving = false,
  className,
}: SettingsPageProps) {
  return (
    <div className={cx(styles.wrapper, className)}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.sections}>
          {sections.map((section, index) => (
            <section key={index} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                {section.description && (
                  <p className={styles.sectionDescription}>{section.description}</p>
                )}
              </div>
              <div className={styles.sectionBody}>{section.children}</div>
            </section>
          ))}
        </div>

        {dangerZone && (
          <div className={styles.dangerZone}>
            {(dangerZoneTitle || dangerZoneDescription) && (
              <div className={styles.dangerZoneHeader}>
                {dangerZoneTitle && <h2 className={styles.dangerZoneTitle}>{dangerZoneTitle}</h2>}
                {dangerZoneDescription && (
                  <p className={styles.dangerZoneDescription}>{dangerZoneDescription}</p>
                )}
              </div>
            )}
            <div className={styles.dangerZoneBody}>{dangerZone}</div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {footer}
          {saving && <span className={styles.savingIndicator}>Saving...</span>}
        </div>
      </footer>
    </div>
  );
}
