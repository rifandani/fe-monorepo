"use client";
import type { ColorFieldProps } from "react-aria-components/ColorField";
import { ColorField as ColorFieldPrimitive } from "react-aria-components/ColorField";

import { cx } from "@/core/utils/primitive";

import { fieldStyles } from "./field";

export const ColorField = ({ className, ...props }: ColorFieldProps) => (
  <ColorFieldPrimitive
    {...props}
    data-slot="control"
    className={cx(fieldStyles(), className)}
  />
);
