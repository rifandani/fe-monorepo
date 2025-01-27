import type { LocaleDictLanguage } from '@workspace/core/locales/locale.type'
import type { Selection } from 'react-stately'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { Icon } from '@iconify/react'
import { Button } from '@workspace/core/components/button'
import { Menu, MenuHeader, MenuItem, MenuPopover, MenuSection, MenuTrigger } from '@workspace/core/components/menu'
import { useLocale } from 'react-aria'

export function LanguageToggle() {
  const { locale } = useLocale()
  const [t, { changeLocale }] = useI18n()

  return (
    <MenuTrigger>
      <Button size="icon" variant="outline">
        <Icon
          icon={locale === 'en-US' ? 'flag:us-1x1' : 'flag:id-1x1'}
          className="size-6"
        />
      </Button>

      <MenuPopover>
        <Menu
          selectionMode="single"
          selectedKeys={new Set([locale])}
          onSelectionChange={(_selection) => {
            const selection = _selection as Exclude<Selection, 'all'> & {
              currentKey: LocaleDictLanguage
            }
            changeLocale(selection.currentKey)
          }}
        >
          <MenuSection>
            <MenuHeader separator>{t('language')}</MenuHeader>

            <MenuItem id="en-US">English</MenuItem>
            <MenuItem id="id-ID">Indonesia</MenuItem>
          </MenuSection>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  )
}
