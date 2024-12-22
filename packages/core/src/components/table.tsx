'use client'

import type {
  ColumnProps as AriaColumnProps,
  CellProps,
  RowProps,
  TableBodyProps,
  TableHeaderProps,
  TableProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import {
  Cell as AriaCell,
  Column as AriaColumn,
  ResizableTableContainer as AriaResizableTableContainer,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  ColumnResizer,
  composeRenderProps,
  Group,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const ResizableTableContainer = AriaResizableTableContainer

function Table({ className, ...props }: TableProps) {
  return (
    <AriaTable
      className={composeRenderProps(className, className =>
        twMerge(
          'data-[focus-visible]:outline-ring w-full caption-bottom text-sm -outline-offset-2',
          className,
        ))}
      {...props}
    />
  )
}

function TableHeader<T extends object>({
  className,
  ...props
}: TableHeaderProps<T>) {
  return (
    <AriaTableHeader
      className={composeRenderProps(className, className =>
        twMerge('[&_tr]:border-b', className))}
      {...props}
    />
  )
}

export interface ColumnProps extends AriaColumnProps {
  isResizable?: boolean
}

function Column({ className, children, ...props }: ColumnProps) {
  return (
    <AriaColumn
      className={composeRenderProps(className, className =>
        twMerge(
          'text-muted-foreground data-[focus-visible]:outline-ring h-12 text-left align-middle font-medium -outline-offset-2',
          className,
        ))}
      {...props}
    >
      {composeRenderProps(children, (children, { allowsSorting }) => (
        <div className="flex items-center">
          <Group
            role="presentation"
            tabIndex={-1}
            className={twMerge(
              'flex h-10 flex-1 items-center gap-1 overflow-hidden rounded-md px-4',
              allowsSorting
              && 'data-[hovered]:bg-accent data-[hovered]:text-accent-foreground p-2',
              'data-[focus-visible]:outline-ring  focus-visible:outline-none data-[focus-visible]:-outline-offset-2 [&:has([slot=selection])]:pr-0',
            )}
          >
            <span className="truncate">{children}</span>
            {allowsSorting && <Icon icon="lucide:arrow-up-down" className="ml-2 size-4" />}
          </Group>
          {props.isResizable && (
            <ColumnResizer className="data-[focus-visible]:ring-rin bg-muted-foreground data-[resizing]:bg-primary data-[focus-visible]:ring-ring box-content h-5 w-px translate-x-[8px] cursor-col-resize rounded  bg-clip-content px-[8px] py-1 focus-visible:outline-none data-[resizing]:w-[2px] data-[resizing]:pl-[7px]  data-[focus-visible]:ring-1" />
          )}
        </div>
      ))}
    </AriaColumn>
  )
}

function TableBody<T extends object>({
  className,
  ...props
}: TableBodyProps<T>) {
  return (
    <AriaTableBody
      className={composeRenderProps(className, className =>
        twMerge(
          'data-[focus-visible]:outline-ring -outline-offset-2 data-[empty]:h-24 data-[empty]:text-center [&_tr:last-child]:border-0',
          className,
        ))}
      {...props}
    />
  )
}

function Row<T extends object>({ className, ...props }: RowProps<T>) {
  return (
    <AriaRow
      className={composeRenderProps(className, className =>
        twMerge(
          'data-[hovered]:bg-muted/50 data-[selected]:bg-muted data-[focus-visible]:outline-ring border-b -outline-offset-2 transition-colors',
          className,
        ))}
      {...props}
    />
  )
}

function Cell({ className, ...props }: CellProps) {
  return (
    <AriaCell
      className={composeRenderProps(className, className =>
        twMerge(
          'data-[focus-visible]:outline-ring p-4 align-middle -outline-offset-2 [&:has([role=checkbox])]:pr-0',
          className,
        ))}
      {...props}
    />
  )
}

export {
  Cell,
  Column,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader,
}
