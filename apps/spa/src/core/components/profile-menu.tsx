import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store.hook'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { Icon } from '@iconify/react'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback } from '@workspace/core/components/avatar'
import { Button } from '@workspace/core/components/button'
import { Menu, MenuHeader, MenuItem, MenuPopover, MenuSection, MenuSeparator, MenuTrigger } from '@workspace/core/components/menu'

export function ProfileMenu() {
  const [t] = useI18n()
  const navigate = useNavigate()
  const { user, clearUser } = useAuthUserStore()

  return (
    <MenuTrigger>
      <Button size="icon" variant="ghost" className="rounded-full">
        <Avatar>
          <AvatarFallback>
            {user?.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>

      <MenuPopover>
        <Menu
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
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  )
}
