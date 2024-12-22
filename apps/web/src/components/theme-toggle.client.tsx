'use client'

import { Icon } from '@iconify/react'
import { Button } from '@workspace/core/components/button'
import { Menu, MenuItem, MenuPopover, MenuTrigger } from '@workspace/core/components/menu'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <MenuTrigger>
      <Button aria-label="Menu" size="icon" variant="outline">
        <Icon icon="lucide:sun" className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Icon icon="lucide:moon" className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      <MenuPopover>
        <Menu>
          <MenuItem onAction={() => setTheme('system')}>System</MenuItem>
          <MenuItem onAction={() => setTheme('light')}>Light</MenuItem>
          <MenuItem onAction={() => setTheme('dark')}>Dark</MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  )
}
