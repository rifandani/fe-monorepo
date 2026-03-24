import type { HeaderBackButtonProps } from '@/core/types/navigation'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import { BaseButton } from '@/core/components/button/base-button'

export function HeaderLeft({ canGoBack }: HeaderBackButtonProps) {
  const router = useRouter()

  return (
    <BaseButton
      transparent
      circular
      size="$3"
      mr="$3"
      icon={<Feather name="chevron-left" size={20} />}
      onPress={() => {
        if (canGoBack)
          router.back()
        else router.push('/')
      }}
    />
  )
}
