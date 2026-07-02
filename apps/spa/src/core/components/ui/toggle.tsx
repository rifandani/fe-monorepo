"use client";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import type { ToggleButtonProps } from "react-aria-components/ToggleButton";
import { ToggleButton } from "react-aria-components/ToggleButton";
import { twMerge } from "tailwind-merge";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const toggleStyles = tv({
  base: [
    "[--toggle-icon-active:var(--secondary-fg)] [--toggle-icon:color-mix(in_oklab,var(--secondary-fg)_50%,var(--secondary))]",
    "relative isolate inline-flex items-center justify-center border font-medium",
    "focus-visible:ring-2 focus-visible:ring-offset-3 focus-visible:ring-offset-bg focus-visible:outline focus-visible:outline-offset-2",
    "*:[svg]:-mx-0.5 *:[svg]:my-0.5 *:[svg]:shrink-0 *:[svg]:self-center *:[svg]:text-(--toggle-icon) sm:*:[svg]:my-1",
    "focus-visible:*:[svg]:text-(--toggle-icon-active)",
    "selected:*:[svg]:text-(--toggle-icon-active)",
    "hover:*:[svg]:text-(--toggle-icon-active)",
    "forced-colors:[--toggle-icon:ButtonText] forced-colors:hover:[--toggle-icon:ButtonText] *:[svg]:-mx-0.5 *:[svg]:shrink-0 *:[svg]:self-center *:[svg]:text-(--toggle-icon) hover:*:[svg]:text-(--toggle-icon-active)/90 focus-visible:*:[svg]:text-(--toggle-icon-active)/80 pressed:*:[svg]:text-(--toggle-icon-active)",
    "forced-colors:[--toggle-icon:ButtonText] forced-colors:hover:[--toggle-icon:ButtonText]",
  ],
  defaultVariants: {
    intent: "plain",
    isCircle: false,
    size: "md",
  },
  variants: {
    intent: {
      outline: [
        "bg-transparent ring-secondary-fg/25 outline-secondary-fg hover:bg-secondary selected:bg-secondary",
      ],
      plain: [
        "border-transparent bg-transparent ring-secondary-fg/25 outline-secondary-fg hover:bg-secondary selected:bg-secondary",
      ],
    },
    isCircle: {
      false: "rounded-[calc(var(--radius-lg)-1px)]",
      true: "rounded-full",
    },
    isDisabled: {
      true: "border-0 opacity-50 forced-colors:text-[GrayText]",
    },
    size: {
      lg: [
        "min-h-10 gap-x-2 px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(3)-1px)] sm:min-h-9 sm:px-3 sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/7",
        "*:[svg]:size-5 sm:*:[svg]:size-4.5",
      ],
      md: [
        "min-h-10 gap-x-2 px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:min-h-9 sm:px-3 sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6",
        "*:[svg]:size-5 sm:*:[svg]:size-4",
      ],
      sm: [
        "min-h-9 gap-x-1.5 px-3 py-[calc(--spacing(2)-1px)] sm:min-h-8 sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/5",
        "*:[svg]:size-4.5 sm:*:[svg]:size-4",
      ],
      "sq-lg": [
        "touch-target size-12 shrink-0 sm:size-10",
        "*:[svg]:size-6 sm:*:[svg]:size-5",
      ],
      "sq-md": [
        "touch-target size-11 shrink-0 sm:size-9",
        "*:[svg]:size-5 sm:*:[svg]:size-4.5",
      ],
      "sq-sm": [
        "touch-target size-10 shrink-0 sm:size-8",
        "*:[svg]:size-4.5 sm:*:[svg]:size-4",
      ],
      "sq-xs": [
        "touch-target size-8 shrink-0 sm:size-7",
        "*:[svg]:size-3.5 sm:*:[svg]:size-3",
      ],
      xs: [
        "min-h-8 gap-x-1.5 px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] text-sm sm:min-h-7 sm:px-2 sm:py-[calc(--spacing(1.5)-1px)] sm:text-xs/4",
        "*:[svg]:-mx-px *:[svg]:size-3.5 sm:*:[svg]:size-3",
      ],
    },
  },
});
export interface ToggleProps
  extends ToggleButtonProps, VariantProps<typeof toggleStyles> {
  ref?: React.Ref<HTMLButtonElement>;
}
export const Toggle = ({
  className,
  size,
  intent,
  isCircle,
  ref,
  ...props
}: ToggleProps) => (
  <ToggleButton
    ref={ref}
    className={composeRenderProps(className, (renderClassName, renderProps) =>
      twMerge(
        toggleStyles({
          ...renderProps,
          className: renderClassName,
          intent,
          isCircle,
          size,
        })
      )
    )}
    {...props}
  />
);
