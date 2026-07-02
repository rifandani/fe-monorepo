"use client";
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import type { ButtonProps } from "react-aria-components/Button";
import { Button } from "react-aria-components/Button";
import type { InputProps as PrimitiveInputProps } from "react-aria-components/Input";
import type { NumberFieldProps } from "react-aria-components/NumberField";
import { NumberField as NumberFieldPrimitive } from "react-aria-components/NumberField";

import { Input, InputGroup } from "@/core/components/ui/input";
import { cx } from "@/core/utils/primitive";

import { fieldStyles } from "./field";

const NumberField = ({ className, ...props }: NumberFieldProps) => (
  <NumberFieldPrimitive
    {...props}
    data-slot="control"
    className={cx(fieldStyles(), className)}
  />
);
interface StepperButtonProps extends ButtonProps {
  slot: "increment" | "decrement";
  className?: string;
}
const StepperButton = ({ slot, className, ...props }: StepperButtonProps) => (
  <Button
    className={cx(
      "inline-grid place-content-center pressed:text-fg text-muted-fg enabled:hover:text-fg",
      "size-full min-w-11 grow bg-input/20 pressed:bg-input/60 sm:min-w-8.5",
      "*:data-[slot=stepper-icon]:size-5 sm:*:data-[slot=stepper-icon]:size-4",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    slot={slot}
    {...props}
  >
    {slot === "increment" ? (
      <PlusIcon data-slot="stepper-icon" />
    ) : (
      <MinusIcon data-slot="stepper-icon" />
    )}
  </Button>
);
interface InputProps extends PrimitiveInputProps {
  ref?: React.RefObject<HTMLInputElement>;
}
const NumberInput = ({ className, ...props }: InputProps) => (
  <InputGroup className="[--input-gutter-end:--spacing(20)]">
    <Input className={cx("tabular-nums", className)} {...props} />
    <div
      data-slot="text"
      className="pointer-events-auto end-0 p-px in-disabled:pointer-events-none in-disabled:opacity-50"
    >
      <div className="flex h-full items-center divide-x overflow-hidden rounded-e-[calc(var(--radius-lg)-1px)] border-s">
        <StepperButton slot="decrement" />
        <StepperButton slot="increment" />
      </div>
    </div>
  </InputGroup>
);
export type { NumberFieldProps };
export { NumberField, NumberInput };
