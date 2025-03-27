'use client'

import type { BasicColorMode } from '@workspace/core/hooks/use-color-mode'
import type { Selection } from 'react-stately'
import { Button, Menu } from '@/core/components/ui'
import { useI18n } from '@/core/hooks/use-i18n'
import { Icon } from '@iconify/react'
import { useColorMode } from '@workspace/core/hooks/use-color-mode'

export function ThemeToggle() {
  const [t] = useI18n()
  const [theme, setTheme] = useColorMode()

  return (
    <Menu>
      <Button appearance="outline">
        <Icon
          icon={
            theme === 'auto'
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
            currentKey: 'auto' | BasicColorMode
          }
          setTheme(selection.currentKey)
        }}
      >
        <Menu.Section>
          <Menu.Header separator>{t('theme')}</Menu.Header>

          <Menu.Item id="auto">{t('system')}</Menu.Item>
          <Menu.Item id="light">{t('light')}</Menu.Item>
          <Menu.Item id="dark">{t('dark')}</Menu.Item>
        </Menu.Section>
      </Menu.Content>
    </Menu>
  )
}
