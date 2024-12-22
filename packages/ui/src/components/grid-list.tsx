'use client'

import type {
  GridListItemProps as AriaGridListItemProps,
  GridListProps as AriaGridListProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Button as AriaButton,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  composeRenderProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

export function GridList<T extends object>({
  children,
  ...props
}: AriaGridListProps<T>) {
  return (
    <AriaGridList
      {...props}
      className={composeRenderProps(props.className, className =>
        twMerge(
          'jolly-GridList bg-popover text-popover-foreground group flex flex-col gap-2 overflow-auto rounded-md border p-1 shadow-md outline-none',
          /* Empty */
          'data-[empty]:p-6 data-[empty]:text-center data-[empty]:text-sm',
          className,
        ))}
    >
      {children}
    </AriaGridList>
  )
}

export function GridListItem({
  children,
  className,
  ...props
}: AriaGridListItemProps) {
  const textValue = typeof children === 'string' ? children : undefined
  return (
    <AriaGridListItem
      textValue={textValue}
      className={composeRenderProps(className, className =>
        twMerge(
          'jolly-GridListItem relative flex w-full cursor-default select-none items-center gap-3 rounded-sm px-2 py-1.5 text-sm outline-none',
          /* Disabled */
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          /* Focus Visible */
          'data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-background data-[focus-visible]:z-10 data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2',
          /* Hovered */
          'data-[hovered]:bg-accent data-[hovered]:text-accent-foreground',
          /* Selected */
          'data-[selected]:bg-accent data-[selected]:text-accent-foreground',
          /* Dragging */
          'data-[dragging]:opacity-60',
          className,
        ))}
      {...props}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          {/* Add elements for drag and drop and selection. */}
          {renderProps.allowsDragging && (
            <AriaButton slot="drag">
              <Icon icon="lucide:grip-horizontal" className="size-4" />
            </AriaButton>
          )}
          {renderProps.selectionMode === 'multiple'
          && renderProps.selectionBehavior === 'toggle' && (
            <Checkbox slot="selection" />
          )}
          {children}
        </>
      ))}
    </AriaGridListItem>
  )
}
