import { ThemeToggle } from '@/components/theme-toggle.client'

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <ThemeToggle />
    </div>
  )
}
