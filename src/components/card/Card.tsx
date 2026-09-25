/**
 * Lightweight container for discrete content objects across the app.
 *
 * @remarks
 * Supports tone variants, padding presets, and an optional interactive affordance.
 * Use Surface for visual grouping that does not represent a discrete object.
 *
 * @param props.as - Semantic element to render (defaults to `div`).
 * @param props.tone - Visual tone variant.
 * @param props.padding - Padding preset.
 * @param props.interactive - Enables hover/focus affordance.
 */
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cx } from "../../utils/cx";
import styles from "./card.module.css";

export type CardTone = "default" | "inset" | "muted" | "contrast";
export type CardPadding = "none" | "sm" | "md" | "lg";

type CardElement = "div" | "section" | "article";

type CardOwnProps<T extends CardElement> = {
  /** Optional semantic element type. Defaults to `div`. */
  as?: T;
  /** Visual tone; drives background/border CSS vars. */
  tone?: CardTone;
  /** Padding preset; maps to CSS variables so consumers can override globally. */
  padding?: CardPadding;
  /** Adds hover/focus affordance (lift + outline). */
  interactive?: boolean;
};

export type CardProps<T extends CardElement = "div"> =
  CardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>;

export function Card<T extends CardElement = "div">({
  as,
  tone = "default",
  padding = "md",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const TONE_CLASS: Record<CardTone, string | null> = { default: null, inset: "tone-inset", muted: "tone-muted", contrast: "tone-contrast" };
  const PADDING_CLASS: Record<CardPadding, string> = { none: "padding-none", sm: "padding-sm", md: "padding-md", lg: "padding-lg" };
  const classes = cx(
    styles.card,
    TONE_CLASS[tone] ? styles[TONE_CLASS[tone]] : null,
    styles[PADDING_CLASS[padding]],
    interactive && styles.interactive,
    className,
  );

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
