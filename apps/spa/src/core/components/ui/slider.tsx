"use client";
import type { ComponentProps } from "react";
import type { SliderFillProps } from "react-aria-components/Slider";
import {
  Slider as PrimitiveSlider,
  SliderFill as PrimitiveSliderFill,
  SliderOutput as PrimitiveSliderOutput,
  SliderThumb as PrimitiveSliderThumb,
  SliderTrack as PrimitiveSliderTrack,
} from "react-aria-components/Slider";
import { twMerge } from "tailwind-merge";

import { cx } from "@/core/utils/primitive";

export const SliderGroup = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={twMerge(
      "flex items-center gap-x-3 *:data-[slot=icon]:size-5",
      className
    )}
    {...props}
  />
);
export const Slider = ({
  className,
  ...props
}: ComponentProps<typeof PrimitiveSlider>) => (
  <PrimitiveSlider
    data-slot="control"
    className={cx(
      "group relative flex touch-none select-none flex-col disabled:opacity-50",
      "orientation-horizontal:w-full orientation-horizontal:min-w-fit orientation-horizontal:gap-y-2",
      "orientation-vertical:h-full orientation-vertical:min-h-fit orientation-vertical:w-1.5 orientation-vertical:items-center orientation-vertical:gap-y-2",
      className
    )}
    {...props}
  />
);
export const SliderOutput = ({
  className,
  ...props
}: ComponentProps<typeof PrimitiveSliderOutput>) => (
  <PrimitiveSliderOutput
    className={cx("font-medium text-base/6 sm:text-sm/6", className)}
    {...props}
  />
);
export const SliderThumb = ({
  className,
  ...props
}: ComponentProps<typeof PrimitiveSliderThumb>) => (
  <PrimitiveSliderThumb
    className={cx(
      "top-[50%] left-[50%] size-5 rounded-full bg-white outline-hidden ring ring-muted-fg/30 transition-[width,height] dark:ring-white",
      className
    )}
    {...props}
  />
);
const SliderFill = ({ className, ...props }: SliderFillProps) => (
  <PrimitiveSliderFill
    className={cx(
      "pointer-events-none rounded-full bg-primary disabled:opacity-60",
      className
    )}
    {...props}
  />
);
export const SliderTrack = ({
  className,
  children,
  ...props
}: ComponentProps<typeof PrimitiveSliderTrack>) => (
  <PrimitiveSliderTrack
    className={cx(
      "bg-(--slider-track-bg,var(--color-secondary))",
      "group/track relative cursor-default rounded-full",
      "grow group-orientation-horizontal:h-1.5 group-orientation-horizontal:w-full group-orientation-vertical:w-1.5 group-orientation-vertical:flex-1",
      "disabled:cursor-default disabled:opacity-60",
      className
    )}
    {...props}
  >
    {(values) => (
      <>
        {typeof children === "function"
          ? children(values)
          : (children ?? (
              <>
                <SliderFill />
                <SliderThumb />
              </>
            ))}
      </>
    )}
  </PrimitiveSliderTrack>
);
