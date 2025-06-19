'use client'

import { useStringFlagValue } from '@openfeature/react-sdk'

export function WelcomeMessage() {
  // it takes time to load the flag first, then it resolves to the correct value
  const home_welcome_message = useStringFlagValue('home_welcome_message', '')

  return <p className="font-mono text-sm">{home_welcome_message}</p>
}
