"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cx } from "../../utils/cx";
import styles from "./avatar.module.css";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: AvatarSize;
};

export function Avatar({
  className,
  size = "md",
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cx(styles.avatar, styles[`size-${size}`], className)}
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cx(styles.image, className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cx(styles.fallback, className)}
      {...props}
    />
  );
}
