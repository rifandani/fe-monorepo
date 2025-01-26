import type { Selection } from 'react-aria-components'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { useToaster } from '@/core/hooks/use-toaster.hook'
import { Icon } from '@iconify/react'
import { Button } from '@workspace/core/components/button'
import {
  Menu,
  MenuHeader,
  MenuItem,
  MenuPopover,
  MenuSection,
  MenuTrigger,
} from '@workspace/core/components/menu'
import {
  type BasicColorMode,
  useColorMode,
} from '@workspace/core/hooks/use-color-mode.hook'

export function NavbarMenuTheme() {
  const [t] = useI18n()
  const [_, { setProps }] = useToaster()
  const [theme, setTheme] = useColorMode({})

  return (
    <MenuTrigger>
      <Button size="icon" variant="outline">
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

      <MenuPopover>
        <Menu
          selectionMode="single"
          selectedKeys={new Set([theme as string])}
          onSelectionChange={(_selection) => {
            const selection = _selection as Exclude<Selection, 'all'> & {
              currentKey: 'auto' | BasicColorMode
            }
            setTheme(selection.currentKey)
            setProps(prev => ({
              ...prev,
              theme:
                selection.currentKey === 'auto'
                  ? 'system'
                  : selection.currentKey,
            }))
          }}
        >
          <MenuSection>
            <MenuHeader separator>{t('theme')}</MenuHeader>

            <MenuItem id="auto">{t('system')}</MenuItem>
            <MenuItem id="light">{t('light')}</MenuItem>
            <MenuItem id="dark">{t('dark')}</MenuItem>
          </MenuSection>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  )
}
