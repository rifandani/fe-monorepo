import Feather from '@expo/vector-icons/Feather'
import { nativeApplicationVersion } from 'expo-application'
import { Image } from 'expo-image'
import { getToken, getTokens, getTokenValue, H6, ListItem, Paragraph, Separator, XStack, YStack } from 'tamagui'
import { BaseButton } from '@/core/components/button/base-button'
import { BLURHASH } from '@/core/constants/global'
import { useAppStore } from '@/core/hooks/use-app-store'
import { translate } from '@/core/providers/i18n/translate'
import { ProfileListItem } from '@/user/components/profile-list-item'
import { ProfileThemeChanger } from '@/user/components/profile-theme-changer'
import { useGetUser } from '@/user/hooks/use-get-user'

export default function TabsProfileScreen() {
  const user = useAppStore(state => state.user)
  const resetUser = useAppStore(state => state.resetUser)
  const { data } = useGetUser({
    // `user` should not be `null`, we already check it in `CheckAuthWrapper` component in _layout
    id: user!.id,
  })

  return (
    <YStack flex={1} p="$3">
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

      <ProfileListItem title="Favourites" icon={<Feather name="heart" />} />
      <ProfileListItem title="Downloads" icon={<Feather name="download" />} />

      <Separator my="$2" />

      <ProfileThemeChanger />
      <ProfileListItem title="Language" icon={<Feather name="globe" />} />

      <Separator my="$2" />

      <ProfileListItem title="Clear cache" icon={<Feather name="trash" />} />
      <ProfileListItem title="Clear history" icon={<Feather name="file" />} />
      <ProfileListItem
        pressStyle={{
          background: 'red',
        }}
        icon={<Feather name="log-out" color={getToken('$color.red10', 'color', true)} />}
        iconAfter={<Feather name="chevron-right" color={getTokenValue('$color.red1')} />}
        onPress={() => {
          resetUser()
        }}
      >
        <ListItem.Text color="$red10">
          {JSON.stringify(getTokens({ prefixed: true }).color)}
          Logout
        </ListItem.Text>
      </ProfileListItem>

      <Paragraph text="center" color="slategray">
        {translate('common:appVersion')}
        {' '}
        {nativeApplicationVersion}
      </Paragraph>
    </YStack>
  )
}
