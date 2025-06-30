'use client'

import type { LinkProps } from 'react-aria-components'
import { IconHamburger } from '@intentui/icons'
import { useMediaQuery } from '@workspace/core/hooks/use-media-query'
import { createContext, use, useCallback, useMemo, useState } from 'react'
import { Link } from 'react-aria-components'
import { twJoin, twMerge } from 'tailwind-merge'
import { Button, type ButtonProps } from '@/core/components/ui/button'
import { composeTailwindRenderProps } from '@/core/components/ui/primitive'
import { Separator } from '@/core/components/ui/separator'
import { Sheet } from '@/core/components/ui/sheet'

interface NavbarContextProps {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
  toggleNavbar: () => void
}

const NavbarContext = createContext<NavbarContextProps | null>(null)

function useNavbar() {
  const context = use(NavbarContext)
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider.')
  }

  return context
}

interface NavbarProviderProps extends React.ComponentProps<'div'> {
  defaultOpen?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function NavbarProvider({
  isOpen: openProp,
  onOpenChange: setOpenProp,
  defaultOpen = false,
  className,
  ...props
}: NavbarProviderProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [openInternal, setOpenInternal] = useState(defaultOpen)
  const open = openProp ?? openInternal

  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      if (setOpenProp) {
        return setOpenProp?.(typeof value === 'function' ? value(open) : value)
      }

      setOpenInternal(value)
    },
    [setOpenProp, open],
  )

  const toggleNavbar = useCallback(() => {
    setOpen(open => !open)
  }, [setOpen])

  const contextValue = useMemo<NavbarContextProps>(
    () => ({
      open,
      setOpen,
      isMobile,
      toggleNavbar,
    }),
    [open, setOpen, isMobile, toggleNavbar],
  )
  return (
    <NavbarContext value={contextValue}>
      <div
        className={twMerge(
          'peer/navbar group/navbar relative isolate z-10 flex w-full flex-col',
          `
            has-data-navbar-inset:min-h-svh has-data-navbar-inset:bg-navbar
            dark:has-data-navbar-inset:bg-bg
          `,
          className,
        )}
        {...props}
      />
    </NavbarContext>
  )
}

interface NavbarProps extends React.ComponentProps<'div'> {
  intent?: 'default' | 'float' | 'inset'
  isSticky?: boolean
  side?: 'left' | 'right'
}

