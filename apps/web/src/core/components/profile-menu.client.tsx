'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import React from 'react'
import { logoutAction } from '@/auth/actions/auth'
import { Avatar } from '@/core/components/ui/avatar'
import { Menu, MenuContent, MenuHeader, MenuItem, MenuSection, MenuSeparator, MenuTrigger } from '@/core/components/ui'

export function ProfileMenu({ username }: { username: string }) {
  const t = useTranslations()
  const { execute, isPending } = useAction(logoutAction)

  return (
    <Menu>
      <MenuTrigger>
        <Avatar initials={username.slice(0, 2).toUpperCase()} />
      </MenuTrigger>

        <MenuContent
        onAction={async (key) => {
          const currentKey = key as 'profile' | 'settings' | 'logout'

          if (currentKey === 'logout') {
            execute()
          }
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t('account')}</MenuHeader>

          <MenuItem id="profile" className="gap-x-2" isDisabled={isPending}>
            <Icon icon="lucide:user" />
            <span>{t('profile')}</span>
          </MenuItem>
          <MenuItem id="settings" className="gap-x-2" isDisabled={isPending}>
            <Icon icon="lucide:settings" />
            <span>{t('settings')}</span>
          </MenuItem>
        </MenuSection>

        <MenuSeparator />

        <MenuSection>
          <MenuItem id="logout" className="gap-x-2" isDisabled={isPending}>
            <Icon icon="lucide:log-out" />
            <p>{t('logout')}</p>
          </MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  )
}
