/* eslint-disable react/no-forward-ref */
'use client'

import * as React from 'react'
import {
  Tab as _Tab,
  TabList as _TabList,
  TabPanel as _TabPanel,
  Tabs as _Tabs,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const Tabs = _Tabs

const TabList = React.forwardRef<
  React.ComponentRef<typeof _TabList>,
  React.ComponentPropsWithoutRef<typeof _TabList>
>(({ className, ...props }, ref) => (
  <_TabList
    ref={ref}
    className={values =>
      twMerge(
        'bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1',
        typeof className === 'function' ? className(values) : className,
      )}
    {...props}
  />
))
TabList.displayName = 'TabList'

const Tab = React.forwardRef<
  React.ComponentRef<typeof _Tab>,
  React.ComponentPropsWithoutRef<typeof _Tab>
>(({ className, ...props }, ref) => (
  <_Tab
    ref={ref}
    className={values =>
      twMerge(
        'ring-offset-background data-[selected]:bg-background data-[selected]:text-foreground data-[focus-visible]:ring-ring inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:shadow-sm data-[focus-visible]:outline-none data-[focused]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2',
        typeof className === 'function' ? className(values) : className,
      )}
    {...props}
  />
))
Tab.displayName = 'Tab'

const TabPanel = React.forwardRef<
  React.ComponentRef<typeof _TabPanel>,
  React.ComponentPropsWithoutRef<typeof _TabPanel>
>(({ className, ...props }, ref) => (
  <_TabPanel
    ref={ref}
    className={values =>
      twMerge(
        'ring-offset-background data-[focus-visible]:ring-ring mt-2 data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2',
        typeof className === 'function' ? className(values) : className,
      )}
    {...props}
  />
))
TabPanel.displayName = 'TabPanel'

export { Tab, TabList, TabPanel, Tabs }
