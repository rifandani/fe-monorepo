"use client";
import { createContext, use } from "react";
import type {
  MeterProps as PrimitiveMeterProps,
  MeterRenderProps as PrimitiveMeterRenderProps,
} from "react-aria-components/Meter";
import { Meter as PrimitiveMeter } from "react-aria-components/Meter";
import { twMerge } from "tailwind-merge";

import { cx } from "@/core/utils/primitive";

interface MeterRenderProps extends PrimitiveMeterRenderProps {
  color?: string;
}
const MeterContext = createContext<MeterRenderProps | null>(null);
interface MeterProps
  extends PrimitiveMeterProps, Pick<MeterRenderProps, "color"> {}
export const Meter = ({ className, children, color, ...props }: MeterProps) => (
  <PrimitiveMeter
    data-slot="meter"
    {...props}
    className={cx(
      "w-full",
      "[&>[data-slot=meter-header]+[data-slot=meter-track]]:mt-2",
      "[&>[data-slot=meter-header]+[data-slot=meter-track]]:mt-2",
      "[&>[data-slot=meter-header]+[slot='description']]:mt-1",
      "[&>[slot='description']+[data-slot=meter-track]]:mt-2",
      "[&>[data-slot=meter-track]+[slot=description]]:mt-2",
      "[&>[data-slot=meter-track]+[slot=errorMessage]]:mt-2",
      "*:data-[slot=meter-header]:font-medium",
      className
    )}
  >
    {(values) => (
      <MeterContext value={{ ...values, color }}>
        {typeof children === "function" ? children(values) : children}
      </MeterContext>
    )}
  </PrimitiveMeter>
);
const getMeterColor = (value: number): string => {
  if (value < 50) {
    return "var(--color-success)";
  }
  if (value < 80) {
    return "var(--color-warning)";
  }
  return "var(--color-danger)";
};

export const MeterTrack = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const meterContext = use(MeterContext);
  if (!meterContext) {
    throw new Error("MeterTrack must be used within a Meter");
  }
  const { percentage, color } = meterContext;
  return (
    <div
      data-slot="meter-track"
      className={twMerge(
        "[--meter-height:--spacing(1.5)]",
        "relative h-(--meter-height) w-full overflow-hidden rounded-full bg-secondary outline -outline-offset-1 outline-transparent",
        className
      )}
      {...props}
    >
      <div
        data-slot="meter-fill"
        className="absolute start-0 top-0 h-full rounded-full transition-[width] duration-200 ease-linear will-change-[width] motion-reduce:transition-none forced-colors:bg-[Highlight]"
        style={{
          backgroundColor: color ?? getMeterColor(percentage),
          width: `${percentage}%`,
        }}
      />
    </div>
  );
};
export const MeterValue = ({
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children">) => {
  const meterContext = use(MeterContext);
  if (!meterContext) {
    throw new Error("MeterValue must be used within a Meter");
  }
  const { valueText } = meterContext;
  return (
    <span
      data-slot="meter-value"
      className={twMerge("text-base/6 sm:text-sm/6", className)}
      {...props}
    >
      {valueText}
    </span>
  );
};
export const MeterHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="meter-header"
    className={twMerge("flex items-center justify-between", className)}
    {...props}
  />
);
