import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./section-header.module.css";

export type SectionHeaderHeadingLevel = 2 | 3 | 4;

export type SectionHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  headingLevel?: SectionHeaderHeadingLevel;
};

export function SectionHeader({
  title,
  description,
  actions,
  headingLevel = 2,
  className,
  ...rest
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  return (
    <div className={cx(styles.header, className)} {...rest}>
      <div className={styles.content}>
        <Heading className={styles.title}>{title}</Heading>
        {description && <div className={styles.description}>{description}</div>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
