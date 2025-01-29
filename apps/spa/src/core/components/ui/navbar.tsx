'use client'

import type { LinkProps } from 'react-aria-components'
import type { VariantProps } from 'tailwind-variants'
import type { ButtonProps } from './button'
import { Icon } from '@iconify/react'
import { useMediaQuery } from '@workspace/core/hooks/use-media-query.hook'
import { LayoutGroup, motion } from 'motion/react'
import { createContext, use, useCallback, useId, useMemo, useState } from 'react'
import { composeRenderProps, Link } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

import { tv } from 'tailwind-variants'
import { Button } from './button'
import { composeTailwindRenderProps } from './primitive'
import { Sheet } from './sheet'

interface NavbarOptions {
  side?: 'left' | 'right'
  isSticky?: boolean
  intent?: 'navbar' | 'floating' | 'inset'
}

type NavbarContextProps = {
  open: boolean
  setOpen: (open: boolean) => void
  isCompact: boolean
  toggleNavbar: () => void
} & NavbarOptions

const NavbarContext = createContext<NavbarContextProps | null>(null)

function useNavbar() {
  const context = use(NavbarContext)
  if (!context) {
    throw new Error('useNavbar must be used within a Navbar.')
  }

  return context
}

interface NavbarProps extends React.ComponentProps<'header'>, NavbarOptions {
  defaultOpen?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const navbarStyles = tv({
  base: 'relative isolate flex w-full flex-col',
  variants: {
    intent: {
      floating: 'px-2.5 pt-2',
      navbar: '',
      inset: 'min-h-svh bg-navbar dark:bg-bg',
    },
  },
})

function Navbar({
  children,
  isOpen: openProp,
  onOpenChange: setOpenProp,
  defaultOpen = false,
  className,
  side = 'left',
  isSticky = false,
  intent = 'navbar',
  ...props
}: NavbarProps) {
  const isCompact = useMediaQuery('(max-width: 768px)')
  const [_open, _setOpen] = useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      if (setOpenProp) {
        return setOpenProp?.(typeof value === 'function' ? value(open) : value)
      }

      _setOpen(value)
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
      isCompact,
      toggleNavbar,
      intent,
      isSticky,
      side,
    }),
    [open, setOpen, isCompact, toggleNavbar, intent, isSticky, side],
  )
  return (
    <NavbarContext value={contextValue}>
      <header
        data-navbar-intent={intent}
        className={navbarStyles({ intent, className })}
        {...props}
      >
        {children}
      </header>
    </NavbarContext>
  )
}

const navStyles = tv({
  base: [
    'group peer hidden h-(--navbar-height) w-full items-center px-4 [--navbar-height:3.5rem] md:flex',
    '[&>div]:mx-auto [&>div]:w-full [&>div]:max-w-[1680px] [&>div]:items-center md:[&>div]:flex',
  ],
  variants: {
    isSticky: {
      true: 'sticky top-0 z-40',
    },
    intent: {
      floating:
        'mx-auto w-full max-w-7xl rounded-xl border bg-navbar text-navbar-fg md:px-4 2xl:max-w-(--breakpoint-2xl)',
      navbar: 'border-b bg-navbar text-navbar-fg md:px-6',
      inset: [
        'mx-auto md:px-6',
        '[&>div]:mx-auto [&>div]:w-full [&>div]:items-center md:[&>div]:flex 2xl:[&>div]:max-w-(--breakpoint-2xl)',
      ],
    },
  },
})

interface NavbarNavProps extends React.ComponentProps<'div'> {
  intent?: 'navbar' | 'floating' | 'inset'
  isSticky?: boolean
  side?: 'left' | 'right'
  useDefaultResponsive?: boolean
}

function NavbarNav({ useDefaultResponsive = true, className, ref, ...props }: NavbarNavProps) {
  const { isCompact, side, intent, isSticky, open, setOpen } = useNavbar()

  if (isCompact && useDefaultResponsive) {
    return (
      <Sheet isOpen={open} onOpenChange={setOpen} {...props}>
        <Sheet.Content
          side={side}
          aria-label="Compact Navbar"
          data-navbar="compact"
          classNames={{
            content: 'text-fg [&>button]:hidden',
          }}
          isFloat={intent === 'floating'}
        >
          <Sheet.Body className="px-2 md:px-4">{props.children}</Sheet.Body>
        </Sheet.Content>
      </Sheet>
    )
  }

  return (
    <div
      data-navbar-nav="true"
      ref={ref}
      className={navStyles({ isSticky, intent, className })}
      {...props}
    >
      <div>{props.children}</div>
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
      data-navbar-trigger="true"
      appearance="plain"
      aria-label={props['aria-label'] || 'Toggle Navbar'}
      size="square-petite"
      className={className}
      onPress={(event) => {
        onPress?.(event)
        toggleNavbar()
      }}
      {...props}
    >
      <Icon icon="ion:menu-outline" />
      <span className="sr-only">Toggle Navbar</span>
    </Button>
  )
}

