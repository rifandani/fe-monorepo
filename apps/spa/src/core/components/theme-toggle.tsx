import type { BasicColorMode } from '@workspace/core/hooks/use-color-mode'
import type { Selection } from 'react-stately'
import { ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useColorMode } from '@workspace/core/hooks/use-color-mode'
import { Button, Menu, MenuContent, MenuHeader, MenuItem, MenuSection } from '@/core/components/ui'
import { useTranslation } from '@/core/providers/i18n/context'

export function ThemeToggle() {
  const { t } = useTranslation()
  const [theme, setTheme] = useColorMode()

  return (
    <Menu>
      <Button intent="outline">
        {theme === 'auto' ? <ComputerDesktopIcon className="size-6" /> : theme === 'light' ? <SunIcon className="size-6" /> : <MoonIcon className="size-6" />}
      </Button>

      <MenuContent
        selectionMode="single"
        selectedKeys={new Set([theme as string])}
        onSelectionChange={(_selection) => {
          const selection = _selection as Exclude<Selection, 'all'> & {
            currentKey: 'auto' | BasicColorMode
          }
          setTheme(selection.currentKey)
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t('theme')}</MenuHeader>

          <MenuItem id="auto" className="mt-1">{t('system')}</MenuItem>
          <MenuItem id="light">{t('light')}</MenuItem>
          <MenuItem id="dark">{t('dark')}</MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  )
}
