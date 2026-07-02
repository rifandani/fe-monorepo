"use client";
import type { SeparatorProps } from "react-aria-components/Separator";
import { Separator as Divider } from "react-aria-components/Separator";
import { twMerge } from "tailwind-merge";

export const Separator = ({
  orientation = "horizontal",
  className,
  ...props
}: SeparatorProps) => (
  <Divider
    className={twMerge(
      "shrink-0 border-0 bg-border forced-colors:bg-[ButtonBorder]",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    {...props}
  />
);
