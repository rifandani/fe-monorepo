'use client'

import type { BasicColorMode } from '@workspace/core/hooks/use-color-mode.hook'
import type { Selection } from 'react-stately'
import { Menu } from '@/core/components/ui/menu'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { useToaster } from '@/core/hooks/use-toaster.hook'
import { Icon } from '@iconify/react'
import { useColorMode } from '@workspace/core/hooks/use-color-mode.hook'

export function ThemeToggle() {
  const [t] = useI18n()
  const [, { setToastConfig }] = useToaster()
  const [theme, setTheme] = useColorMode()

  return (
    <Menu>
      <Menu.Trigger>
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
      </Menu.Trigger>

      <Menu.Content
        selectionMode="single"
        selectedKeys={new Set([theme as string])}
        onSelectionChange={(_selection) => {
          const selection = _selection as Exclude<Selection, 'all'> & {
            currentKey: 'auto' | BasicColorMode
          }
          setTheme(selection.currentKey)
          setToastConfig(prev => ({
            ...prev,
            theme:
                selection.currentKey === 'auto'
                  ? 'system'
                  : selection.currentKey,
          }))
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
