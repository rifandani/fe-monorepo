import type { LocaleDictLanguage } from '@workspace/core/locales/locale.type'
import type { Selection } from 'react-stately'
import { Button, Menu } from '@/core/components/ui'
import { useI18n } from '@/core/hooks/use-i18n'
import { Icon } from '@iconify/react'
import { useLocale } from 'react-aria'

export function LanguageToggle() {
  const { locale } = useLocale()
  const [t, { changeLocale }] = useI18n()

  return (
    <Menu>
      <Button appearance="plain">
        <Icon
          icon={locale === 'en-US' ? 'flag:us-1x1' : 'flag:id-1x1'}
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
          changeLocale(selection.currentKey)
        }}
      >
        <Menu.Section>
          <Menu.Header separator>{t('language')}</Menu.Header>

          <Menu.Item id="en-US">English</Menu.Item>
          <Menu.Item id="id-ID">Indonesia</Menu.Item>
        </Menu.Section>
      </Menu.Content>
    </Menu>
  )
}