function Navbar({
  children,
  isSticky,
  intent = 'default',
  side = 'left',
  className,
  ref,
  ...props
}: NavbarProps) {
  const { isMobile, open, setOpen } = useNavbar()
  if (isMobile) {
    return (
      <>
        <span className="sr-only" aria-hidden data-navbar={intent} data-navbar-sticky={isSticky} />
        <Sheet isOpen={open} onOpenChange={setOpen} {...props}>
          <Sheet.Content
            side={side}
            aria-label="Mobile Navbar"
            className="[&>button]:hidden"
          >
            <Sheet.Body className="p-[calc(var(--gutter)---spacing(2))]">{children}</Sheet.Body>
          </Sheet.Content>
        </Sheet>
      </>
    )
  }

  return (
    <div
      data-navbar={intent}
      ref={ref}
      data-navbar-sticky={isSticky}
      className={twMerge([
        'group/navbar-intent relative isolate',
        isSticky && 'sticky top-0 z-40',
        intent === 'float' && 'md:px-22 md:pt-10',
      ])}
      {...props}
    >
      <div
        className={twMerge(
          `
            relative isolate hidden
            md:block
          `,
          intent === 'float'
          && `
            *:data-[navbar=content]:max-w-7xl *:data-[navbar=content]:rounded-xl
            *:data-[navbar=content]:border *:data-[navbar=content]:bg-navbar
            *:data-[navbar=content]:px-4 *:data-[navbar=content]:shadow-xs
          `,
          ['default', 'inset'].includes(intent) && 'px-6',
          intent === 'default' && 'border-b bg-navbar',
          className,
        )}
      >
        <div
          data-navbar="content"
          className={`
            mx-auto w-full max-w-(--breakpoint-2xl) items-center py-2.5
            md:flex
          `}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function NavbarSection({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="navbar-section"
      className={twMerge(
        `
          col-span-full grid grid-cols-[auto_1fr] flex-col gap-3 gap-y-0.5
          md:flex md:flex-none md:grid-cols-none md:flex-row md:items-center
          md:gap-2.5
        `,
        className,
      )}
      {...props}
    >
      {props.children}
    </div>
  )
}

interface NavbarItemProps extends LinkProps {
  isCurrent?: boolean
}

function NavbarItem({ className, isCurrent, ...props }: NavbarItemProps) {
  return (
    <Link
      data-slot="navbar-item"
      aria-current={isCurrent ? 'page' : undefined}
      className={composeTailwindRenderProps(className, [
        'href' in props ? 'cursor-pointer' : 'cursor-default',
        'group/sidebar-item hover:bg-secondary',
        'aria-[current=page]:text-fg aria-[current=page]*:data-[slot=icon]:text-fg',
        'col-span-full grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] supports-[grid-template-columns:subgrid]:grid-cols-subgrid md:supports-[grid-template-columns:subgrid]:grid-cols-none',
        'relative min-w-0 items-center gap-x-3 rounded-lg p-2 text-left font-medium text-base/6 sm:text-sm/5 md:gap-x-2.5',
        '*:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:text-muted-fg sm:*:data-[slot=icon]:size-4',
        '*:data-[slot=loader]:size-5 *:data-[slot=loader]:shrink-0 sm:*:data-[slot=loader]:size-4',
        '*:not-nth-2:last:data-[slot=icon]:row-start-1 *:not-nth-2:last:data-[slot=icon]:ml-auto *:not-nth-2:last:data-[slot=icon]:size-5 sm:*:not-nth-2:last:data-[slot=icon]:size-4',
        '*:data-[slot=avatar]:-m-0.5 *:data-[slot=avatar]:size-6 sm:*:data-[slot=avatar]:size-5',
        '*:data-[slot=icon]:text-muted-fg pressed:*:data-[slot=icon]:text-fg hover:*:data-[slot=icon]:text-fg',
        'outline-hidden focus-visible:inset-ring focus-visible:inset-ring-ring focus-visible:ring-2 focus-visible:ring-ring/20',
        'text-left disabled:cursor-default disabled:opacity-50',
      ])}
      {...props}
    >
      {values => (
        <>
          {typeof props.children === 'function' ? props.children(values) : props.children}

          {(isCurrent || values.isCurrent) && (
            <span
              data-navbar="current-indicator"
              className={twJoin(
                `
                  absolute rounded-full bg-fg
                  [--gutter:--spacing(0.5)]
                `,
                'inset-y-2 -left-4 w-(--gutter)',
                `
                  sm:inset-x-2 sm:-bottom-[--spacing(3.4)] sm:h-(--gutter)
                  sm:group-data-[navbar=inset]/navbar-intent:-bottom-[--spacing(3.1)]
                `,
              )}
            />
          )}
        </>
      )}
    </Link>
  )
}

function NavbarSpacer({ className, ref, ...props }: React.ComponentProps<'div'>) {
  return <div ref={ref} className={twMerge('-ml-4 flex-1', className)} {...props} />
}

function NavbarStart({ className, ref, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      ref={ref}
      className={twMerge(`
        p-2 py-4
        md:p-2
      `, className)}
      {...props}
    />
  )
}

function NavbarGap({ className, ref, ...props }: React.ComponentProps<'div'>) {
  return <div ref={ref} className={twMerge('mx-2', className)} {...props} />
}

function NavbarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator orientation="vertical" className={twMerge('h-5', className)} {...props} />
}

function NavbarMobile({ className, ref, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      ref={ref}
      data-slot="navbar-mobile"
      className={twMerge(
        `
          group/navbar-mobile flex items-center gap-x-3 px-4 py-2.5
          md:hidden
        `,
        `
          group-has-data-navbar-sticky/navbar:sticky
          group-has-data-navbar-sticky/navbar:top-0
          group-has-data-navbar-sticky/navbar:border-b
          group-has-data-navbar-sticky/navbar:bg-navbar
        `,
        className,
      )}
      {...props}
    />
  )
}

function NavbarInset({ className, ref, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      ref={ref}
      data-navbar-inset={true}
      className={twMerge(`
        flex flex-1 flex-col bg-navbar pb-2
        md:px-2
        dark:bg-bg
      `, className)}
      {...props}
    >
      <div className={`
        grow bg-bg p-6
        md:rounded-lg md:p-12 md:shadow-xs md:ring-1 md:ring-fg/15
        md:dark:bg-navbar md:dark:ring-border
      `}
      >
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  )
}

interface NavbarTriggerProps extends ButtonProps {
  ref?: React.RefObject<HTMLButtonElement>
}

function NavbarTrigger({ className, onPress, ref, ...props }: NavbarTriggerProps) {
  const { toggleNavbar } = useNavbar()
  return (
    <Button
      ref={ref}
      data-slot="navbar-trigger"
      intent="plain"
      aria-label={props['aria-label'] || 'Toggle Navbar'}
      size="sq-sm"
      className={composeTailwindRenderProps(className, '-ml-2 min-lg:hidden')}
      onPress={(event) => {
        onPress?.(event)
        toggleNavbar()
      }}
      {...props}
    >
      <IconHamburger />
      <span className="sr-only">Toggle Navbar</span>
    </Button>
  )
}

function NavbarLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="navbar-label"
      className={twJoin('col-start-2 row-start-1 truncate', className)}
      {...props}
    />
  )
}

export type { NavbarItemProps, NavbarProps, NavbarProviderProps, NavbarTriggerProps }
export {
  Navbar,
  NavbarGap,
  NavbarInset,
  NavbarItem,
  NavbarLabel,
  NavbarMobile,
  NavbarProvider,
  NavbarSection,
  NavbarSeparator,
  NavbarSpacer,
  NavbarStart,
  NavbarTrigger,
}
