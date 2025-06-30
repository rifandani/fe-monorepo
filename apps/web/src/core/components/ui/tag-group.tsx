'use client'
import type {
  TagGroupProps as TagGroupPrimitiveProps,
  TagListProps,
  TagProps as TagPrimitiveProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import {
  Button,
  composeRenderProps,
  TagGroup as TagGroupPrimitive,
  TagList as TagListPrimitive,
  Tag as TagPrimitive,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { Description, Label } from '@/core/components/ui/field'
import { composeTailwindRenderProps } from '@/core/components/ui/primitive'

interface TagGroupProps extends TagGroupPrimitiveProps {
  errorMessage?: string
  label?: string
  description?: string
  ref?: React.RefObject<HTMLDivElement>
}

function TagGroup({ children, ref, className, ...props }: TagGroupProps) {
  return (
    <TagGroupPrimitive
      ref={ref}
      className={twMerge('flex flex-col flex-wrap', className)}
      {...props}
    >
      {props.label && <Label className="mb-1">{props.label}</Label>}
      {children}
      {props.description && <Description>{props.description}</Description>}
    </TagGroupPrimitive>
  )
}

function TagList<T extends object>({ className, ...props }: TagListProps<T>) {
  return (
    <TagListPrimitive
      {...props}
      className={composeTailwindRenderProps(className, 'flex flex-wrap gap-1')}
    />
  )
}

interface TagProps extends TagPrimitiveProps {}

function Tag({ className, children, ...props }: TagProps) {
  const textValue = typeof children === 'string' ? children : undefined
  return (
    <TagPrimitive
      textValue={textValue}
      {...props}
      className={composeRenderProps(
        className,
        (className, { isFocusVisible, isSelected, isDisabled, allowsRemoving }) =>
          twMerge(
            `
              inline-flex cursor-default items-center gap-x-1.5 rounded-full
              px-2 py-0.5 text-sm/5 font-medium inset-ring inset-ring-border
              outline-hidden
              sm:text-xs/5
              forced-colors:outline
            `,
            isSelected
            && `
              bg-primary text-primary-fg inset-ring-primary
              focus-visible:bg-primary/90
            `,
            isFocusVisible && `
              bg-secondary text-secondary-fg inset-ring inset-ring-current/10
            `,
            isDisabled && 'opacity-50',
            allowsRemoving && 'pr-2',
            className,
          ),
      )}
    >
      {({ allowsRemoving }) => (
        <>
          {children}
          {allowsRemoving && (
            <Button
              slot="remove"
              className={`
                -mx-0.5 grid size-3.5 shrink-0 place-content-center rounded-full
                text-muted-fg outline-hidden
                hover:text-fg
              `}
            >
              <Icon icon="lucide:x" data-slot="close" className="size-3" />
            </Button>
          )}
        </>
      )}
    </TagPrimitive>
  )
}

export type { TagGroupProps, TagListProps, TagProps }
export { Tag, TagGroup, TagList }
