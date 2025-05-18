import type { BaseSheetState } from '@/core/components/sheet/types'
import Feather from '@expo/vector-icons/Feather'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ListItem, Separator, YGroup } from 'tamagui'
import { BaseSheet } from '@/core/components/sheet/base-sheet'
import { ProfileListItem } from '@/user/components/profile-list-item'

export function ProfileLanguageChanger() {
  const { t, i18n } = useTranslation()
  const [state, setState] = useState<BaseSheetState>({ open: false, position: 0 })

  return (
    <>
      <ProfileListItem
        title={t('common.language')}
        icon={<Feather name="globe" />}
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
              theme="light"
              title="English"
              iconAfter={i18n.resolvedLanguage === 'en' ? <Feather testID="profile-language-english-checked" name="check-circle" size={20} /> : undefined}
              onPress={() => i18n.changeLanguage('en-US')}
            />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem
              pressTheme
              title="Indonesia"
              iconAfter={i18n.resolvedLanguage === 'id' ? <Feather testID="profile-language-indonesia-checked" name="check-circle" size={20} /> : undefined}
              onPress={() => i18n.changeLanguage('id-ID')}
            />
          </YGroup.Item>
        </YGroup>
      </BaseSheet>
    </>
  )
}
