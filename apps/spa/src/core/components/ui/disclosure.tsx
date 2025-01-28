'use client'

import type {
  DisclosureGroupProps as AccordionProps,
  ButtonProps,
  DisclosureProps as CollapsibleProps,
  DisclosurePanelProps as DisclosurePanelPrimitiveProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import {
  DisclosureGroup as Accordion,
  Button,
  Disclosure as Collapsible,
  DisclosurePanel as CollapsiblePanel,
  composeRenderProps,
  Heading,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'

import { composeTailwindRenderProps } from './primitive'

interface DisclosureGroupProps extends AccordionProps {
  ref?: React.RefObject<HTMLDivElement>
}
function DisclosureGroup({ children, ref, className, ...props }: DisclosureGroupProps) {
  return (
    <Accordion
      ref={ref}
      data-slot="disclosure-group"
      {...props}
      className={composeTailwindRenderProps(
        className,
        'peer cursor-pointer data-disabled:cursor-not-allowed data-disabled:opacity-75',
      )}
    >
      {values => (
        <div data-slot="disclosure-content">
          {typeof children === 'function' ? children(values) : children}
        </div>
      )}
    </Accordion>
  )
}

const disclosure = tv({
  base: ['peer group/disclosure w-full min-w-60 border-border border-b'],
  variants: {
    isDisabled: {
      true: 'cursor-not-allowed opacity-70',
    },
  },
})

interface DisclosureProps extends CollapsibleProps {
  ref?: React.Ref<HTMLDivElement>
}
function Disclosure({ className, ref, ...props }: DisclosureProps) {
  return (
    <Collapsible
      ref={ref}
      data-slot="disclosure"
      {...props}
      className={composeRenderProps(className, (className, renderProps) =>
        disclosure({ ...renderProps, className }))}
    >
      {props.children}
    </Collapsible>
  )
}

const disclosureTrigger = tv({
  base: [
    'group/trigger [&[aria-expanded=true]_[data-slot=disclosure-chevron]]:-rotate-90 **:data-[slot=icon]:-mx-0.5 flex w-full items-center justify-between gap-x-2 py-3 text-left font-medium **:data-[slot=disclosure-chevron]:size-5 **:data-[slot=icon]:shrink-0 **:data-[slot=icon]:text-muted-fg sm:text-sm **:[span]:flex **:[span]:items-center **:[span]:gap-x-1 **:[span]:*:data-[slot=icon]:mr-1',
  ],
  variants: {
    isFocused: {
      true: 'text-fg outline-hidden',
    },
    isOpen: {
      true: 'text-fg',
    },
    isDisabled: {
      true: 'cursor-default opacity-50',
    },
  },
})

interface DisclosureTriggerProps extends ButtonProps {
  ref?: React.Ref<HTMLButtonElement>
}
function DisclosureTrigger({ className, ref, ...props }: DisclosureTriggerProps) {
  return (
    <Heading>
      <Button
        ref={ref}
        slot="trigger"
        className={composeRenderProps(className, (className, renderProps) =>
          disclosureTrigger({
            ...renderProps,
            className,
          }))}
        {...props}
      >
        {values => (
          <>
            {typeof props.children === 'function' ? props.children(values) : props.children}
            <Icon icon="ion:chevron-left" data-slot="disclosure-chevron" className="size-4 shrink-0" />
          </>
        )}
      </Button>
    </Heading>
  )
}

interface DisclosurePanelProps extends DisclosurePanelPrimitiveProps {
  ref?: React.Ref<HTMLDivElement>
}
function DisclosurePanel({ className, ref, ...props }: DisclosurePanelProps) {
  return (
    <CollapsiblePanel
      ref={ref}
      data-slot="disclosure-panel"
      className={composeTailwindRenderProps(
        className,
        'overflow-hidden text-muted-fg text-sm transition-all **:data-[slot=disclosure-group]:border-t **:data-[slot=disclosure-group]:**:[.internal-chevron]:hidden has-data-[slot=disclosure-group]:**:[button]:px-4',
      )}
      {...props}
    >
      <div
        data-slot="disclosure-panel-content"
        className="not-has-data-[slot=disclosure-group]:group-data-expanded/disclosure:pb-3 pt-0 [&:has([data-slot=disclosure-group])_&]:px-11"
      >
        {props.children}
      </div>
    </CollapsiblePanel>
  )
}

export type { DisclosureGroupProps, DisclosurePanelProps, DisclosureProps, DisclosureTriggerProps }
export { Disclosure, DisclosureGroup, DisclosurePanel, DisclosureTrigger }
