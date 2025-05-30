import type { LocaleDictLanguage } from '@workspace/core/libs/i18n/init'
import type { Selection } from 'react-stately'
import { Icon } from '@iconify/react'
import { Button, Menu } from '@/core/components/ui'
import { useTranslation } from '@/core/providers/i18n/context'

export function LanguageToggle() {
  const { t, setLocale, locale } = useTranslation()

  return (
    <Menu>
      <Button appearance="plain">
        <Icon
          icon={locale === 'en-us' ? 'flag:us-1x1' : 'flag:id-1x1'}
          className="size-6"
        />
      </Button>

      <Menu.Content
        selectionMode="single"
        selectedKeys={new Set([locale])}
        onSelectionChange={(_selection) => {
          const selection = _selection as Exclude<Selection, 'all'> & {
            currentKey: LocaleDictLanguage
          }
          setLocale(selection.currentKey)
        }}
      >
        <Menu.Section>
          <Menu.Header separator>{t('language')}</Menu.Header>

          <Menu.Item id="en-us">English</Menu.Item>
          <Menu.Item id="id-id">Indonesia</Menu.Item>
        </Menu.Section>
      </Menu.Content>
    </Menu>
  )
}
