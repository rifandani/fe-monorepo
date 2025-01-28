'use client'

import type { GroupProps, SeparatorProps, ToolbarProps } from 'react-aria-components'
import { createContext, useContext, useMemo } from 'react'
import { composeRenderProps, Group, Toolbar as ToolbarPrimitive } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'

import { composeTailwindRenderProps } from './primitive'
import { Separator } from './separator'
import { Toggle, type ToggleProps } from './toggle'

const ToolbarContext = createContext<{ orientation?: ToolbarProps['orientation'] }>({
  orientation: 'horizontal',
})

const toolbarStyles = tv({
  base: 'group flex gap-2',
  variants: {
    orientation: {
      horizontal:
        'flex-row [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      vertical: 'flex-col items-start',
    },
  },
})

function Toolbar({ orientation = 'horizontal', className, ...props }: ToolbarProps) {
  const value = useMemo(() => ({ orientation }), [orientation])

  return (
    <ToolbarContext.Provider value={value}>
      <ToolbarPrimitive
        orientation={orientation}
        {...props}
        className={composeRenderProps(className, (className, renderProps) =>
          toolbarStyles({ ...renderProps, className }))}
      />
    </ToolbarContext.Provider>
  )
}

const ToolbarGroupContext = createContext<{ isDisabled?: boolean }>({})

type ToolbarGroupProps = GroupProps
function ToolbarGroup({ isDisabled, className, ...props }: ToolbarGroupProps) {
  const value = useMemo(() => ({ isDisabled }), [isDisabled])

  return (
    <ToolbarGroupContext.Provider value={value}>
      <Group
        className={composeTailwindRenderProps(
          className,
          'flex gap-2 group-data-[orientation=vertical]:flex-col group-data-[orientation=vertical]:items-start',
        )}
        {...props}
      >
        {props.children}
      </Group>
    </ToolbarGroupContext.Provider>
  )
}

type ToggleItemProps = ToggleProps
function Item({ isDisabled, ref, ...props }: ToggleItemProps) {
  const context = useContext(ToolbarGroupContext)
  const effectiveIsDisabled = isDisabled || context.isDisabled

  return <Toggle ref={ref} isDisabled={effectiveIsDisabled} {...props} />
}
type ToolbarSeparatorProps = SeparatorProps
function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  const { orientation } = useContext(ToolbarContext)
  const effectiveOrientation = orientation === 'vertical' ? 'horizontal' : 'vertical'
  return (
    <Separator
      orientation={effectiveOrientation}
      className={twMerge(effectiveOrientation === 'vertical' ? 'mx-1.5' : 'my-1.5 w-9', className)}
      {...props}
    />
  )
}

Toolbar.Group = ToolbarGroup
Toolbar.Separator = ToolbarSeparator
Toolbar.Item = Item

export type { ToggleItemProps, ToolbarGroupProps, ToolbarProps, ToolbarSeparatorProps }
export { Toolbar }
