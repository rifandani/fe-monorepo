"use client";
import type { FieldErrorProps } from "react-aria-components/FieldError";
import { FieldError as FieldErrorPrimitive } from "react-aria-components/FieldError";
import type { LabelProps } from "react-aria-components/Label";
import { Label as LabelPrimitive } from "react-aria-components/Label";
import type { TextProps } from "react-aria-components/Text";
import { Text } from "react-aria-components/Text";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

import { cx } from "@/core/utils/primitive";

export const labelStyles = tv({
  base: [
    "text-base/6 text-fg select-none in-data-required:not-data-[slot='control-label']:after:ml-1.5 sm:text-sm/6",
    "in-data-required:not-data-[slot='control-label']:after:text-danger-subtle-fg in-data-required:not-data-[slot='control-label']:after:content-['*']",
    "group-disabled:opacity-50 in-disabled:pointer-events-none in-disabled:opacity-50",
  ],
});
export const descriptionStyles = tv({
  base: "block text-sm/6 text-muted-fg group-disabled:opacity-50 in-disabled:opacity-50",
});
export const fieldErrorStyles = tv({
  base: "block text-sm/6 text-danger-subtle-fg group-disabled:opacity-50 in-disabled:opacity-50 forced-colors:text-[Mark]",
});
export const fieldStyles = tv({
  base: [
    "w-full",
    "[&>[data-slot=control]+[data-slot=control]]:mt-2",
    "[&>[data-slot=label]+[data-slot=control]]:mt-2",
    "[&>[data-slot=label]+[slot='description']]:mt-1",
    "[&>[slot=description]+[data-slot=control]]:mt-2",
    "[&>[data-slot=control]+[slot=description]]:mt-2",
    "[&>[data-slot=control]+[slot=errorMessage]]:mt-2",
    "*:data-[slot=label]:font-medium",
    "disabled:opacity-50 in-disabled:opacity-50",
  ],
});
export const Label = ({ className, ...props }: LabelProps) => (
  <LabelPrimitive
    data-slot="label"
    {...props}
    className={labelStyles({ className })}
  />
);
export const Description = ({ className, ...props }: TextProps) => (
  <Text
    {...props}
    slot="description"
    className={descriptionStyles({ className })}
  />
);
export const Fieldset = ({
  className,
  ...props
}: React.ComponentProps<"fieldset">) => (
  <fieldset
    className={twMerge(
      "*:data-[slot=text]:mt-1 [&>*+[data-slot=control]]:mt-6",
      className
    )}
    {...props}
  />
);
export const FieldGroup = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => (
  <div
    data-slot="control"
    className={twMerge("space-y-6", className)}
    {...props}
  />
);
export const FieldError = ({ className, ...props }: FieldErrorProps) => (
  <FieldErrorPrimitive
    {...props}
    className={cx(fieldErrorStyles(), className)}
  />
);
export const Legend = ({
  className,
  ...props
}: React.ComponentProps<"legend">) => (
  <legend
    data-slot="legend"
    {...props}
    className={twMerge(
      "text-base/6 font-semibold data-disabled:opacity-50",
      className
    )}
  />
);
