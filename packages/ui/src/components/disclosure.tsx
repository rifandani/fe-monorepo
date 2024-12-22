'use client'

import type {
  DisclosureGroupProps as AriaDisclosureGroupProps,
  DisclosurePanelProps as AriaDisclosurePanelProps,
  DisclosureProps as AriaDisclosureProps,
  ButtonProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import React, { useContext } from 'react'
import {
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  Button,
  composeRenderProps,
  DisclosureGroup,
  DisclosureGroupStateContext,
  Heading,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

export interface DisclosureProps extends AriaDisclosureProps {
  children: React.ReactNode
}

function Disclosure({ children, className, ...props }: DisclosureProps) {
  const isInGroup = useContext(DisclosureGroupStateContext) !== null

  return (
    <AriaDisclosure
      {...props}
      className={composeRenderProps(className, _className =>
        twMerge(
          'group min-w-64',
          isInGroup && 'border-0 border-b last:border-b-0',
          _className,
        ))}
    >
      {children}
    </AriaDisclosure>
  )
}

export interface DisclosureHeaderProps {
  children: React.ReactNode
  className?: ButtonProps['className']
}

function DisclosureHeader({ children, className }: DisclosureHeaderProps) {
  return (
    <Heading className="flex">
      <Button
        slot="trigger"
        className={composeRenderProps(className, className => twMerge(
          'ring-offset-background group flex flex-1 items-center justify-between rounded-md py-4 font-medium transition-all hover:underline',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          'data-[focus-visible]:ring-ring data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2',
          'outline-none',
          className,
        ))}
      >
        {children}
        <Icon
          icon="lucide:chevron-down"
          aria-hidden
          className={twMerge(
            'size-4 shrink-0 transition-transform duration-200',
            'group-data-[expanded]:rotate-180',
            'group-data-[disabled]:opacity-50',
          )}
        />
      </Button>
    </Heading>
  )
}

export interface DisclosurePanelProps extends AriaDisclosurePanelProps {
  children: React.ReactNode
}

function DisclosurePanel({
  children,
  className,
  ...props
}: DisclosurePanelProps) {
  return (
    <AriaDisclosurePanel
      {...props}
      className={composeRenderProps(className, _className => twMerge('overflow-hidden text-sm transition-all', _className))}
    >
      <div
        className="pb-4 pt-0"
      >
        {children}
      </div>
    </AriaDisclosurePanel>
  )
}

export interface DisclosureGroupProps extends AriaDisclosureGroupProps {
  children: React.ReactNode
}

export { Disclosure, DisclosureGroup, DisclosureHeader, DisclosurePanel }
