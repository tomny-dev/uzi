"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cx } from "../../utils/cx";
import "./avatar.module.css";

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
      className={cx("avatar", `size-${size}`, className)}
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
      className={cx("image", className)}
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
      className={cx("fallback", className)}
      {...props}
    />
  );
}
