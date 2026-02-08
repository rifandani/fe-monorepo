import { Link } from './link'
import { cx } from '@/core/utils/primitive'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { createContext, use } from 'react'
import type { BreadcrumbProps, BreadcrumbsProps, LinkProps } from 'react-aria-components'
import { Breadcrumb, Breadcrumbs as BreadcrumbsPrimitive } from 'react-aria-components'
import { twJoin, twMerge } from 'tailwind-merge'

interface BreadcrumbsContextProps { separator?: 'chevron' | 'slash' | boolean }
const BreadcrumbsProvider = createContext<BreadcrumbsContextProps>({
  separator: 'chevron',
})

function Breadcrumbs<T extends object>({
  className,
  ...props
}: BreadcrumbsProps<T> & BreadcrumbsContextProps) {
  return (
    <BreadcrumbsProvider value={{ separator: props.separator }}>
      <BreadcrumbsPrimitive {...props} className={twMerge('flex items-center gap-2', className)} />
    </BreadcrumbsProvider>
  )
}

interface BreadcrumbsItemProps extends BreadcrumbProps, BreadcrumbsContextProps {
  href?: string
}

function BreadcrumbsItem({
  href,
  separator = true,
  className,
  ...props
}: BreadcrumbsItemProps & Partial<Omit<LinkProps, 'className'>>) {
  const { separator: contextSeparator } = use(BreadcrumbsProvider)
  separator = contextSeparator ?? separator
  const separatorValue = separator === true ? 'chevron' : separator

  return (
    <Breadcrumb
      className={cx('flex items-center gap-2 text-sm', className)}
      data-slot="breadcrumb-item"
      {...props}
    >
      {({ isCurrent }) => (
        <>
          <Link
            className={twJoin(
              'has-data-[slot=icon]:inline-flex has-data-[slot=icon]:items-center has-data-[slot=icon]:gap-x-2',
              '*:data-[slot=icon]:size-5 sm:*:data-[slot=icon]:size-4',
              '*:data-[slot=icon]:text-muted-fg hover:*:data-[slot=icon]:text-fg',
            )}
            href={href}
            {...props}
          />
          {!isCurrent && separator !== false && <Separator separator={separatorValue} />}
        </>
      )}
    </Breadcrumb>
  )
}

function Separator({
  separator = 'chevron',
}: {
  separator?: BreadcrumbsItemProps['separator']
}) {
  return (
    <span className="*:shrink-0 *:text-muted-fg *:data-[slot=icon]:size-3.5">
      {separator === 'chevron' && <ChevronRightIcon />}
      {separator === 'slash' && <span className="text-muted-fg">/</span>}
    </span>
  )
}

Breadcrumbs.Item = BreadcrumbsItem

export type { BreadcrumbsItemProps, BreadcrumbsProps }
export { Breadcrumbs, BreadcrumbsItem }
