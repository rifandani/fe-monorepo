import type { Config } from 'tailwindcss'
import config from '@workspace/core/tailwind.config'
import { fontFamily } from 'tailwindcss/defaultTheme'

export default {
  ...config as Config,
  theme: {
    extend: {
      ...config.theme.extend,
      fontFamily: {
        ...config.theme.extend.fontFamily,
        lato: ['Lato', ...fontFamily.sans],
      },
    },
  },
} satisfies Config
