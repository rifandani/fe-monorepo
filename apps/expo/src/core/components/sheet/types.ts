import type { ComponentPropsWithRef, Dispatch, PropsWithChildren, SetStateAction } from 'react'
import type { Sheet } from 'tamagui'

export interface BaseSheetState { open: boolean, position: number }
export type BaseSheetProps<T> = PropsWithChildren<{
  state: T
  setState: Dispatch<SetStateAction<T>>
  sheetProps?: ComponentPropsWithRef<typeof Sheet>
  frameProps?: ComponentPropsWithRef<typeof Sheet.Frame>
}>
