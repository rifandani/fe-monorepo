'use client'

import { Button, Menu, MenuContent, MenuHeader, MenuItem, MenuSection } from '@/core/components/ui'
import { Icon } from '@iconify/react'
import type { BasicColorMode } from '@workspace/core/hooks/use-color-mode'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import type { Selection } from 'react-stately'

export function ThemeToggle() {
  const t = useTranslations()
  const { theme, setTheme } = useTheme()

  return (
    <Menu>
      <Button intent="outline" data-slot="menu-trigger">
        <Icon
          icon={
            theme === 'system'
              ? 'lucide:computer'
              : theme === 'light'
                ? 'lucide:sun'
                : 'lucide:moon'
          }
          className="size-6"
        />
      </Button>

      <MenuContent
        selectionMode="single"
        selectedKeys={new Set([theme as string])}
        onSelectionChange={(_selection) => {
          const selection = _selection as Exclude<Selection, 'all'> & {
            currentKey: 'system' | BasicColorMode
          }
          setTheme(selection.currentKey)
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t('theme')}</MenuHeader>

          <MenuItem id="system">{t('system')}</MenuItem>
          <MenuItem id="light">{t('light')}</MenuItem>
          <MenuItem id="dark">{t('dark')}</MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  )
}
