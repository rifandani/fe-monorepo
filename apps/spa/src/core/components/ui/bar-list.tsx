"use client";
import { useMemo } from "react";
import { Button } from "react-aria-components/Button";
import { twJoin, twMerge } from "tailwind-merge";

import { Link } from "./link";

type Bar<T> = T & {
  key?: string;
  href?: string;
  value: number;
  name: string;
};
interface BarListProps<T = unknown> extends React.ComponentProps<"div"> {
  data: Bar<T>[];
  valueFormatter?: (value: number) => string;
  onValueChange?: (payload: Bar<T>) => void;
  sortOrder?: "ascending" | "descending" | "none";
}
const EMPTY_BAR_DATA: Bar<unknown>[] = [];
const defaultBarValueFormatter = (value: number) => value.toString();

export const BarList = <T,>({
  data = EMPTY_BAR_DATA,
  valueFormatter = defaultBarValueFormatter,
  onValueChange,
  sortOrder = "descending",
  className,
  ref,
  ...props
}: BarListProps<T>) => {
  const Component = onValueChange ? Button : "div";
  const sortedData = useMemo(() => {
    if (sortOrder === "none") {
      return data;
    }
    return [...data].toSorted((a, b) =>
      sortOrder === "ascending" ? a.value - b.value : b.value - a.value
    );
  }, [data, sortOrder]);
  const widths = useMemo(() => {
    const maxValue = Math.max(...sortedData.map((item) => item.value), 0);
    return sortedData.map((item) =>
      item.value === 0 ? 0 : Math.max((item.value / maxValue) * 100, 2)
    );
  }, [sortedData]);
  const rowHeight = "h-8";
  return (
    <div
      ref={ref}
      className={twMerge("flex justify-between space-x-6", className)}
      {...props}
    >
      <div className="relative w-full space-y-1.5">
        {sortedData.map((item, index) => (
          <Component
            key={item.key ?? item.name}
            onClick={() => {
              onValueChange?.(item);
            }}
            className={twJoin(
              "group w-full rounded-sm",
              "focus:ring-2 focus:inset-ring focus:ring-ring/20 focus:inset-ring-ring focus:outline-hidden",
              onValueChange ? "m-0! cursor-pointer hover:bg-secondary" : ""
            )}
          >
            <div
              className={twJoin(
                "flex items-center rounded-sm bg-primary/30",
                rowHeight,
                onValueChange
                  ? "group-hover:bg-primary/40 dark:group-hover:bg-primary/40"
                  : "",
                index === sortedData.length - 1 && "mb-0"
              )}
              style={{ width: `${widths[index]}%` }}
            >
              <div className="absolute start-2 flex max-w-full pe-3 sm:pe-2">
                {item.href ? (
                  <Link
                    href={item.href}
                    className={twJoin(
                      "truncate rounded-sm text-base/6 font-normal whitespace-nowrap text-fg sm:text-sm/6",
                      "hover:underline hover:underline-offset-2",
                      "focus:ring-2 focus:inset-ring focus:ring-ring/20 focus:inset-ring-ring focus:outline-hidden"
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <p className="truncate text-base/6 whitespace-nowrap text-fg sm:text-sm/6">
                    {item.name}
                  </p>
                )}
              </div>
            </div>
          </Component>
        ))}
      </div>
      <div>
        {sortedData.map((item, index) => (
          <div
            key={item.key ?? item.name}
            className={twJoin(
              "flex items-center justify-end",
              rowHeight,
              index === sortedData.length - 1 ? "mb-0" : "mb-1.5"
            )}
          >
            <p className="truncate text-sm leading-none whitespace-nowrap text-fg">
              {valueFormatter(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
