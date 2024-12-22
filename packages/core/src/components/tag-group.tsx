'use client'

import type {
  TagGroupProps as AriaTagGroupProps,
  TagListProps as AriaTagListProps,
  TagProps as AriaTagProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import { Label } from '@workspace/core/components/field'
import { cva } from 'class-variance-authority'
import {
  Button as AriaButton,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList as AriaTagList,
  composeRenderProps,
  Text,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const TagGroup = AriaTagGroup

function TagList<T extends object>({
  className,
  ...props
}: AriaTagListProps<T>) {
  return (
    <AriaTagList
      className={composeRenderProps(className, className =>
        twMerge(
          'flex flex-wrap gap-2',
          /* Empty */
          'data-[empty]:text-muted-foreground data-[empty]:text-sm',
          className,
        ))}
      {...props}
    />
  )
}

const badgeVariants = cva(
  [
    'inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold ring-offset-background transition-colors',
    /* Focus */
    'data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-ring data-[focused]:ring-offset-2',
    /* Disabled */
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-transparent bg-primary text-primary-foreground',
          /* Hover */
          'data-[hovered]:bg-primary/80',
        ],
        secondary: [
          'border-transparent bg-secondary text-secondary-foreground',
          /* Hover */
          'data-[hovered]:bg-secondary/80',
        ],
        destructive: [
          'border-transparent bg-destructive text-destructive-foreground',
          /* Hover */
          'data-[hovered]:bg-destructive/80',
        ],
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Tag({ children, className, ...props }: AriaTagProps) {
  const textValue = typeof children === 'string' ? children : undefined
  return (
    <AriaTag
      textValue={textValue}
      className={composeRenderProps(className, (className, renderProps) =>
        twMerge(
          badgeVariants({
            variant:
              renderProps.selectionMode === 'none' || renderProps.isSelected
                ? 'default'
                : 'secondary',
          }),
          renderProps.allowsRemoving && 'pr-1',
          className,
        ))}
      {...props}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          {children}
          {renderProps.allowsRemoving && (
            <AriaButton
              slot="remove"
              className={twMerge(
                'ring-offset-background rounded-sm opacity-70 transition-opacity',
                /* Hover */
                'data-[hovered]:opacity-100',
                /* Resets */
                'focus-visible:outline-none',
              )}
            >
              <Icon icon="lucide:x" aria-hidden className="size-3" />
            </AriaButton>
          )}
        </>
      ))}
    </AriaTag>
  )
}

interface JollyTagGroupProps<T>
  extends Omit<AriaTagGroupProps, 'children'>,
  Pick<AriaTagListProps<T>, 'items' | 'children' | 'renderEmptyState'> {
  label?: string
  description?: string
  errorMessage?: string
}

function JollyTagGroup<T extends object>({
  label,
  description,
  className,
  errorMessage,
  items,
  children,
  renderEmptyState,
  ...props
}: JollyTagGroupProps<T>) {
  return (
    <TagGroup className={twMerge('group flex flex-col gap-2', className)} {...props}>
      <Label>{label}</Label>
      <TagList items={items} renderEmptyState={renderEmptyState}>
        {children}
      </TagList>
      {description && (
        <Text className="text-muted-foreground text-sm" slot="description">
          {description}
        </Text>
      )}
      {errorMessage && (
        <Text className="text-destructive text-sm" slot="errorMessage">
          {errorMessage}
        </Text>
      )}
    </TagGroup>
  )
}

export { badgeVariants, JollyTagGroup, Tag, TagGroup, TagList }
export type { JollyTagGroupProps }
