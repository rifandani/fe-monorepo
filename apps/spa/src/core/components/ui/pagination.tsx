"use client";
import { twMerge } from "tailwind-merge";

import type { ButtonProps } from "@/core/components/ui/button";
import { buttonStyles } from "@/core/components/ui/button";
import type { LinkProps } from "@/core/components/ui/link";
import { Link } from "@/core/components/ui/link";

const Pagination = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"nav">) => (
  <nav
    data-slot="pagination"
    aria-label="pagination"
    className={twMerge(
      "mx-auto flex w-full items-center justify-center gap-(--pagination-gap) [--pagination-gap:--spacing(2)] [--section-radius:calc(var(--radius-lg)-1px)] **:data-[slot=control]:w-auto",
      "**:data-[slot=pagination-item]:cursor-default",
      className
    )}
    ref={ref}
    {...props}
  />
);
const PaginationSection = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"ul">) => (
  <li data-slot="pagination-section">
    <ul
      ref={ref}
      className={twMerge("flex h-full gap-1.5 text-sm/6", className)}
      {...props}
    />
  </li>
);
const PaginationList = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"ul">) => (
  <ul
    ref={ref}
    data-slot="pagination-list"
    aria-label={props["aria-label"] || "Pagination"}
    className={twMerge("flex gap-1.25", className)}
    {...props}
  />
);
interface PaginationItemProps
  extends
    Omit<LinkProps, "children">,
    Pick<ButtonProps, "isCircle" | "size" | "intent"> {
  className?: string;
  isCurrent?: boolean;
  children?: string | number;
}
const PaginationItem = ({
  className,
  size = "sm",
  isCircle,
  isCurrent,
  ...props
}: PaginationItemProps) => (
  <li>
    <Link
      data-slot="pagination-item"
      href={isCurrent ? undefined : props.href}
      aria-current={isCurrent ? "page" : undefined}
      className={buttonStyles({
        className: twMerge("touch-target min-w-9 shrink-0", className),
        intent: isCurrent ? "outline" : "plain",
        isCircle,
        size,
      })}
      {...props}
    />
  </li>
);
interface PaginationAttributesProps
  extends
    Omit<LinkProps, "className">,
    Pick<ButtonProps, "size" | "isCircle" | "intent"> {
  className?: string;
}
const PaginationFirst = ({
  className,
  children,
  size = "sq-sm",
  intent = "outline",
  isCircle = false,
  ...props
}: PaginationAttributesProps) => {
  const itemClassName = buttonStyles({
    className: twMerge("shrink-0", className),
    intent,
    isCircle,
    size: children ? "sm" : size,
  });
  const content = (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        fill="none"
        viewBox="0 0 25 24"
        aria-hidden="true"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="m17.5 18-6-6 6-6m-10 0v12"
        />
      </svg>
      {children}
    </>
  );
  return (
    <li>
      {props.href || props.onPress ? (
        <Link
          data-slot="pagination-item"
          aria-label="First page"
          className={itemClassName}
          {...props}
        >
          {content}
        </Link>
      ) : (
        <span data-slot="pagination-item" className={itemClassName}>
          {content}
        </span>
      )}
    </li>
  );
};
const PaginationPrevious = ({
  className,
  children,
  size = "sq-sm",
  intent = "outline",
  isCircle = false,
  ...props
}: PaginationAttributesProps) => {
  const itemClassName = buttonStyles({
    className: twMerge("shrink-0", className),
    intent,
    isCircle,
    size: children ? "sm" : size,
  });
  const content = (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        data-slot="icon"
      >
        <path
          fillRule="evenodd"
          d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </>
  );
  return (
    <li>
      {props.href || props.onPress ? (
        <Link
          data-slot="pagination-item"
          aria-label="Previous page"
          className={itemClassName}
          {...props}
        >
          {content}
        </Link>
      ) : (
        <span data-slot="pagination-item" className={itemClassName}>
          {content}
        </span>
      )}
    </li>
  );
};
const PaginationNext = ({
  className,
  children,
  size = "sq-sm",
  intent = "outline",
  isCircle = false,
  ...props
}: PaginationAttributesProps) => {
  const itemClassName = buttonStyles({
    className: twMerge("shrink-0", className),
    intent,
    isCircle,
    size: children ? "sm" : size,
  });
  const content = (
    <>
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </>
  );
  return (
    <li>
      {props.href || props.onPress ? (
        <Link
          data-slot="pagination-item"
          aria-label="Next page"
          className={itemClassName}
          {...props}
        >
          {content}
        </Link>
      ) : (
        <span data-slot="pagination-item" className={itemClassName}>
          {content}
        </span>
      )}
    </li>
  );
};
const PaginationLast = ({
  className,
  children,
  size = "sq-sm",
  intent = "outline",
  isCircle = false,
  ...props
}: PaginationAttributesProps) => {
  const itemClassName = buttonStyles({
    className: twMerge("shrink-0", className),
    intent,
    isCircle,
    size: children ? "sm" : size,
  });
  const content = (
    <>
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        fill="none"
        viewBox="0 0 25 24"
        className="intentui-icons size-4"
        aria-hidden="true"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="m7.5 18 6-6-6-6m10 0v12"
        />
      </svg>
    </>
  );
  return (
    <li>
      {props.href || props.onPress ? (
        <Link
          data-slot="pagination-item"
          aria-label="Last page"
          className={itemClassName}
          {...props}
        >
          {content}
        </Link>
      ) : (
        <span data-slot="pagination-item" className={itemClassName}>
          {content}
        </span>
      )}
    </li>
  );
};
const PaginationSpacer = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    aria-hidden
    ref={ref}
    className={twMerge("flex-1", className)}
    {...props}
  />
);
const PAGINATION_GAP_LABEL = <>&hellip;</>;

const PaginationGap = ({
  className,
  children = PAGINATION_GAP_LABEL,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    data-slot="pagination-gap"
    className={twMerge(
      "w-9 text-center text-sm/6 font-semibold text-fg outline-hidden select-none",
      className
    )}
    {...props}
    aria-hidden
  >
    {children}
  </li>
);
const PaginationLabel = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    ref={ref}
    data-slot="pagination-label"
    className={twMerge(
      "min-w-4 self-center text-fg *:[strong]:font-medium *:[strong]:text-fg",
      className
    )}
    {...props}
  />
);
const PaginationInfo = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p
    className={twMerge(
      "text-sm/6 text-muted-fg *:[strong]:font-medium *:[strong]:text-fg",
      className
    )}
    {...props}
  />
);
export {
  Pagination,
  PaginationFirst,
  PaginationGap,
  PaginationInfo,
  PaginationItem,
  PaginationLabel,
  PaginationLast,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationSection,
  PaginationSpacer,
};
