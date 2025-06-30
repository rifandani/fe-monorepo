'use client'
import type {
  ListBoxItemProps,
  SectionProps,
  SeparatorProps,
  TextProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import {
  Collection,
  composeRenderProps,
  Header,
  ListBoxItem as ListBoxItemPrimitive,
  ListBoxSection,
  Separator,
  Text,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'
import { Keyboard } from '@/core/components/ui/keyboard'

const dropdownItemStyles = tv({
  base: [
    `
      [--mr-icon:--spacing(2)]
      sm:[--mr-icon:--spacing(1.5)]
    `,
    `
      col-span-full grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] px-3 py-2
      supports-[grid-template-columns:subgrid]:grid-cols-subgrid
      sm:px-2.5 sm:py-1.5
    `,
    `
      not-has-[[slot=description]]:items-center
      has-[[slot=description]]:**:data-[slot=check-indicator]:mt-[1.5px]
    `,
    `
      group relative cursor-default rounded-[calc(var(--radius-lg)-1px)]
      text-base/6 text-fg outline-0 select-none
      sm:text-sm/6
    `,
    `
      **:data-[slot=avatar]:mr-(--mr-icon) **:data-[slot=avatar]:size-6
      **:data-[slot=avatar]:*:mr-1.5 **:data-[slot=avatar]:*:size-6
      sm:**:data-[slot=avatar]:size-5 sm:**:data-[slot=avatar]:*:size-5
    `,
    `
      *:data-[slot=icon]:mr-(--mr-icon)
      **:data-[slot=icon]:size-5 **:data-[slot=icon]:shrink-0
      **:data-[slot=icon]:text-muted-fg
      data-danger:**:data-[slot=icon]:text-danger/60
      focus:data-danger:**:data-[slot=icon]:text-danger
      sm:**:data-[slot=icon]:size-4
    `,
    `
      [&>[slot=label]+[data-slot=icon]]:absolute
      [&>[slot=label]+[data-slot=icon]]:right-1
    `,
    `
      forced-color-adjust-none
      forced-colors:text-[CanvasText]
      forced-colors:**:data-[slot=icon]:text-[CanvasText]
      forced-colors:group-focus:**:data-[slot=icon]:text-[CanvasText]
    `,
  ],
  variants: {
    isDisabled: {
      true: `
        text-muted-fg
        forced-colors:text-[GrayText]
      `,
    },
    isSelected: {
      true: `
        **:data-[slot=avatar]:hidden **:data-[slot=avatar]:*:hidden
        **:data-[slot=icon]:hidden **:data-[slot=icon]:text-accent-fg
      `,
    },
    isFocused: {
      false: 'data-danger:text-danger',
      true: [
        '**:data-[slot=icon]:text-accent-fg **:[kbd]:text-accent-fg',
        `
          bg-accent text-accent-fg
          forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]
        `,
        'data-danger:bg-danger/10 data-danger:text-danger',
        `
          [&_.text-muted-fg]:text-accent-fg/80
          *:[[slot=description]]:text-accent-fg *:[[slot=label]]:text-accent-fg
        `,
      ],
    },
  },
})

const dropdownSectionStyles = tv({
  slots: {
    section: 'col-span-full grid grid-cols-[auto_1fr]',
    header:
      `
        col-span-full px-3.5 py-2 text-sm/6 font-medium text-muted-fg
        sm:px-3 sm:py-1.5 sm:text-xs/6
      `,
  },
})

const { section, header } = dropdownSectionStyles()

interface DropdownSectionProps<T> extends SectionProps<T> {
  title?: string
}

function DropdownSection<T extends object>({
  className,
  children,
  ...props
}: DropdownSectionProps<T>) {
  return (
    <ListBoxSection className={section({ className })}>
      {'title' in props && <Header className={header()}>{props.title}</Header>}
      <Collection items={props.items}>{children}</Collection>
    </ListBoxSection>
  )
}

type DropdownItemProps = ListBoxItemProps

function DropdownItem({ className, children, ...props }: DropdownItemProps) {
  const textValue = typeof children === 'string' ? children : undefined
  return (
    <ListBoxItemPrimitive
      textValue={textValue}
      className={composeRenderProps(className, (className, renderProps) =>
        dropdownItemStyles({ ...renderProps, className }))}
      {...props}
    >
      {composeRenderProps(children, (children, { isSelected }) => (
        <>
          {isSelected && <Icon icon="lucide:check" className="-mx-1 mr-1.5" data-slot="check-indicator" />}
          {typeof children === 'string' ? <DropdownLabel>{children}</DropdownLabel> : children}
        </>
      ))}
    </ListBoxItemPrimitive>
  )
}

interface DropdownLabelProps extends TextProps {
  ref?: React.Ref<HTMLDivElement>
}

function DropdownLabel({ className, ref, ...props }: DropdownLabelProps) {
  return <Text slot="label" ref={ref} className={twMerge('col-start-2', className)} {...props} />
}

interface DropdownDescriptionProps extends TextProps {
  ref?: React.Ref<HTMLDivElement>
}

function DropdownDescription({ className, ref, ...props }: DropdownDescriptionProps) {
  return (
    <Text
      slot="description"
      ref={ref}
      className={twMerge('col-start-2 text-sm text-muted-fg', className)}
      {...props}
    />
  )
}

function DropdownSeparator({ className, ...props }: SeparatorProps) {
  return (
    <Separator
      orientation="horizontal"
      className={twMerge('col-span-full -mx-1 my-1 h-px bg-fg/10', className)}
      {...props}
    />
  )
}

function DropdownKeyboard({ className, ...props }: React.ComponentProps<typeof Keyboard>) {
  return (
    <Keyboard
      classNames={{
        base: twMerge(
          `
            absolute right-2 pl-2
            group-hover:text-primary-fg
            group-focus:text-primary-fg
          `,
          className,
        ),
      }}
      {...props}
    />
  )
}

/**
 * Note: This is not exposed component, but it's used in other components to render dropdowns.
 * @internal
 */
export type {
  DropdownDescriptionProps,
  DropdownItemProps,
  DropdownLabelProps,
  DropdownSectionProps,
}
export {
  DropdownDescription,
  DropdownItem,
  dropdownItemStyles,
  DropdownKeyboard,
  DropdownLabel,
  DropdownSection,
  dropdownSectionStyles,
  DropdownSeparator,
}
