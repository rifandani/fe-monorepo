import { Icon } from '@iconify/react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store'
import { Avatar } from '@/core/components/ui/avatar'
import { Menu } from '@/core/components/ui/menu'
import { useI18n } from '@/core/hooks/use-i18n'

export function ProfileMenu() {
  const [t] = useI18n()
  const navigate = useNavigate()
  const { user, clearUser } = useAuthUserStore()

  return (
    <Menu>
      <Menu.Trigger>
        <Avatar initials={user?.username.slice(0, 2).toUpperCase()} />
      </Menu.Trigger>

      <Menu.Content
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
        <Menu.Section>
          <Menu.Header separator>{t('account')}</Menu.Header>

          <Menu.Item id="profile" className="gap-x-2">
            <Icon icon="lucide:user" />
            <span>{t('profile')}</span>
          </Menu.Item>
          <Menu.Item id="settings" className="gap-x-2">
            <Icon icon="lucide:settings" />
            <span>{t('settings')}</span>
          </Menu.Item>
        </Menu.Section>

        <Menu.Separator />

        <Menu.Section>
          <Menu.Item id="logout" className="gap-x-2">
            <Icon icon="lucide:log-out" />
            <p>{t('logout')}</p>
          </Menu.Item>
        </Menu.Section>
      </Menu.Content>
    </Menu>
  )
}
