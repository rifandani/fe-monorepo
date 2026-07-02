"use client";
import { MinusIcon } from "@heroicons/react/20/solid";
import { OTPInput, OTPInputContext } from "input-otp";
import { use } from "react";
import { twMerge } from "tailwind-merge";

import { fieldStyles, Label } from "@/core/components/ui/field";

export const InputOTP = ({
  containerClassName,
  ...props
}: React.ComponentPropsWithoutRef<typeof OTPInput>) => (
  <span data-slot="control" className="relative block">
    <OTPInput
      data-slot="input-otp"
      containerClassName={twMerge(
        fieldStyles({ className: "has-[:disabled]:opacity-50" }),
        containerClassName
      )}
      {...props}
    />
  </span>
);
export const InputOTPControl = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    data-slot="control"
    className={twMerge(
      "flex items-center gap-2 has-disabled:opacity-50",
      className
    )}
    {...props}
  />
);
export const InputOTPGroup = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="input-otp-group"
    className={twMerge("flex items-center", className)}
    {...props}
  />
);
export const InputOTPSlot = ({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) => {
  const inputOTPContext = use(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};
  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={twMerge(
        "relative flex size-9 items-center justify-center border-y border-r border-input shadow-xs transition-all outline-none [--input-otp-radius:calc(var(--radius-lg)-1px)] first:rounded-s-(--input-otp-radius) first:border-l last:rounded-e-(--input-otp-radius) aria-invalid:border-danger data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:bg-primary-subtle/10 data-[active=true]:ring-3 data-[active=true]:ring-ring/20 data-[active=true]:aria-invalid:border-danger-subtle-fg/70 data-[active=true]:aria-invalid:ring-danger-subtle-fg/20 sm:text-sm/6 dark:data-[active=true]:aria-invalid:ring-danger-subtle-fg/70",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-fg duration-1000" />
        </div>
      )}
    </div>
  );
};
export const InputOTPSeparator = ({
  ...props
}: React.ComponentProps<"div">) => (
  <div data-slot="input-otp-separator" {...props}>
    <MinusIcon className="size-4" />
  </div>
);
export const InputOTPLabel = (props: React.ComponentProps<typeof Label>) => (
  <Label elementType="span" data-slot="control-label" {...props} />
);
