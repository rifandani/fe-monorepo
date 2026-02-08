import { BaseButton } from '@/core/components/button/base-button'
import { BaseSheet } from '@/core/components/sheet/base-sheet'
import type { BaseSheetState } from '@/core/components/sheet/types'
import { useAppStore } from '@/core/hooks/use-app-store'
import type { HeaderButtonProps } from '@/core/types/navigation'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import * as React from 'react'
import { ListItem, Separator, YGroup } from 'tamagui'

export function HeaderRight(_: HeaderButtonProps) {
  const router = useRouter()
  const resetUser = useAppStore(state => state.resetUser)
  const [state, setState] = React.useState<BaseSheetState>({ open: false, position: 0 })

  return (
    <>
      <BaseButton
        transparent
        circular
        size="$3"
        icon={<Feather name="more-vertical" size={20} />}
        onPress={() => {
          setState({ ...state, open: true })
        }}
      />

      <BaseSheet
        state={state}
        setState={setState}
        sheetProps={{ snapPointsMode: 'fit', snapPoints: undefined }}
        frameProps={{ p: '$5' }}
      >
        <YGroup verticalAlign="center" bordered separator={<Separator />}>
          <YGroup.Item>
            <ListItem
              pressTheme
              title="Profile"
              icon={<Feather name="user" size={20} />}
              iconAfter={<Feather name="chevron-right" size={20} />}
              onPress={() => {
                setState({ ...state, open: false })
                router.push('/profile')
              }}
            />
          </YGroup.Item>

          <YGroup.Item>
            <ListItem
              pressStyle={{ bg: '$red5' }}
              icon={<Feather name="log-out" size={20} color="$red10" />}
              onPress={() => {
                setState({ ...state, open: false })
                resetUser()
                router.push('/login')
              }}
            >
              <ListItem.Text color="$red10">Logout</ListItem.Text>
            </ListItem>
          </YGroup.Item>
        </YGroup>
      </BaseSheet>
    </>
  )
}
