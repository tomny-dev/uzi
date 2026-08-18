import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./page-header.module.css";

export type PageHeaderHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  headingLevel?: PageHeaderHeadingLevel;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  headingLevel = 1,
  className,
  ...rest
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as `h${PageHeaderHeadingLevel}`;

  return (
    <header className={cx(styles.header, className)} {...rest}>
      <div className={styles.content}>
        {eyebrow != null && <div className={styles.eyebrow}>{eyebrow}</div>}
        <Heading className={styles.title}>{title}</Heading>
        {description != null && <div className={styles.description}>{description}</div>}
      </div>
      {actions != null && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
