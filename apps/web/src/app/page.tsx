import { getTranslations } from 'next-intl/server'
import { LanguageToggle } from '@/core/components/language-toggle.client'
import { ProfileMenu } from '@/core/components/profile-menu.client'
import { ThemeToggle } from '@/core/components/theme-toggle.client'
import { WelcomeMessage } from '@/core/components/welcome-message.client'
import { createMetadata, createWebPage, createWebSite, JsonLd } from '@/core/utils/seo'

const title = 'Home'
const description = 'Welcome to our Next.js application. Explore our modern, feature-rich web platform with theme customization, multi-language support, and user profiles.'
const ldParams = {
  url: process.env.NODE_ENV === 'production' ? 'https://rifandani.com' : 'http://localhost:3002',
  title,
  description,
}

export const metadata = createMetadata({
  title,
  description,
})

export default async function HomePage() {
  const t = await getTranslations()

  return (
    <div
      className="container mx-auto flex flex-col items-center gap-y-2 py-24 duration-300"
    >
      <h1 className="text-3xl sm:text-4xl">{t('title')}</h1>
      <h2 className="font-mono text-xl sm:text-2xl">{t('welcome')}</h2>
      <WelcomeMessage />

      <div className="flex items-center gap-x-2">
        <ThemeToggle />
        <LanguageToggle />
        <ProfileMenu username="Get From Cookies" />
      </div>

      <JsonLd
        graphs={[
          createWebSite(ldParams),
          createWebPage(ldParams),
        ]}
      />
    </div>
  )
}
