import type { BaseSheetProps, BaseSheetState } from '@/core/components/sheet/types'
import { useCallback } from 'react'
import { Sheet } from 'tamagui'

export function BaseSheet<T extends BaseSheetState>({
  state,
  setState,
  sheetProps,
  frameProps,
  children,
}: BaseSheetProps<T>) {
  const onOpenChange = useCallback(
    (open: boolean) => {
      setState({ ...state, open })
    },
    [setState, state],
  )
  const onPositionChange = useCallback(
    (position: number) => {
      setState({ ...state, position })
    },
    [setState, state],
  )

  return (
    <Sheet
      modal
      dismissOnSnapToBottom
      snapPointsMode="percent"
      snapPoints={[75, 50, 25]}
      zIndex={100_000}
      open={state.open}
      forceRemoveScrollEnabled={state.open}
      position={state.position}
      onOpenChange={onOpenChange}
      onPositionChange={onPositionChange}
      animation="medium"
      {...sheetProps}
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />

      <Sheet.Handle
        theme="blue"
      />

      <Sheet.Frame
        theme="blue"
        {...frameProps}
      >
        {children}
      </Sheet.Frame>
    </Sheet>
  )
}
