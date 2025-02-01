'use client'

import type { TreeItemProps, TreeProps } from 'react-aria-components'
import { Icon } from '@iconify/react'
import {
  Button,
  composeRenderProps,
  UNSTABLE_TreeItemContent as TreeItemContent,
  UNSTABLE_TreeItem as TreeItemPrimitive,
  UNSTABLE_Tree as TreePrimitive,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { Checkbox } from './checkbox'

const treeStyles = tv({
  base: 'flex max-h-96 min-w-72 cursor-default flex-col overflow-auto rounded-lg border py-2 outline-hidden forced-color-adjust-none [scrollbar-width:thin] sm:text-sm [&::-webkit-scrollbar]:size-0.5',
  variants: {
    isFocusVisible: {
      true: 'outline-2 outline-primary outline-offset-[-1px]',
    },
  },
})

function Tree<T extends object>({ className, ...props }: TreeProps<T>) {
  return (
    <TreePrimitive
      className={composeRenderProps(className, (className, renderProps) =>
        treeStyles({
          ...renderProps,
          className,
        }))}
      {...props}
    >
      {props.children}
    </TreePrimitive>
  )
}

const itemStyles = tv({
  base: [
    'p-[0.286rem_0.286rem_0.286rem_0.571rem] pl-[calc((var(--tree-item-level)-1)*20px+0.571rem+var(--padding))] outline-hidden [--padding:20px] [&_[data-expanded]_[slot=chevron]_[data-slot=icon]]:rotate-90',
    '[&_[slot=chevron]]:outline-hidden [&_[slot=chevron]_[data-slot=icon]]:text-muted-fg',
    'data-has-child-rows:[--padding:0px]',
  ],
  variants: {
    isExpanded: {
      true: '[&_[slot=chevron]_[data-slot=icon]]:rotate-90 [&_[slot=chevron]_[data-slot=icon]]:text-fg [&_[slot=chevron]_[data-slot=icon]]:transition [&_[slot=chevron]_[data-slot=icon]]:duration-200',
    },
    isFocusVisible: {
      true: 'data-focused:outline-hidden data-focus-visible:ring-1 data-focus-visible:ring-primary [&_[slot=chevron]_[data-slot=icon]]:text-fg',
    },
    isDisabled: {
      true: 'opacity-50 forced-colors:text-[GrayText]',
    },
  },
})

function TreeItem<T extends object>({ className, ...props }: TreeItemProps<T>) {
  return (
    <TreeItemPrimitive
      className={composeRenderProps(className, (className, renderProps) =>
        itemStyles({
          ...renderProps,
          className,
        }))}
      {...props}
    >
      {props.children}
    </TreeItemPrimitive>
  )
}

function ItemContent({ children, ...props }: React.ComponentProps<typeof TreeItemContent>) {
  return (
    <TreeItemContent {...props}>
      <div className="flex items-center">{children as React.ReactNode}</div>
    </TreeItemContent>
  )
}

function Indicator() {
  return (
    <Button className="relative shrink-0" slot="chevron">
      <Icon icon="lucide:chevron-right" className="size-5" />
    </Button>
  )
}

function ItemCheckbox() {
  return <Checkbox slot="selection" />
}

function ItemLabel(props: React.HtmlHTMLAttributes<HTMLSpanElement>) {
  return <span {...props} />
}

TreeItem.Label = ItemLabel
TreeItem.Indicator = Indicator
TreeItem.Checkbox = ItemCheckbox
TreeItem.Content = ItemContent

export type { TreeItemProps, TreeProps }
export { Tree, TreeItem }
