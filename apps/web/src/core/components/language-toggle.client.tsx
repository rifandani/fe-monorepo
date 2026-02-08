'use client'

import { setUserLocaleAction } from '@/core/actions/i18n'
import { Button, Menu, MenuContent, MenuHeader, MenuItem, MenuSection } from '@/core/components/ui'
import type { I18NLocale } from '@/core/constants/i18n'
import { Icon } from '@iconify/react'
import { useLocale, useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import * as React from 'react'
import type { Selection } from 'react-stately'
import { toast } from 'sonner'

export function LanguageToggle() {
  const locale = useLocale()
  const t = useTranslations()
  const { executeAsync, isPending } = useAction(setUserLocaleAction)

  return (
    <Menu>
      <Button intent="outline" data-slot="menu-trigger">
        <Icon
          icon={locale === 'en' ? 'flag:us-1x1' : 'flag:id-1x1'}
          className="size-6"
        />
      </Button>

      <MenuContent
        selectionMode="single"
        selectedKeys={new Set([locale])}
        onSelectionChange={async (_selection) => {
          const selection = _selection as Exclude<Selection, 'all'> & {
            currentKey: I18NLocale
          }

          const result = await executeAsync(selection.currentKey)

          if (result?.serverError) {
            toast.error(result.serverError)
          }
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t('language')}</MenuHeader>

          <MenuItem id="en" isDisabled={isPending}>English</MenuItem>
          <MenuItem id="id" isDisabled={isPending}>Indonesia</MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  )
}
