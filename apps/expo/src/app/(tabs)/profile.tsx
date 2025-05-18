import Feather from '@expo/vector-icons/Feather'
import { nativeApplicationVersion } from 'expo-application'
import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { H6, ListItem, Paragraph, Separator, useTheme, XStack, YStack } from 'tamagui'
import { BaseErrorBoundary } from '@/core/components/base-error-boundary'
import { BaseButton } from '@/core/components/button/base-button'
import { BLURHASH } from '@/core/constants/global'
import { useAppStore } from '@/core/hooks/use-app-store'
import { ProfileLanguageChanger } from '@/user/components/profile-language-changer'
import { ProfileListItem } from '@/user/components/profile-list-item'
import { ProfileThemeChanger } from '@/user/components/profile-theme-changer'
import { useGetUser } from '@/user/hooks/use-get-user'

function EditProfileSection() {
  const { t } = useTranslation()
  const user = useAppStore(state => state.user)
  const { data } = useGetUser(user
    ? {
        id: user.id,
      }
    : undefined)

  return (
    <XStack mb="$3" height="$10" gap="$5">
      <Image
        testID="profile-image"
        source={data?.image}
        placeholder={{ blurhash: BLURHASH }}
        transition={1_000}
        contentFit="fill"
        style={{ width: 100, borderRadius: 1_000 }}
      />

      <YStack flex={1}>
        <H6 size="$4">{data?.username}</H6>
        <Paragraph size="$3">{data?.email}</Paragraph>

        <BaseButton mt="auto" p="$2" width="$11" icon={<Feather name="edit" />}>
          {t('user.editProfile')}
        </BaseButton>
      </YStack>
    </XStack>
  )
}

function LogoutListItem() {
  const theme = useTheme()
  const { t } = useTranslation()
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
        {t('common.logout')}
      </ListItem.Text>
    </ProfileListItem>
  )
}

export const ErrorBoundary = BaseErrorBoundary

export default function TabsProfileScreen() {
  const { t } = useTranslation()

  return (
    <YStack flex={1} p="$3" pt={Platform.select({ ios: '$9', android: '$6' })}>
      <EditProfileSection />
      <ProfileThemeChanger />
      <ProfileLanguageChanger />

      <Separator my="$2" />

      <LogoutListItem />
      <Paragraph mt="auto" size="$2" text="center">
        {t('common.appVersion')}
        {' '}
        {nativeApplicationVersion}
      </Paragraph>
    </YStack>
  )
}
