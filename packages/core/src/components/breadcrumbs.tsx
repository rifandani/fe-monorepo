'use client'

import { Icon } from '@iconify/react'
import {
  Breadcrumb,
  type BreadcrumbProps,
  Breadcrumbs,
  type BreadcrumbsProps,
  Link,
  type LinkProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

function _Breadcrumbs<T extends object>({
  className,
  ...props
}: BreadcrumbsProps<T>) {
  return (
    <Breadcrumbs
      className={twMerge(
        'text-muted-foreground flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5',
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: BreadcrumbProps) {
  return (
    <Breadcrumb
      className={values =>
        twMerge(
          'inline-flex items-center gap-1.5 sm:gap-2.5',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

function BreadcrumbLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={values =>
        twMerge(
          'hover:text-foreground transition-colors data-[disabled]:pointer-events-none data-[current]:pointer-events-auto data-[current]:opacity-100 data-[disabled]:opacity-50',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden="true"
      className={twMerge('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children || <Icon icon="lucide:chevron-right" />}
    </span>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden="true"
      className={twMerge('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <Icon icon="lucide:more-horizontal" className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

interface BreadcrumbPageProps extends Omit<LinkProps, 'href'> {}

function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <Link
      className={values =>
        twMerge(
          'text-foreground font-normal',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

export {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  _Breadcrumbs as Breadcrumbs,
  BreadcrumbSeparator,
}
