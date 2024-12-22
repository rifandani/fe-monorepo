'use client'

import type {
  TreeItemProps as AriaTreeItemProps,
  TreeProps as AriaTreeProps,
  ButtonProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import {
  UNSTABLE_Tree as AriaTree,
  UNSTABLE_TreeItem as AriaTreeItem,
  UNSTABLE_TreeItemContent as AriaTreeItemContent,
  Button,
  composeRenderProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const TreeItemContent = AriaTreeItemContent

function Tree<T extends object>({ className, ...props }: AriaTreeProps<T>) {
  return (
    <AriaTree
      className={
        composeRenderProps(className, className =>
          twMerge(
            'flex flex-col gap-1 overflow-auto p-1 outline-none',
            className,
          ))
      }
      {...props}
    />
  )
}

function TreeItemExpandButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      slot="chevron"
      className={
        composeRenderProps(className, className =>
          twMerge('outline-none', className))
      }
      {...props}
    >
      {composeRenderProps(children, _children => (
        <>
          <Icon icon="lucide:chevron-right" className="size-4 shrink-0 transition-transform duration-200 group-data-[expanded]:rotate-90" />
          {_children}
        </>
      ))}
    </Button>
  )
}

function TreeItemInfoButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      aria-label="Info"
      className={ctx => twMerge(
        'ring-offset-background ml-auto flex items-center justify-center rounded-md',
        /* Disabled */
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ',
        /* Focus Visible */
        'data-[focus-visible]:ring-ring data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2',
        /* Resets */
        'focus-visible:outline-none',
        typeof className === 'function' ? className(ctx) : className,
      )}
      {...props}
    >
      {composeRenderProps(children, _children => (
        <>
          {_children}
          <Icon icon="lucide:info" className="size-4 shrink-0" />
        </>
      ))}

    </Button>
  )
}

function TreeItem<T extends object>({
  className,
  ...props
}: AriaTreeItemProps<T>) {
  return (
    <AriaTreeItem
      className={ctx => twMerge(
        'ring-offset-background group relative flex items-center gap-2 rounded-md p-1 pl-[calc((var(--tree-item-level)_-_1)_*_2.25rem)] font-medium outline-none data-[has-child-rows]:pl-[calc((var(--tree-item-level)_-_1)_*_1.5rem)]',
        /* Disabled */
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ',
        /* Focus Visible */
        'data-[focus-visible]:ring-ring data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2',
        /* Resets */
        'focus-visible:outline-none',
        typeof className === 'function' ? className(ctx) : className,
      )}
      {...props}
    />
  )
}

export {
  Tree,
  TreeItem,
  TreeItemContent,
  TreeItemExpandButton,
  TreeItemInfoButton,
}
