"use client";
import type { LabelProps } from "react-aria-components/Label";
import { Label } from "react-aria-components/Label";
import type { ProgressBarProps } from "react-aria-components/ProgressBar";
import { ProgressBar } from "react-aria-components/ProgressBar";
import { twJoin, twMerge } from "tailwind-merge";

import { cx } from "@/core/utils/primitive";

export const Leaderboard = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={twMerge(
      "flex flex-col gap-y-(--leaderboard-gutter,--spacing(4))",
      className
    )}
    {...props}
  />
);
export const LeaderboardHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="leaderboard-header"
    className={twMerge(
      "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-(--gutter) has-data-[slot=card-action]:grid-cols-[1fr_auto]",
      className
    )}
    {...props}
  />
);
export const LeaderboardTitle = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="leaderboard-title"
    className={twMerge("text-base/6 font-semibold text-balance", className)}
    {...props}
  />
);
export const LeaderboardAction = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="leaderboard-action"
    className={twMerge(
      "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      className
    )}
    {...props}
  />
);
export const LeaderboardContent = ({
  className,
  ...props
}: React.ComponentProps<"ul">) => (
  <ul
    data-slot="leaderboard-content"
    className={twMerge("flex max-h-96 list-none flex-col gap-y-1", className)}
    {...props}
  />
);
interface LeaderboardItemProps extends ProgressBarProps {
  onAction?: () => void;
}
export const LeaderboardItem = ({
  minValue = 0,
  className,
  children,
  onAction,
  ...props
}: LeaderboardItemProps) => (
  <li className="group" data-slot="leaderboard-item">
    <ProgressBar
      onClick={onAction}
      minValue={minValue}
      className={cx(
        "relative cursor-default overflow-hidden rounded-md px-1.5 py-1 text-sm/6 outline-hidden focus-visible:ring focus-visible:ring-ring",
        "[&_svg:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {(values) => (
        <>
          <span className="relative z-2 flex items-center justify-between font-medium">
            {typeof children === "function" ? children(values) : children}
          </span>
          <span
            className={twJoin(
              "absolute inset-y-0 start-0 z-1 rounded-e-md bg-secondary/60",
              onAction ? "cursor-default group-hover:bg-secondary" : ""
            )}
            style={{ width: `${values.percentage}%` }}
          />
        </>
      )}
    </ProgressBar>
  </li>
);
export const LeaderboardStart = ({ className, ...props }: LabelProps) => (
  <Label
    data-slot="leaderboard-start"
    className={twMerge("flex items-center gap-x-2", className)}
    {...props}
  />
);
export const LeaderboardEnd = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="leaderboard-start"
    className={twMerge("tabular-nums", className)}
    {...props}
  />
);
