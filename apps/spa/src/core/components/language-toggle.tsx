import { Button, Menu, MenuContent, MenuHeader, MenuItem, MenuSection } from '@/core/components/ui'
import { useTranslation } from '@/core/providers/i18n/context'
import { Icon } from '@iconify/react'
import type { LocaleDictLanguage } from '@workspace/core/libs/i18n/init'
import type { Selection } from 'react-stately'

export function LanguageToggle() {
  const { t, setLocale, locale } = useTranslation()

  return (
    <Menu>
      <Button intent="plain">
        <Icon
          icon={locale === 'en-us' ? 'flag:us-1x1' : 'flag:id-1x1'}
          className="size-6"
        />
      </Button>

      <MenuContent
        selectionMode="single"
        selectedKeys={new Set([locale])}
        onSelectionChange={(_selection) => {
          const selection = _selection as Exclude<Selection, 'all'> & {
            currentKey: LocaleDictLanguage
          }
          setLocale(selection.currentKey)
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t('language')}</MenuHeader>

          <MenuItem id="en-us">English</MenuItem>
          <MenuItem id="id-id">Indonesia</MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  )
}
