/**
 * Lightweight container component used for panels across the app.
 *
 * @remarks
 * Supports tone variants, padding presets, and an optional interactive affordance.
 *
 * @param props.as - Semantic element to render (defaults to `div`).
 * @param props.tone - Visual tone variant.
 * @param props.padding - Padding preset.
 * @param props.interactive - Enables hover/focus affordance.
 */
import type { HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import "./card.module.css";

export type CardTone = "default" | "muted" | "contrast";
export type CardPadding = "none" | "sm" | "md" | "lg";

type CardElement = "div" | "section" | "article";

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** Optional semantic element type. Defaults to `div`. */
  as?: CardElement;
  /** Visual tone; drives background/border CSS vars. */
  tone?: CardTone;
  /** Padding preset; maps to CSS variables so consumers can override globally. */
  padding?: CardPadding;
  /** Adds hover/focus affordance (lift + outline). */
  interactive?: boolean;
};

export function Card({
  as,
  tone = "default",
  padding = "md",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const Component: CardElement = as ?? "div";
  const TONE_CLASS: Record<CardTone, string | null> = { default: null, muted: "tone-muted", contrast: "tone-contrast" };
  const PADDING_CLASS: Record<CardPadding, string> = { none: "padding-none", sm: "padding-sm", md: "padding-md", lg: "padding-lg" };
  const classes = cx(
    "card",
    TONE_CLASS[tone],
    PADDING_CLASS[padding],
    interactive && "interactive",
    className,
  );

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
