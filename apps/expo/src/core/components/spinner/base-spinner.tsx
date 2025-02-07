import { presetVariantColor } from '@/core/constants/theme'
import { Spinner, styled } from 'tamagui'

export const BaseSpinner = styled(Spinner, {
  name: 'BaseSpinner',
  variants: presetVariantColor,
  defaultVariants: {
    preset: 'default',
  },
})
