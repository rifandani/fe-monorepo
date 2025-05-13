import type { BaseSheetState } from '@/core/components/sheet/types'
import Feather from '@expo/vector-icons/Feather'
import React, { useState } from 'react'
import { ListItem, Separator, YGroup } from 'tamagui'
import { BaseSheet } from '@/core/components/sheet/base-sheet'
import { useAppStore } from '@/core/hooks/use-app-store'
import { translate } from '@/core/providers/i18n/translate'
import { ProfileListItem } from '@/user/components/profile-list-item'

export function ProfileThemeChanger() {
  const theme = useAppStore(state => state.theme)
  const setTheme = useAppStore(state => state.setTheme)
  const [state, setState] = useState<BaseSheetState>({ open: false, position: 0 })

  return (
    <>
      <ProfileListItem
        title={translate('common:theme')}
        icon={<Feather name="moon" />}
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
              title={translate('common:light')}
              icon={<Feather name="sun" size={20} />}
              iconAfter={theme === 'light' ? <Feather name="check-circle" size={20} /> : undefined}
              onPress={() => setTheme('light')}
            />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem
              pressTheme
              title={translate('common:dark')}
              icon={<Feather name="moon" size={20} />}
              iconAfter={theme === 'dark' ? <Feather name="check-circle" size={20} /> : undefined}
              onPress={() => setTheme('dark')}
            />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem
              pressTheme
              title={translate('common:system')}
              icon={<Feather name="tablet" size={20} />}
              iconAfter={
                theme === 'system' ? <Feather name="check-circle" size={20} /> : undefined
              }
              onPress={() => setTheme('system')}
            />
          </YGroup.Item>
        </YGroup>
      </BaseSheet>
    </>
  )
}
