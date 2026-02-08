import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store'
import { Avatar } from '@/core/components/ui/avatar'
import { Menu, MenuContent, MenuHeader, MenuItem, MenuSection, MenuSeparator, MenuTrigger } from '@/core/components/ui/menu'
import { useTranslation } from '@/core/providers/i18n/context'
import { Icon } from '@iconify/react'
import { useNavigate } from '@tanstack/react-router'

export function ProfileMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, clearUser } = useAuthUserStore()

  return (
    <Menu>
      <MenuTrigger>
        <Avatar initials={user?.username?.slice(0, 2).toUpperCase() ?? '??'} />
      </MenuTrigger>

      <MenuContent
        onAction={(key) => {
          const currentKey = key as 'profile' | 'settings' | 'logout'

          if (currentKey === 'logout') {
            clearUser()
            navigate({
              to: '/login',
            })
          }
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t('account')}</MenuHeader>

          <MenuItem id="profile" className="gap-x-2">
            <Icon icon="lucide:user" />
            <span>{t('profile')}</span>
          </MenuItem>
          <MenuItem id="settings" className="gap-x-2">
            <Icon icon="lucide:settings" />
            <span>{t('settings')}</span>
          </MenuItem>
        </MenuSection>

        <MenuSeparator />

        <MenuSection>
          <MenuItem id="logout" className="gap-x-2">
            <Icon icon="lucide:log-out" />
            <p>{t('logout')}</p>
          </MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  )
}
