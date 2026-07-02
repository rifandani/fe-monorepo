"use client";
import { createContext, use } from "react";
import type {
  GridListItemProps,
  GridListProps,
  TextProps,
} from "react-aria-components";
import {
  composeRenderProps,
  GridList,
  GridListItem,
  Text,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

import { cx } from "@/core/utils/primitive";

import { Checkbox, CheckboxField } from "./checkbox";

const choiceBoxStyles = tv({
  base: "grid [--gutter:--spacing(4)]",
  compoundVariants: [
    {
      className:
        "rounded-lg *:data-[slot=choice-box-item]:inset-ring *:data-[slot=choice-box-item]:-mt-px *:data-[slot=choice-box-item]:rounded-none *:data-[slot=choice-box-item]:last:rounded-b-[calc(var(--radius-lg)-1px)] *:data-[slot=choice-box-item]:first:rounded-t-[calc(var(--radius-lg)-1px)]",
      columns: 1,
      gap: 0,
    },
  ],
  defaultVariants: {
    columns: 1,
    gap: 0,
  },
  variants: {
    columns: {
      1: "col-span-full grid-cols-[auto_1fr]",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-4",
      5: "sm:grid-cols-5",
      6: "sm:grid-cols-6",
    },
    gap: {
      0: "gap-0",
      1: "gap-1",
      10: "gap-10",
      12: "gap-12",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
      6: "gap-6",
      8: "gap-8",
    },
  },
});
const ChoiceBoxContext = createContext<{
  columns?: number;
  gap?: number;
  isReadOnly?: boolean;
}>({});
const useChoiceBoxContext = () => use(ChoiceBoxContext);
interface ChoiceBoxProps<T extends object>
  extends GridListProps<T>, VariantProps<typeof choiceBoxStyles> {
  isReadOnly?: boolean;
}
const ChoiceBox = <T extends object>({
  columns = 1,
  gap = 0,
  className,
  selectionMode = "single",
  isReadOnly,
  ...props
}: ChoiceBoxProps<T>) => (
  <ChoiceBoxContext value={{ columns, gap, isReadOnly }}>
    <GridList
      data-slot="choice-box"
      layout={columns === 1 ? "stack" : "grid"}
      selectionMode={selectionMode}
      className={cx(
        choiceBoxStyles({
          columns,
          gap,
        }),
        className
      )}
      {...props}
    />
  </ChoiceBoxContext>
);
const choiceBoxItemStyles = tv({
  base: [
    "group outline-hidden",
    "[--choice-box-fg:var(--color-primary-subtle-fg)] [--choice-box:var(--color-primary-subtle)]",
    "[--choice-box-selected-hovered:var(--color-primary-subtle)]/90",
    "rounded-lg p-(--gutter) inset-ring inset-ring-border **:data-[slot=label]:font-medium",
    "**:data-[slot=avatar]:row-span-2 **:data-[slot=avatar]:mt-0.5 **:data-[slot=avatar]:shrink-0",
    "**:[svg]:row-span-2 **:[svg]:h-[1.1lh] **:[svg]:w-5 **:[svg]:shrink-0",
    "has-data-[slot=avatar]:grid-cols-[auto_1fr_auto] has-[svg:not([data-slot=check-indicator])]:grid-cols-[auto_1fr_auto]",
    "grid grid-cols-[1fr_auto] content-start items-start gap-x-[calc(var(--gutter)-(--spacing(1)))] gap-y-1",
    "[--choice-box-active-ring:var(--color-ring)]/70 [--choice-box-ring:var(--color-ring)]/20",
    "has-[[slot=description]]:**:data-[slot=label]:font-medium",
  ],
  variants: {
    isActive: {
      true: [
        "bg-(--choice-box) text-(--choice-box-fg)",
        "z-20 inset-ring-(--choice-box-active-ring) hover:bg-(--choice-box-selected-hovered)",
        "**:data-[slot=label]:text-(--choice-box-fg)",
        "**:[[slot=description]]:text-(--choice-box-fg)",
      ],
    },
    isDisabled: {
      true: "z-10 opacity-50 **:data-[slot=label]:text-muted-fg forced-colors:text-[GrayText] **:[[slot=description]]:text-muted-fg/70",
    },
    isFocused: {
      true: "ring-3 ring-(--choice-box-ring) inset-ring-(--choice-box-active-ring) invalid:ring-danger-subtle-fg/20",
    },
    isHovered: {
      true: "not-data-readonly:not-data-focus-visible:not-selected:inset-ring-muted-fg/30",
    },
    isInvalid: { true: "ring-3 ring-danger-subtle-fg/20" },
    isLink: {
      false: "cursor-default",
      true: "cursor-pointer",
    },
    isOneColumn: {
      true: "col-span-full",
    },
  },
});
interface ChoiceBoxLabelProps extends TextProps {
  ref?: React.Ref<HTMLDivElement>;
}
const ChoiceBoxLabel = ({ className, ref, ...props }: ChoiceBoxLabelProps) => (
  <Text
    data-slot="label"
    ref={ref}
    className={twMerge(
      "text-base/6 text-fg select-none group-disabled:opacity-50 sm:text-sm/6",
      "col-start-1 row-start-1",
      "group-has-[svg:not([data-slot=check-indicator])]:col-start-2",
      "group-has-data-[slot=avatar]:col-start-2",
      className
    )}
    {...props}
  />
);
type ChoiceBoxDescriptionProps = ChoiceBoxLabelProps;
const ChoiceBoxDescription = ({
  className,
  ref,
  ...props
}: ChoiceBoxDescriptionProps) => (
  <Text
    slot="description"
    ref={ref}
    className={twMerge(
      "col-start-1 row-start-2",
      "group-has-[svg:not([data-slot=check-indicator])]:col-start-2",
      "group-has-data-[slot=avatar]:col-start-2",
      "text-base/6 text-muted-fg sm:text-sm/6",
      "group-disabled:opacity-50",
      className
    )}
    {...props}
  />
);
const getChoiceBoxItemContent = (
  resolvedChildren: React.ReactNode,
  label: string | undefined,
  description: string | undefined
) => {
  if (resolvedChildren !== undefined) {
    if (typeof resolvedChildren === "string") {
      return <ChoiceBoxLabel>{resolvedChildren}</ChoiceBoxLabel>;
    }
    return resolvedChildren;
  }
  return (
    <>
      {label ? <ChoiceBoxLabel>{label}</ChoiceBoxLabel> : null}
      {description ? (
        <ChoiceBoxDescription>{description}</ChoiceBoxDescription>
      ) : null}
    </>
  );
};
interface ChoiceBoxItemProps
  extends GridListItemProps, VariantProps<typeof choiceBoxItemStyles> {
  label?: string;
  description?: string;
}
const ChoiceBoxItem = ({
  className,
  label,
  description,
  children,
  ...props
}: ChoiceBoxItemProps) => {
  const textValue = typeof children === "string" ? children : undefined;
  const { columns, isReadOnly } = useChoiceBoxContext();
  return (
    <GridListItem
      textValue={textValue}
      data-readonly={isReadOnly}
      data-slot="choice-box-item"
      {...props}
      className={composeRenderProps(
        className,
        (resolvedClassName, { isFocusVisible, isSelected, ...renderProps }) =>
          choiceBoxItemStyles({
            ...renderProps,
            className: resolvedClassName,
            isActive: (!isReadOnly && isSelected) || isFocusVisible,
            isFocused: !isReadOnly && renderProps.isFocused,
            isLink: "href" in props,
            isOneColumn: columns === 1,
          })
      )}
    >
      {composeRenderProps(children, (resolvedChildren, { selectionMode }) => {
        const content = getChoiceBoxItemContent(
          resolvedChildren,
          label,
          description
        );
        return (
          <>
            {content}
            {selectionMode === "multiple" && (
              <CheckboxField
                slot="selection"
                className="col-start-2 gap-x-0 self-start group-has-data-[slot=avatar]:col-start-3 group-has-[svg:not([data-slot=check-indicator])]:col-start-3"
              >
                <Checkbox className="col-span-1" />
              </CheckboxField>
            )}
          </>
        );
      })}
    </GridListItem>
  );
};
export type { ChoiceBoxItemProps, ChoiceBoxProps };
export { ChoiceBox, ChoiceBoxDescription, ChoiceBoxItem, ChoiceBoxLabel };
