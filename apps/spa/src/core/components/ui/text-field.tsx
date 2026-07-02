"use client";
import type { TextFieldProps } from "react-aria-components/TextField";
import { TextField as TextFieldPrimitive } from "react-aria-components/TextField";

import { cx } from "@/core/utils/primitive";

import { fieldStyles } from "./field";

export const TextField = ({ className, ...props }: TextFieldProps) => (
  <TextFieldPrimitive
    data-slot="control"
    className={cx(fieldStyles(), className)}
    {...props}
  />
);
