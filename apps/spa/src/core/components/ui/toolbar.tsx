'use client'

import type { GroupProps, SeparatorProps, ToolbarProps } from 'react-aria-components'

import { createContext, use } from 'react'
import { composeRenderProps, Group, Toolbar as ToolbarPrimitive } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { composeTailwindRenderProps } from '@/core/components/ui/primitive'
import { Separator } from '@/core/components/ui/separator'
import { Toggle, type ToggleProps } from '@/core/components/ui/toggle'

const ToolbarContext = createContext<{ orientation?: ToolbarProps['orientation'] }>({
  orientation: 'horizontal',
})

function Toolbar({ orientation = 'horizontal', className, ...props }: ToolbarProps) {
  return (
    <ToolbarContext value={{ orientation }}>
      <ToolbarPrimitive
        orientation={orientation}
        {...props}
        className={composeRenderProps(className, (className, { orientation }) =>
          twMerge(
            `
              group flex flex-row gap-2
              [-ms-overflow-style:none]
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            `,
            orientation === 'horizontal'
              ? `
                flex-row items-center
                [-ms-overflow-style:none]
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              `
              : 'flex-col items-start',
            className,
          ))}
      />
    </ToolbarContext>
  )
}

const ToolbarGroupContext = createContext<{ isDisabled?: boolean }>({})

type ToolbarGroupProps = GroupProps
function ToolbarGroup({ isDisabled, className, ...props }: ToolbarGroupProps) {
  return (
    <ToolbarGroupContext value={{ isDisabled }}>
      <Group
        className={composeTailwindRenderProps(
          className,
          'flex gap-2 group-orientation-vertical:flex-col group-orientation-vertical:items-start group-orientation-horizontal:items-center',
        )}
        {...props}
      >
        {props.children}
      </Group>
    </ToolbarGroupContext>
  )
}

type ToggleItemProps = ToggleProps
function ToolbarItem({
  isDisabled,
  size = 'sm',
  intent = 'outline',
  ref,
  ...props
}: ToggleItemProps) {
  const context = use(ToolbarGroupContext)
  const effectiveIsDisabled = isDisabled || context.isDisabled

  return (
    <Toggle intent={intent} size={size} ref={ref} isDisabled={effectiveIsDisabled} {...props} />
  )
}
type ToolbarSeparatorProps = SeparatorProps
function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  const { orientation } = use(ToolbarContext)
  const effectiveOrientation = orientation === 'vertical' ? 'horizontal' : 'vertical'
  return (
    <Separator
      orientation={effectiveOrientation}
      className={twMerge(effectiveOrientation === 'vertical'
        ? 'mx-1.5'
        : `my-1.5 w-8`, className)}
      {...props}
    />
  )
}

Toolbar.Group = ToolbarGroup
Toolbar.Separator = ToolbarSeparator
Toolbar.Item = ToolbarItem

export type { ToggleItemProps, ToolbarGroupProps, ToolbarProps, ToolbarSeparatorProps }
export { Toolbar }
