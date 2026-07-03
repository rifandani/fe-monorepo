import type { ComponentPropsWithoutRef } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { ListItem } from 'tamagui'

export function ProfileListItem(props: ComponentPropsWithoutRef<typeof ListItem>) {
  return (
    <ListItem
      hoverTheme
      pressTheme
      transparent
      iconAfter={<Feather name="chevron-right" />}
      pressStyle={{
        radiused: true,
        bg: '$accent12',
      }}
      {...props}
    />
  )
}
