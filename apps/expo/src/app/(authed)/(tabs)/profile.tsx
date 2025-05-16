import Feather from '@expo/vector-icons/Feather'
import { nativeApplicationVersion } from 'expo-application'
import { Image } from 'expo-image'
import { H6, ListItem, Paragraph, Separator, useTheme, XStack, YStack } from 'tamagui'
import { BaseErrorBoundary } from '@/core/components/base-error-boundary'
import { BaseButton } from '@/core/components/button/base-button'
import { BLURHASH } from '@/core/constants/global'
import { useAppStore } from '@/core/hooks/use-app-store'
import { translate } from '@/core/providers/i18n/translate'
import { ProfileLanguageChanger } from '@/user/components/profile-language-changer'
import { ProfileListItem } from '@/user/components/profile-list-item'
import { ProfileThemeChanger } from '@/user/components/profile-theme-changer'
import { useGetUser } from '@/user/hooks/use-get-user'

function EditProfileSection() {
  const user = useAppStore(state => state.user)
  const { data } = useGetUser(user
    ? {
        id: user.id,
      }
    : undefined)

  return (
    <XStack mb="$3" height="$10" gap="$5">
      <Image
        source={data?.image}
        placeholder={BLURHASH}
        transition={1_000}
        contentFit="fill"
        style={{ width: 100, borderRadius: 1_000 }}
      />

      <YStack flex={1}>
        <H6 size="$4">{data?.username}</H6>
        <Paragraph size="$3">{data?.email}</Paragraph>

        <BaseButton mt="auto" p="$2" width="$12" icon={<Feather name="edit" />}>
          {translate('user:editProfile')}
        </BaseButton>
      </YStack>
    </XStack>
  )
}

function LogoutListItem() {
  const theme = useTheme()
  const resetUser = useAppStore(state => state.resetUser)

  const $red10 = theme?.red10?.get() || ''

  return (
    <ProfileListItem
      pressStyle={{
        radiused: true,
        bg: '$red2',
      }}
      icon={<Feather name="log-out" color={$red10} />}
      iconAfter={<Feather name="chevron-right" color={$red10} />}
      onPress={() => {
        resetUser()
      }}
    >
      <ListItem.Text color="$red10">
        Logout
      </ListItem.Text>
    </ProfileListItem>
  )
}

export const ErrorBoundary = BaseErrorBoundary

export default function TabsProfileScreen() {
  return (
    <YStack flex={1} p="$3" pt="$6">
      <EditProfileSection />
      <ProfileThemeChanger />
      <ProfileLanguageChanger />

      <Separator my="$2" />

      <LogoutListItem />
      <Paragraph mt="auto" size="$2" text="center">
        {translate('common:appVersion')}
        {' '}
        {nativeApplicationVersion}
      </Paragraph>
    </YStack>
  )
}
