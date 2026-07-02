"use client";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { createContext, use } from "react";
import type {
  BreadcrumbProps,
  BreadcrumbsProps,
} from "react-aria-components/Breadcrumbs";
import {
  Breadcrumb,
  Breadcrumbs as BreadcrumbsPrimitive,
} from "react-aria-components/Breadcrumbs";
import type { LinkProps } from "react-aria-components/Link";
import { twJoin, twMerge } from "tailwind-merge";

import { cx } from "@/core/utils/primitive";

import { Link } from "./link";

interface BreadcrumbsContextProps {
  separator?: "chevron" | "slash" | boolean;
}
const BreadcrumbsProvider = createContext<BreadcrumbsContextProps>({
  separator: "chevron",
});
const Breadcrumbs = <T extends object>({
  className,
  ...props
}: BreadcrumbsProps<T> & BreadcrumbsContextProps) => (
  <BreadcrumbsProvider value={{ separator: props.separator }}>
    <BreadcrumbsPrimitive
      {...props}
      className={twMerge("flex items-center gap-2", className)}
    />
  </BreadcrumbsProvider>
);
const Separator = ({
  separator = "chevron",
}: {
  separator?: BreadcrumbsItemProps["separator"];
}) => (
  <span className="*:shrink-0 *:text-muted-fg *:data-[slot=icon]:size-3.5">
    {separator === "chevron" && <ChevronRightIcon />}
    {separator === "slash" && <span className="text-muted-fg">/</span>}
  </span>
);
interface BreadcrumbsItemProps
  extends BreadcrumbProps, BreadcrumbsContextProps {}
const BreadcrumbsItem = ({
  separator = true,
  className,
  ...props
}: BreadcrumbsItemProps & Partial<Omit<LinkProps, "className">>) => {
  const { separator: contextSeparator } = use(BreadcrumbsProvider);
  const resolvedSeparator = contextSeparator ?? separator;
  const separatorValue =
    resolvedSeparator === true ? "chevron" : resolvedSeparator;
  return (
    <Breadcrumb
      className={cx("flex items-center gap-2 text-sm", className)}
      data-slot="breadcrumb-item"
      {...props}
    >
      {({ isCurrent }) => (
        <>
          <Link
            className={twJoin(
              "has-data-[slot=icon]:inline-flex has-data-[slot=icon]:items-center has-data-[slot=icon]:gap-x-2",
              "*:data-[slot=icon]:size-5 sm:*:data-[slot=icon]:size-4",
              "*:data-[slot=icon]:text-muted-fg hover:*:data-[slot=icon]:text-fg"
            )}
            {...props}
          />
          {!isCurrent && resolvedSeparator !== false && (
            <Separator separator={separatorValue} />
          )}
        </>
      )}
    </Breadcrumb>
  );
};
export type { BreadcrumbsItemProps, BreadcrumbsProps };
export { Breadcrumbs, BreadcrumbsItem };