function Section({ className, ...props }: React.ComponentProps<'div'>) {
  const { isCompact } = useNavbar()
  const id = useId()
  return (
    <LayoutGroup id={id}>
      <div
        data-navbar-section="true"
        className={twMerge(
          'flex',
          isCompact ? 'flex-col gap-y-4' : 'flex-row items-center gap-x-3',
          className,
        )}
        {...props}
      >
        {props.children}
      </div>
    </LayoutGroup>
  )
}

const navItemStyles = tv({
  base: [
    '*:data-[slot=icon]:-mx-0.5 relative flex cursor-pointer items-center gap-x-2 px-2 text-muted-fg no-underline outline-hidden transition-colors md:text-sm forced-colors:transform-none forced-colors:outline-0 forced-colors:data-disabled:text-[GrayText]',
    'data-focused:text-fg data-hovered:text-fg data-pressed:text-fg data-focus-visible:outline-1 data-focus-visible:outline-primary',
    '**:data-[slot=chevron]:size-4 **:data-[slot=chevron]:transition-transform',
    'data-pressed:**:data-[slot=chevron]:rotate-180 *:data-[slot=icon]:size-4 *:data-[slot=icon]:shrink-0',
    'data-disabled:cursor-default data-disabled:opacity-50 data-disabled:forced-colors:text-[GrayText]',
  ],
  variants: {
    isCurrent: {
      true: 'cursor-default text-navbar-fg',
    },
  },
})

interface NavbarItemProps extends LinkProps {
  isCurrent?: boolean
}

function Item({ className, isCurrent, ...props }: NavbarItemProps) {
  const { intent, isCompact } = useNavbar()
  return (
    <Link
      data-navbar-item="true"
      aria-current={isCurrent ? 'page' : undefined}
      className={composeRenderProps(className, (className, ...renderProps) =>
        navItemStyles({ ...renderProps, isCurrent, className }))}
      {...props}
    >
      {values => (
        <>
          {typeof props.children === 'function' ? props.children(values) : props.children}

          {(isCurrent || values.isCurrent) && !isCompact && intent !== 'floating' && (
            <motion.span
              layoutId="current-indicator"
              data-slot="current-indicator"
              className="bg-fg absolute inset-x-2 bottom-[calc(var(--navbar-height)*-0.33)] h-0.5 rounded-full"
            />
          )}
        </>
      )}
    </Link>
  )
}

function Logo({ className, ...props }: LinkProps) {
  return (
    <Link
      className={composeTailwindRenderProps(
        className,
        'relative flex items-center gap-x-2 px-2 py-4 text-fg data-focus-visible:outline-1 data-focus-visible:outline-primary data-focused:outline-hidden md:mr-4 md:px-0 md:py-0',
      )}
      {...props}
    />
  )
}

function Flex({ className, ref, ...props }: React.ComponentProps<'div'>) {
  return <div ref={ref} className={twMerge('flex items-center gap-2 md:gap-3', className)} {...props} />
}

const compactStyles = tv({
  base: 'flex justify-between bg-navbar text-navbar-fg peer-has-[[data-navbar-intent=floating]]:border md:hidden',
  variants: {
    intent: {
      floating: 'h-12 rounded-lg border px-3.5',
      inset: 'h-14 border-b px-4',
      navbar: 'h-14 border-b px-4',
    },
  },
})

interface NavbarCompactProps
  extends React.ComponentProps<'div'>,
  VariantProps<typeof compactStyles> {
  ref?: React.RefObject<HTMLDivElement>
}
function NavbarCompact({ className, ref, ...props }: NavbarCompactProps) {
  const { intent } = useNavbar()
  return <div ref={ref} className={compactStyles({ intent, className })} {...props} />
}

const insetStyles = tv({
  base: 'grow',
  variants: {
    intent: {
      floating: '',
      inset:
        'bg-bg md:rounded-lg md:shadow-xs md:ring-1 md:ring-fg/15 dark:bg-navbar md:dark:ring-border',
      navbar: '',
    },
  },
})

function Inset({ className, ref, ...props }: React.ComponentProps<'div'>) {
  const { intent } = useNavbar()
  return (
    <main
      ref={ref}
      data-navbar-intent={intent}
      className={twMerge(
        'flex flex-1 flex-col',
        intent === 'inset' && 'bg-navbar dark:bg-bg pb-2 md:px-2',
        className,
      )}
    >
      <div className={insetStyles({ intent, className })}>{props.children}</div>
    </main>
  )
}

Navbar.Nav = NavbarNav
Navbar.Inset = Inset
Navbar.Compact = NavbarCompact
Navbar.Flex = Flex
Navbar.Trigger = NavbarTrigger
Navbar.Logo = Logo
Navbar.Item = Item
Navbar.Section = Section

export type { NavbarCompactProps, NavbarItemProps, NavbarNavProps, NavbarProps, NavbarTriggerProps }
export { Navbar }
