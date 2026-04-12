import type { LocaleDictLanguage } from '@workspace/core/libs/i18n/init'
import type { Selection } from 'react-stately'
import { Button, Menu, MenuContent, MenuHeader, MenuItem, MenuSection } from '@/core/components/ui'
import { useTranslation } from '@/core/providers/i18n/context'

export function LanguageToggle() {
  const { t, setLocale, locale } = useTranslation()

  return (
    <Menu>
      <Button intent="plain">
        {locale === 'en-us' ? 'English' : 'Indonesia'}
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

          <MenuItem id="en-us" className="mt-1">English</MenuItem>
          <MenuItem id="id-id">Indonesia</MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  )
}
