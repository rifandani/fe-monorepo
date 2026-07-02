"use client";
import type { ColorAreaProps } from "react-aria-components/ColorArea";
import { ColorArea as ColorAreaPrimitive } from "react-aria-components/ColorArea";

import { cx } from "@/core/utils/primitive";

import { ColorThumb } from "./color-thumb";

export const ColorArea = ({ className, ...props }: ColorAreaProps) => (
  <ColorAreaPrimitive
    {...props}
    data-slot="color-area"
    className={cx(
      "size-56 shrink-0 rounded-md bg-muted disabled:bg-muted-fg forced-colors:bg-[GrayText]",
      className
    )}
    style={({ defaultStyle, isDisabled }) => ({
      ...defaultStyle,
      background: isDisabled ? undefined : defaultStyle.background,
    })}
  >
    <ColorThumb />
  </ColorAreaPrimitive>
);
