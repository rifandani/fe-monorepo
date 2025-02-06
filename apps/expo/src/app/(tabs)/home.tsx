import { CheckAuthWrapper } from '@/core/components/check-auth-wrapper'
import { translate } from '@/core/providers/i18n/translate'
import { SafeAreaView } from 'react-native-safe-area-context'
import { H1, styled, YStack } from 'tamagui'

const SAV = styled(SafeAreaView, {
  name: 'SAV',
  flex: 1,
  justify: 'center',
})

export default function TabsHomeScreen() {
  return (
    <SAV>
      <CheckAuthWrapper>
        <YStack flex={1} p="$3">
          <H1>{translate('home:title')}</H1>
        </YStack>
      </CheckAuthWrapper>
    </SAV>
  )
}
