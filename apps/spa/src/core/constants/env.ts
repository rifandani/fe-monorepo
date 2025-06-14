import { z } from 'zod'

export const envSchema = z.object({
  VITE_APP_TITLE: z.string(),
  VITE_API_BASE_URL: z.string().url(),
  VITE_SITE_URL: z.string().url(),
})

export const env = (() => {
  const appTitle = envSchema.shape.VITE_APP_TITLE.parse(
    import.meta.env.VITE_APP_TITLE,
  )
  const apiBaseUrl = envSchema.shape.VITE_API_BASE_URL.parse(
    import.meta.env.VITE_API_BASE_URL,
  )
  const siteUrl = envSchema.shape.VITE_SITE_URL.parse(
    import.meta.env.VITE_SITE_URL,
  )

  return {
    appTitle,
    apiBaseUrl,
    siteUrl,
  }
})()
