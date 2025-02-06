import { BaseButton } from '@/core/components/button/base-button'
import { BLURHASH } from '@/core/constants/global'
import { useAppStore } from '@/core/hooks/use-app-store'
import { translate } from '@/core/providers/i18n/translate'
import { ProfileListItem } from '@/user/components/profile-list-item'
import { ProfileThemeChanger } from '@/user/components/profile-theme-changer'
import { useGetUser } from '@/user/hooks/use-get-user'
import Feather from '@expo/vector-icons/Feather'
import { nativeApplicationVersion } from 'expo-application'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { getTokenValue, H6, ListItem, Paragraph, Separator, XStack, YStack } from 'tamagui'

export default function TabsProfileScreen() {
  const { push } = useRouter()
  const user = useAppStore(state => state.user)
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
          <H6 background="$backgroundTransparent">{data?.username}</H6>
          <Paragraph>{data?.email}</Paragraph>

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
      <ProfileListItem title="Display" icon={<Feather name="tv" />} />
      <ProfileListItem title="Feed preferences" icon={<Feather name="phone" />} />
      <ProfileListItem title="Subscriptions" icon={<Feather name="credit-card" />} />

      <Separator my="$2" />

      <ProfileListItem title="Clear cache" icon={<Feather name="trash" />} />
      <ProfileListItem title="Clear history" icon={<Feather name="file" />} />
      <ProfileListItem
        pressStyle={{
          background: '$red2',
        }}
        icon={<Feather name="log-out" color={getTokenValue('$color.10')} />}
        iconAfter={<Feather name="chevron-right" color={getTokenValue('$color.10')} />}
        onPress={() => {
          push('/login')
        }}
      >
        <ListItem.Text color="$red10">Logout</ListItem.Text>
      </ProfileListItem>

      <Paragraph text="center" marginEnd="auto" color="slategray">
        {translate('common:appVersion')}
        {' '}
        {nativeApplicationVersion}
      </Paragraph>
    </YStack>
  )
}
