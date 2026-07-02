"use client";
import type { ColorSwatchProps } from "react-aria-components/ColorSwatch";
import { ColorSwatch as ColorSwatchPrimitive } from "react-aria-components/ColorSwatch";

import { cx } from "@/core/utils/primitive";

export const ColorSwatch = ({ className, ...props }: ColorSwatchProps) => (
  <ColorSwatchPrimitive
    data-slot="color-swatch"
    className={cx(
      "inset-ring-1 inset-ring-current/20 size-(--size) shrink-0 rounded-[calc(var(--radius-md)-1px)] [--size:--spacing(8)]",
      className
    )}
    {...props}
  />
);
