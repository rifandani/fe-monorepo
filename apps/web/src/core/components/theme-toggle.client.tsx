'use client'

import type { BasicColorMode } from '@workspace/core/hooks/use-color-mode'
import type { Selection } from 'react-stately'
import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Button, Menu } from '@/core/components/ui'

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

      <Menu.Content
        selectionMode="single"
        selectedKeys={new Set([theme as string])}
        onSelectionChange={(_selection) => {
          const selection = _selection as Exclude<Selection, 'all'> & {
            currentKey: 'system' | BasicColorMode
          }
          setTheme(selection.currentKey)
        }}
      >
        <Menu.Section>
          <Menu.Header separator>{t('theme')}</Menu.Header>

          <Menu.Item id="system">{t('system')}</Menu.Item>
          <Menu.Item id="light">{t('light')}</Menu.Item>
          <Menu.Item id="dark">{t('dark')}</Menu.Item>
        </Menu.Section>
      </Menu.Content>
    </Menu>
  )
}
